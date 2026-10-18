#!/usr/bin/env bash
set -euo pipefail
PORT="${SMALLSHOP_PORT:-18195}"
curl --fail --silent --show-error "http://127.0.0.1:$PORT/api/health"
echo
