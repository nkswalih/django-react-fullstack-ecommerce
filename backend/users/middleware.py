import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

logger = logging.getLogger(__name__)
User = get_user_model()


class CookieJWTMiddleware:
    """
    PASSIVE middleware — only sets request.user when Django's session auth
    has left it as AnonymousUser AND a valid JWT cookie is present.

    This covers non-DRF views (admin panel, Django templates, etc.) that
    rely on request.user but don't go through DRF's authentication pipeline.

    For DRF views, CookieJWTAuthentication (authentication.py) is the
    authoritative authenticator. This middleware intentionally does NOT
    override a user that DRF has already set, because DRF runs its own
    authentication after middleware.

    ── Why this order matters ──────────────────────────────────────────────
    Django middleware runs first (including this file), then DRF's view
    dispatch calls authenticators. If this middleware set request.user and
    DRF's authenticator later returned None (expired token), DRF would
    reset request.user to AnonymousUser anyway — making this middleware's
    work pointless for DRF views.

    The correct pattern: DRF views rely on CookieJWTAuthentication.
    This middleware is a convenience for the Django layer only.

    ── Add to MIDDLEWARE in settings.py ───────────────────────────────────
    Place AFTER 'django.contrib.auth.middleware.AuthenticationMiddleware':

        MIDDLEWARE = [
            ...
            'django.contrib.auth.middleware.AuthenticationMiddleware',
            'users.middleware.CookieJWTMiddleware',  # ← here
            ...
        ]
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only act if Django session auth has not already authenticated the user.
        # isinstance check is safe because AnonymousUser is always the fallback.
        if isinstance(request.user, AnonymousUser):
            self._try_attach_jwt_user(request)

        response = self.get_response(request)
        return response

    def _try_attach_jwt_user(self, request):
        token = request.COOKIES.get("access_token")
        if not token:
            return

        try:
            validated = AccessToken(token)
            user = User.objects.get(id=validated["user_id"])

            if not user.is_active:
                return  # Deactivated user — leave as AnonymousUser

            request.user = user

        except User.DoesNotExist:
            # Token references a deleted user — leave as AnonymousUser
            logger.warning(
                "CookieJWTMiddleware: JWT references non-existent user_id=%s",
                validated.payload.get("user_id") if "validated" in dir() else "unknown",
            )

        except TokenError as exc:
            # Expired or invalid token — leave as AnonymousUser.
            # Do NOT log expired tokens at warning level — they are expected
            # every 15 minutes and would flood the logs.
            detail = str(exc).lower()
            if "token is expired" not in detail and "token_not_valid" not in detail:
                logger.warning("CookieJWTMiddleware: Unexpected TokenError: %s", exc)

        except Exception as exc:
            # Safety net — never crash a request from middleware.
            logger.error("CookieJWTMiddleware: Unexpected error: %s", exc, exc_info=True)