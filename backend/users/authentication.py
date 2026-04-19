from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User


class CookieJWTAuthentication(BaseAuthentication):
    """
    Custom DRF authenticator that reads JWT from HttpOnly cookie.
    
    BUG 3 FIX: Returns None for expired tokens instead of raising AuthenticationFailed.
    This makes DRF treat it as unauthenticated (responses get 401 on protected routes)
    rather than 403. Only raise for structurally invalid tokens to prevent retry loops.
    """

    def authenticate(self, request):
        token = request.COOKIES.get("access_token")
        if not token:
            return None

        try:
            validated = AccessToken(token)
            user = User.objects.get(id=validated["user_id"])
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found.")
        except TokenError as e:
            error_msg = str(e).lower()
            if "token_not_valid" in error_msg or "expired" in error_msg:
                return None
            raise AuthenticationFailed("Invalid or expired token.")
        except Exception:
            return None

        return (user, None)

    def authenticate_header(self, request):
        return "Bearer"