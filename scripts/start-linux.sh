#!/usr/bin/env bash
# Build and start Prelegal on http://localhost:8000
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/docker-app.sh"
start_app
