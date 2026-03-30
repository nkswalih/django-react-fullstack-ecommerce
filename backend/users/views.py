from django.db import OperationalError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.conf import settings

from .models import User
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer, get_tokens


def is_admin(user):
    return bool(user.is_authenticated and user.role == 'Admin')


def database_error_response():
    return Response(
        {'detail': 'Database is not ready. Run migrations and try again.'},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


def set_auth_cookies(response, tokens, remember=False):
    """Set HttpOnly secure cookies for access and refresh tokens."""
    is_production = not settings.DEBUG

    cookie_kwargs = dict(
        httponly=True,
        secure=is_production,
        samesite="Lax",
    )

    if remember:
        # ✅ persistent cookies
        response.set_cookie(
            "access_token",
            tokens['access'],
            max_age=60 * 60 * 24 * 7,  # 7 days
            **cookie_kwargs
        )
        response.set_cookie(
            "refresh_token",
            tokens['refresh'],
            max_age=60 * 60 * 24 * 7,
            **cookie_kwargs
        )
    else:
        # ✅ session cookies
        response.set_cookie("access_token", tokens['access'], **cookie_kwargs)
        response.set_cookie("refresh_token", tokens['refresh'], **cookie_kwargs)


def parse_positive_int(value, default):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default
    return max(parsed, 0)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
        except OperationalError:
            return database_error_response()

        tokens = get_tokens(user)
        response = Response({'user': UserSerializer(user).data}, status=201)
        set_auth_cookies(response, tokens)
        return response


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
        except OperationalError:
            return database_error_response()

        tokens = get_tokens(user)
        response = Response({'user': UserSerializer(user).data})
        remember = str(request.data.get("remember", "false")).lower() == "true"
        set_auth_cookies(response, tokens, remember)
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({'detail': 'Logged out.'})
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            return Response(UserSerializer(request.user).data)
        except OperationalError:
            return database_error_response()

    def patch(self, request):
        try:
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except OperationalError:
            return database_error_response()


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            params = request.GET
            users = User.objects.all().order_by('-created_at')

            if 'limit' in params or 'offset' in params:
                total = users.count()
                limit = parse_positive_int(params.get('limit'), 10)
                offset = parse_positive_int(params.get('offset'), 0)
                paginated_users = users[offset:offset + limit] if limit > 0 else users.none()

                return Response({
                    'results': UserSerializer(paginated_users, many=True).data,
                    'total': total,
                    'limit': limit,
                    'offset': offset,
                })

            return Response(UserSerializer(users, many=True).data)
        except OperationalError:
            return database_error_response()


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
            return database_error_response()

    def delete(self, request, pk):
        if not is_admin(request.user):
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except OperationalError:
            return database_error_response()
