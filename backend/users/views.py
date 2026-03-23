from django.db import OperationalError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import LoginSerializer, RegisterSerializer, UserSerializer, get_tokens


def is_admin(user):
    return bool(user.is_authenticated and user.role == 'Admin')


def database_error_response():
    return Response(
        {'detail': 'Database is not ready. Run migrations and try again.'},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
        except OperationalError:
            return database_error_response()

        return Response(
            {
                'user': UserSerializer(user).data,
                'tokens': get_tokens(user),
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
        except OperationalError:
            return database_error_response()

        return Response(
            {
                'user': UserSerializer(user).data,
                'tokens': get_tokens(user),
            }
        )


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
            users = User.objects.all()
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
