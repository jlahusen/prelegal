#!/usr/bin/env bash
# Shared Docker helpers behind the start/stop scripts.
set -euo pipefail

IMAGE_NAME=prelegal
CONTAINER_NAME=prelegal
PORT=8000
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

wait_for_health() {
  for _ in $(seq 1 90); do
    if curl -fsS "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "Prelegal did not become healthy. Check: docker logs $CONTAINER_NAME" >&2
  return 1
}

start_app() {
  cd "$PROJECT_ROOT"
  docker build -t "$IMAGE_NAME" .
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true

  env_args=()
  if [ -f .env ]; then
    env_args=(--env-file .env)
  fi

  docker run -d --name "$CONTAINER_NAME" -p "$PORT:8000" \
    ${env_args[@]+"${env_args[@]}"} "$IMAGE_NAME" >/dev/null
  wait_for_health
  echo "Prelegal is running at http://localhost:$PORT"
}

stop_app() {
  docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
  echo "Prelegal stopped. Its database went with the container."
}
