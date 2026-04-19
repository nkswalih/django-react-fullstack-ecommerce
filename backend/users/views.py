import logging
from django.db import OperationalError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings
import requests as http_requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from .tokens import password_reset_token
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

from .models import User
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer

logger = logging.getLogger(__name__)

ACCESS_TOKEN_MAX_AGE = 60 * 15
REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7
REFRESH_TOKEN_REMEMBER_MAX_AGE = 60 * 60 * 24 * 30


def is_admin(user):
    return user.is_authenticated and user.role == "Admin"


def db_error_response():
    return Response(
        {"detail": "Service temporarily unavailable. Please try again."},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


def set_auth_cookies(response, tokens, remember=False):
    kwargs = dict(
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        path="/",
    )

    refresh_max_age = REFRESH_TOKEN_REMEMBER_MAX_AGE if remember else REFRESH_TOKEN_MAX_AGE

    response.set_cookie(
        "refresh_token",
        tokens["refresh"],
        max_age=refresh_max_age,
        **kwargs,
    )

    response.set_cookie(
        "access_token",
        tokens["access"],
        max_age=ACCESS_TOKEN_MAX_AGE,
        **kwargs,
    )

    response.set_cookie(
        "remember_me",
        "true" if remember else "",
        httponly=False,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        path="/",
        max_age=REFRESH_TOKEN_REMEMBER_MAX_AGE if remember else 0,
    )


def clear_access_token(response):
    response.delete_cookie("access_token", path="/", domain=None)
    response.delete_cookie("remember_me", path="/", domain=None)


def clear_auth_cookies(response):
    response.delete_cookie("access_token", path="/", domain=None)
    response.delete_cookie("refresh_token", path="/", domain=None)
    response.delete_cookie("remember_me", path="/", domain=None)


def parse_positive_int(value, default):
    try:
        return max(int(value), 0)
    except (TypeError, ValueError):
        return default


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
        except OperationalError:
            return db_error_response()

        tokens = get_tokens(user)
        response = Response({"user": UserSerializer(user).data}, status=status.HTTP_201_CREATED)
        set_auth_cookies(response, tokens)
        return response


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data, context={"request": request})
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data["user"]
        except OperationalError:
            return db_error_response()

        remember = str(request.data.get("remember", "false")).lower() == "true"
        tokens = get_tokens(user)
        response = Response({"user": UserSerializer(user).data})
        set_auth_cookies(response, tokens, remember)
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"detail": "Logged out."})
        clear_auth_cookies(response)
        return response


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.COOKIES.get("refresh_token")
        remember_me = request.COOKIES.get("remember_me") == "true"

        if not token:
            response = Response(
                {"detail": "No refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_access_token(response)
            return response

        try:
            refresh = RefreshToken(token)
            user_id = refresh.payload.get("user_id")
            user = User.objects.get(id=user_id)

            if not user.is_active or user.status != "Active":
                raise TokenError("User account is disabled.")

            new_refresh = RefreshToken.for_user(user)
            tokens = {
                "access": str(new_refresh.access_token),
                "refresh": str(new_refresh),
            }

            try:
                refresh.blacklist()
            except Exception as blacklist_err:
                logger.warning(f"Failed to blacklist refresh token: {blacklist_err}")

            response = Response({"detail": "Token refreshed successfully."})
            set_auth_cookies(response, tokens, remember=remember_me)
            return response

        except (TokenError, User.DoesNotExist):
            response = Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_auth_cookies(response)
            return response


class ForgetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"details": "If account exists, email sent."})

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = password_reset_token.make_token(user)

        reset_url = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

        html_content = render_to_string("emails/reset_password.html", {
            "name": user.name,
            "reset_url": reset_url,
        })

        email_msg = EmailMultiAlternatives(
            subject="Reset your password",
            body=f"Click the link to reset your password: {reset_url}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )

        email_msg.attach_alternative(html_content, "text/html")
        email_msg.send()

        return Response({"details": "If account exists. email sent"})


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        password = request.data.get("password")

        if not all([uid, token, password]):
            return Response({"detail": "uid, token and password are required."}, status=400)

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
        except Exception:
            return Response({"detail": "Invalid link"}, status=400)

        if not password_reset_token.check_token(user, token):
            return Response({"detail": "Token expired or invalid"}, status=400)

        user.set_password(password)
        user.save()
        return Response({"detail": "Password reset successful"})


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        access_token = request.data.get("access_token")
        credential = request.data.get("credential")
        code = request.data.get("code")

        id_info = None

        if code:
            try:
                token_resp = http_requests.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "code": code,
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "redirect_uri": request.data.get("redirect_uri", ""),
                        "grant_type": "authorization_code",
                    },
                    timeout=3,
                )
                if token_resp.status_code != 200:
                    return Response(
                        {"detail": "Failed to exchange Google auth code."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                tokens_json = token_resp.json()
                id_info = id_token.verify_oauth2_token(
                    tokens_json.get("id_token", ""),
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID,
                )
            except ValueError as e:
                return Response(
                    {"detail": f"Invalid Google token: {e}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            except http_requests.RequestException:
                return Response(
                    {"detail": "Google API unreachable."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        elif access_token:
            try:
                resp = http_requests.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"},
                    timeout=3,
                )
                if resp.status_code != 200:
                    return Response(
                        {"detail": "Failed to fetch Google user info."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                id_info = resp.json()
            except http_requests.RequestException:
                return Response(
                    {"detail": "Google API unreachable."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        elif credential:
            try:
                id_info = id_token.verify_oauth2_token(
                    credential,
                    google_requests.Request(),
                    settings.GOOGLE_CLIENT_ID,
                    clock_skew_in_seconds=10,
                )
            except ValueError as e:
                return Response(
                    {"detail": f"Invalid Google token: {e}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            return Response(
                {"detail": "No Google token provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not id_info:
            return Response(
                {"detail": "Invalid Google response."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not id_info.get("email_verified"):
            return Response(
                {"detail": "Google email not verified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        google_id = id_info["sub"]
        email = id_info["email"]
        name = id_info.get("name", email.split("@")[0])
        avatar = id_info.get("picture")

        existing_user = User.objects.filter(google_id=google_id).first()
        if existing_user:
            user = existing_user
        else:
            user = User.objects.filter(email=email).first()
            if user:
                user.google_id = google_id
                user.avatar = avatar or user.avatar
                user.save(update_fields=["google_id", "avatar", "updated_at"])
            else:
                user = User.objects.create_user(email=email, name=name, password=None)
                user.google_id = google_id
                user.avatar = avatar
                user.status = "Active"
                user.save(update_fields=["google_id", "avatar", "status", "updated_at"])

        if user.status != "Active" or not user.is_active:
            return Response(
                {"detail": "Your account has been deactivated."},
                status=status.HTTP_403_FORBIDDEN,
            )

        tokens = get_tokens(user)
        response = Response({"user": UserSerializer(user).data})
        set_auth_cookies(response, tokens, remember=False)
        return response


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            return Response(UserSerializer(request.user).data)
        except OperationalError:
            return db_error_response()

    def patch(self, request):
        try:
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except OperationalError:
            return db_error_response()


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            users = User.objects.all().order_by("-created_at")
            params = request.GET

            if "limit" in params or "offset" in params:
                limit = parse_positive_int(params.get("limit"), 10)
                offset = parse_positive_int(params.get("offset"), 0)
                return Response({
                    "results": UserSerializer(users[offset:offset + limit] if limit else users.none(), many=True).data,
                    "total": users.count(),
                    "limit": limit,
                    "offset": offset,
                })

            return Response(UserSerializer(users, many=True).data)
        except OperationalError:
            return db_error_response()


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(pk=pk)
            serializer = UserSerializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except OperationalError:
            return db_error_response()

    def delete(self, request, pk):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            User.objects.get(pk=pk).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except OperationalError:
            return db_error_response()