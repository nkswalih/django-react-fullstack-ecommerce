import logging
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

logger = logging.getLogger(__name__)
User = get_user_model()


class CookieJWTMiddleware:
    """
    Django middleware that attaches request.user from JWT cookie before the view runs.
    
    Purpose: Views using request.user always get the authenticated user without
    needing to call the authenticator manually.
    
    Add to MIDDLEWARE in settings.py AFTER AuthenticationMiddleware:
        'users.middleware.CookieJWTMiddleware'
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        self._authenticate(request)
        response = self.get_response(request)
        return response

    def _authenticate(self, request):
        token = request.COOKIES.get("access_token")
        if not token:
            return

        try:
            validated = AccessToken(token)
            user = User.objects.get(id=validated["user_id"])
            request.user = user
            request.auth = None
        except User.DoesNotExist:
            logger.warning(f"User from JWT token not found: user_id={validated.get('user_id')}")
        except TokenError as e:
            error_msg = str(e).lower()
            if "token_not_valid" in error_msg or "expired" in error_msg:
                return
            logger.warning(f"Invalid JWT token: {e}")
        except Exception as e:
            logger.error(f"Unexpected error in CookieJWTMiddleware: {e}")