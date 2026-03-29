# ---------- Base image (backend) ----------
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# System libs needed by psycopg2-binary
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
         build-essential \
         libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ---------- Install Python dependencies ----------
FROM base AS deps

COPY app/backend/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip \
    && pip install -r /tmp/requirements.txt

# ---------- Build React frontend ----------
FROM node:20-alpine AS frontend-build

WORKDIR /frontend
COPY app/frontend/vite-project/package.json app/frontend/vite-project/package-lock.json ./
RUN npm ci
COPY app/frontend/vite-project/ ./

# Bake the API URL so the built JS points to /api (proxied by Nginx)
ENV VITE_API_URL=""
RUN npm run build

# ---------- Final backend image ----------
FROM base AS runtime

COPY --from=deps /usr/local /usr/local
COPY app ./app
COPY --from=frontend-build /frontend/dist /app/static

RUN mkdir -p /app/data

ENV PORT=8080
EXPOSE ${PORT}

CMD uvicorn app.backend.main:app --host 0.0.0.0 --port $PORT