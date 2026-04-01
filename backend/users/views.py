from django.db import OperationalError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings

from .models import User
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer, get_tokens


# ─── Helpers ──────────────────────────────────────────────────────────────────

def is_admin(user):
    return user.is_authenticated and user.role == "Admin"


def db_error_response():
    return Response(
        {"detail": "Service temporarily unavailable. Please try again."},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


def set_auth_cookies(response, tokens, remember=False):
    is_production = not settings.DEBUG

    kwargs = dict(
        httponly=True,
        secure=is_production,
        samesite="Lax",
        path="/",            # ✅ critical — must match delete_cookie
    )

    access_max_age  = 60 * 60 * 24 * 7 if remember else 60 * 60 * 24
    refresh_max_age = 60 * 60 * 24 * 7

    response.set_cookie("access_token",  tokens["access"],  max_age=access_max_age,  **kwargs)
    response.set_cookie("refresh_token", tokens["refresh"], max_age=refresh_max_age, **kwargs)


def clear_auth_cookies(response):
    is_production = not settings.DEBUG
    response.delete_cookie("access_token", path="/", samesite="Lax", secure=is_production)
    response.delete_cookie("refresh_token", path="/", samesite="Lax", secure=is_production)


def parse_positive_int(value, default):
    try:
        return max(int(value), 0)
    except (TypeError, ValueError):
        return default


# ─── Auth Views ───────────────────────────────────────────────────────────────

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
        except OperationalError:
            return db_error_response()

        tokens   = get_tokens(user)
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
        tokens   = get_tokens(user)
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
        from rest_framework_simplejwt.tokens import RefreshToken
        from rest_framework_simplejwt.exceptions import TokenError

        token = request.COOKIES.get("refresh_token")
        if not token:
            return Response({"detail": "No refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh  = RefreshToken(token)
            tokens   = {"access": str(refresh.access_token), "refresh": str(refresh)}
            response = Response({"detail": "Token refreshed."})
            set_auth_cookies(response, tokens)
            return response
        except TokenError:
            return Response({"detail": "Invalid or expired refresh token."}, status=status.HTTP_401_UNAUTHORIZED)


# ─── Profile ──────────────────────────────────────────────────────────────────

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


# ─── Admin ────────────────────────────────────────────────────────────────────

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            users  = User.objects.all().order_by("-created_at")
            params = request.GET

            if "limit" in params or "offset" in params:
                limit  = parse_positive_int(params.get("limit"), 10)
                offset = parse_positive_int(params.get("offset"), 0)
                return Response({
                    "results": UserSerializer(users[offset:offset + limit] if limit else users.none(), many=True).data,
                    "total":   users.count(),
                    "limit":   limit,
                    "offset":  offset,
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
            user       = User.objects.get(pk=pk)
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
