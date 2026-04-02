#!/bin/sh
set -eu

export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-core.settings.development}"
export PORT="${PORT:-8000}"

wait_for_db() {
  python - <<'PY'
import os
import sys
import time

import psycopg2

deadline = time.time() + int(os.environ.get("DB_WAIT_TIMEOUT", "60"))
params = {
    "dbname": os.environ.get("DB_NAME", "ecommerce"),
    "user": os.environ.get("DB_USER", "postgres"),
    "password": os.environ.get("DB_PASSWORD", "postgres"),
    "host": os.environ.get("DB_HOST", "db"),
    "port": os.environ.get("DB_PORT", "5432"),
}

last_error = None
while time.time() < deadline:
    try:
        connection = psycopg2.connect(**params)
        connection.close()
        print("PostgreSQL is available.")
        sys.exit(0)
    except psycopg2.OperationalError as exc:
        last_error = exc
        print("Waiting for PostgreSQL...", flush=True)
        time.sleep(2)

print(f"Database connection failed: {last_error}", file=sys.stderr)
sys.exit(1)
PY
}

echo "Waiting for database connection..."
wait_for_db

echo "Applying database migrations..."
python manage.py migrate --noinput

if [ "${DJANGO_COLLECTSTATIC:-1}" = "1" ]; then
  echo "Collecting static files..."
  python manage.py collectstatic --noinput
fi

if [ "${DJANGO_BOOTSTRAP_DATA:-0}" = "1" ]; then
  echo "Checking whether initial data bootstrap is needed..."
  python manage.py bootstrap_initial_data
fi

if [ "${DJANGO_ENV:-development}" = "production" ]; then
  echo "Starting Gunicorn..."
  exec gunicorn core.wsgi:application \
    --bind "0.0.0.0:${PORT}" \
    --workers "${GUNICORN_WORKERS:-3}" \
    --timeout "${GUNICORN_TIMEOUT:-120}" \
    --access-logfile - \
    --error-logfile -
fi

echo "Starting Django development server..."
exec python manage.py runserver "0.0.0.0:${PORT}"
