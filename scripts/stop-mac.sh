#!/usr/bin/env bash
# Stop and remove the Prelegal container.
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/docker-app.sh"
stop_app
