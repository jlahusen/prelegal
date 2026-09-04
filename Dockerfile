# --- Stage 1: build the frontend into static files ---
FROM node:22-alpine AS frontend

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# --- Stage 2: serve the API and those static files from one process ---
FROM python:3.13-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev

COPY backend/app ./app
COPY catalog.json ./catalog.json
COPY --from=frontend /build/out ./static

ENV PATH="/app/.venv/bin:$PATH" \
    DATABASE_PATH=/data/prelegal.db \
    STATIC_DIR=/app/static \
    CATALOG_PATH=/app/catalog.json

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
