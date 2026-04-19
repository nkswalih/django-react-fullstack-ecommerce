from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User


class CookieJWTAuthentication(BaseAuthentication):
    """
    Reads the JWT access token from the HttpOnly 'access_token' cookie.

    Return behaviour:
      - No cookie          → return None  (DRF treats request as anonymous)
      - Token EXPIRED      → return None  (DRF treats as anonymous → 401 from
                                           IsAuthenticated permission → interceptor
                                           catches 401 → triggers /token/refresh/)
      - Token structurally
        invalid/tampered   → raise AuthenticationFailed (403-like, no retry)
      - User not found     → raise AuthenticationFailed
      - Valid token        → return (user, None)

    Why return None for expired instead of raising?
    ─────────────────────────────────────────────────
    DRF has two failure modes:
      • authenticate() returns None  → request is "unauthenticated"
                                       → IsAuthenticated returns HTTP 401
                                       → frontend interceptor fires /token/refresh/
      • authenticate() raises        → request is "authentication failed"
                                       → DRF may return HTTP 403 depending on version
                                       → frontend interceptor does NOT fire (checks 401)

    For expired tokens we want the interceptor to fire, so we must return None.
    For structurally broken tokens (wrong key, tampered payload) retrying makes
    no sense — raising AuthenticationFailed is correct there.
    """

    def authenticate(self, request):
        token = request.COOKIES.get("access_token")
        if not token:
            return None

        try:
            validated = AccessToken(token)
            user = User.objects.get(id=validated["user_id"])
            return (user, None)

        except User.DoesNotExist:
            raise AuthenticationFailed("User not found.")

        except TokenError as exc:
            # simplejwt raises TokenError for both expiry and structural problems.
            # The exception detail for expiry is a dict with code "token_not_valid"
            # and messages containing "Token is expired" or "token_not_valid".
            #
            # We check the string representation because simplejwt's TokenError
            # stores detail as either a string or an ErrorDetail object.
            detail = str(exc).lower()

            # Expired token → unauthenticated (let interceptor refresh)
            if "token is expired" in detail or "token_not_valid" in detail:
                return None

            # Structurally bad token → hard failure, no retry
            raise AuthenticationFailed("Invalid token.")

        except Exception:
            # Any other unexpected error → treat as unauthenticated to avoid
            # leaking internal errors. Log this in production.
            return None

    def authenticate_header(self, request):
        # Returning "Bearer" causes DRF to emit WWW-Authenticate: Bearer
        # on 401 responses, which is the correct HTTP spec behaviour.
        return "Bearer"