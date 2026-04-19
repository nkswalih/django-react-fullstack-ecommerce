"""Base settings shared across all environments."""

from datetime import timedelta
from pathlib import Path

from decouple import Csv, config

BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_SECRET_KEY = "django-insecure-change-me-before-production"

SECRET_KEY = config("SECRET_KEY", default=DEFAULT_SECRET_KEY)
DEBUG = config("DEBUG", default=False, cast=bool)

ALLOWED_HOSTS = config(
    "ALLOWED_HOSTS",
    default="127.0.0.1,localhost",
    cast=Csv(),
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = config("CORS_ALLOWED_ORIGINS", default="", cast=Csv())
CORS_ALLOW_CREDENTIALS = True  # Required: lets browsers send cookies cross-origin
CSRF_TRUSTED_ORIGINS = config("CSRF_TRUSTED_ORIGINS", default="", cast=Csv())

# ─── Apps ─────────────────────────────────────────────────────────────────────

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",  # Required for refresh.blacklist()
    "users",
    "products",
    "orders",
    "cart",
    "wishlist",
]

# ─── Middleware ────────────────────────────────────────────────────────────────

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",       # Must be first — before any response
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "users.middleware.CookieJWTMiddleware",        # After AuthenticationMiddleware
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"
ASGI_APPLICATION = "core.asgi.application"

# ─── Database ─────────────────────────────────────────────────────────────────

default_database = {
    "ENGINE": config("DB_ENGINE", default="django.db.backends.postgresql"),
    "NAME": config("DB_NAME", default="ecommerce"),
    "USER": config("DB_USER", default="postgres"),
    "PASSWORD": config("DB_PASSWORD", default="postgres"),
    "HOST": config("DB_HOST", default="localhost"),
    "PORT": config("DB_PORT", default="5432"),
    "CONN_MAX_AGE": config("DB_CONN_MAX_AGE", default=60, cast=int),
    "CONN_HEALTH_CHECKS": True,
}

db_sslmode = config("DB_SSLMODE", default="")
if db_sslmode:
    default_database["OPTIONS"] = {"sslmode": db_sslmode}

DATABASES = {"default": default_database}

# ─── Auth ─────────────────────────────────────────────────────────────────────

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTH_USER_MODEL = "users.User"

# ─── DRF ──────────────────────────────────────────────────────────────────────

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        # Only CookieJWTAuthentication — never add simplejwt's default JWTAuthentication
        # here, it reads from the Authorization header and would conflict with our
        # cookie-based flow, potentially running before ours and raising on expiry.
        "users.authentication.CookieJWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        # IsAuthenticated as the global default is the safe choice.
        # Views that need public access explicitly declare AllowAny.
        # With AllowAny as the default, any view you forget to annotate
        # is silently public — a security hole in a production app.
        "rest_framework.permissions.IsAuthenticated",
    ),
}

# ─── simplejwt ────────────────────────────────────────────────────────────────

SIMPLE_JWT = {
    # Access token: short-lived, always 15 minutes regardless of remember_me.
    # The cookie max_age matches this. Never increase this — the whole point
    # of short-lived access tokens is to limit the damage from a leaked token.
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),

    # Refresh token internal lifetime: set to 30 days (the maximum, for
    # remember_me sessions). Non-remember sessions are controlled by the
    # cookie max_age (7 days), which expires the cookie before the token does.
    # The token's own exp claim is always 30 days, but without the cookie
    # the browser never sends it — so in practice a non-remember session
    # effectively expires in 7 days.
    "REFRESH_TOKEN_LIFETIME": timedelta(days=30),

    # CRITICAL: Disable automatic rotation.
    # Our TokenRefreshView does manual rotation (RefreshToken.for_user + blacklist).
    # If simplejwt's automatic rotation is also enabled, it conflicts:
    #   1. simplejwt tries to rotate internally
    #   2. Our view also rotates
    #   3. The old token gets blacklisted twice → IntegrityError or silent failure
    #   4. The new token may be invalidated before the Set-Cookie response lands
    # Result: refresh succeeds on the backend but the browser gets a cookie
    # it cannot use, causing an immediate re-logout on the next request.
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,

    # Keep last_login current — useful for "active sessions" features
    "UPDATE_LAST_LOGIN": True,

    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,

    # These are only used if you ever switch to Authorization header flow.
    # They have no effect on our cookie-based auth but are good to define.
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",

    # The claim simplejwt uses to look up the user — must match your User model's PK field.
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ─── Cookie security ──────────────────────────────────────────────────────────
#
# These are read by set_auth_cookies() in views.py.
# They MUST be defined here — Django's built-in defaults for these are for
# Django's own session cookie, but we reuse the setting names for consistency.
#
# SESSION_COOKIE_SECURE:
#   True  → cookie only sent over HTTPS (required in production)
#   False → cookie sent over HTTP (acceptable in local dev with HTTP)
#   Set via environment: SESSION_COOKIE_SECURE=true in .env.production
#
# SESSION_COOKIE_SAMESITE:
#   "Lax"    → cookie sent on same-site requests AND on top-level cross-site
#              navigations (e.g. Google OAuth redirect back to your app).
#              This is what you need for Google OAuth to work.
#   "Strict" → cookie NOT sent on any cross-site request, including OAuth
#              redirects. This would break your Google login flow.
#   "None"   → sent everywhere, requires Secure=True. Only for true cross-site APIs.

SESSION_COOKIE_SECURE = config("SESSION_COOKIE_SECURE", default=False, cast=bool)
SESSION_COOKIE_SAMESITE = "Lax"
SESSION_COOKIE_HTTPONLY = True  # Only applies to Django's own session cookie

# ─── Internationalisation ─────────────────────────────────────────────────────

LANGUAGE_CODE = "en-us"
TIME_ZONE = config("TIME_ZONE", default="Asia/Kolkata")
USE_I18N = True
USE_TZ = True

# ─── Static & Media ───────────────────────────────────────────────────────────

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ─── External services ────────────────────────────────────────────────────────

GOOGLE_CLIENT_ID     = config("GOOGLE_CLIENT_ID",     default="")
GOOGLE_CLIENT_SECRET = config("GOOGLE_CLIENT_SECRET", default="")

RAZORPAY_KEY_ID     = config("RAZORPAY_KEY_ID",     default="")
RAZORPAY_KEY_SECRET = config("RAZORPAY_KEY_SECRET", default="")

# ─── Email ────────────────────────────────────────────────────────────────────

FRONTEND_URL      = config("FRONTEND_URL")
DEFAULT_FROM_EMAIL = config("DEFAULT_FROM_EMAIL")
EMAIL_BACKEND     = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST        = config("EMAIL_HOST")
EMAIL_PORT        = config("EMAIL_PORT")
EMAIL_USE_TLS     = config("EMAIL_USE_TLS")
EMAIL_HOST_USER   = config("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD")

# ─── Fixtures / migration helpers ─────────────────────────────────────────────

BOOTSTRAP_FIXTURE_PATH = config(
    "BOOTSTRAP_FIXTURE_PATH",
    default=str(BASE_DIR / "sqlite_data.json"),
)
SQLITE_IMPORT_PATH = config(
    "SQLITE_IMPORT_PATH",
    default=str(BASE_DIR / "db.sqlite3"),
)