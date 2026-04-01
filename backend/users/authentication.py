from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User


class CookieJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get("access_token")
        if not token:
            return None

        try:
            validated = AccessToken(token)
            user = User.objects.get(id=validated["user_id"])
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found.")
        except TokenError:
            raise AuthenticationFailed("Invalid or expired token.")

        return (user, None)

    def authenticate_header(self, request):
        return "Bearer"
