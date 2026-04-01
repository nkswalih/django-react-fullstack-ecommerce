from .base import *

DEBUG = True

ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://localhost:5173",
]

CSRF_TRUSTED_ORIGINS = [
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://localhost:5173",
]

# No HTTPS enforcement in dev
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
