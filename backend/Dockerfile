FROM python:3.14-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /build

RUN apt-get update \
    && apt-get install --yes --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt requirements.txt

RUN python -m pip install --upgrade pip \
    && pip wheel --wheel-dir /wheels -r requirements.txt

FROM python:3.14-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update \
    && apt-get install --yes --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /wheels /wheels
COPY backend/requirements.txt /tmp/requirements.txt

RUN python -m pip install --upgrade pip \
    && pip install --no-index --find-links=/wheels -r /tmp/requirements.txt \
    && pip install gunicorn==23.0.0 \
    && rm -rf /wheels /tmp/requirements.txt

COPY docker/backend/entrypoint.sh /entrypoint.sh
COPY backend/ /app/

RUN chmod +x /entrypoint.sh \
    && adduser --disabled-password --gecos "" appuser \
    && mkdir -p /app/staticfiles /app/media \
    && chown -R appuser:appuser /app /entrypoint.sh

USER appuser

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
