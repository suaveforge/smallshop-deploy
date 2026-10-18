#!/usr/bin/env bash
# Dedicated smallshop deployment. Does not install packages, alter runners,
# restart unrelated services, change proxies or modify firewall rules.
set -euo pipefail

SOURCE_DIR="${1:-source}"
PORT="${SMALLSHOP_PORT:-18195}"
IMAGE="${SMALLSHOP_RELEASE_TAG:-smallshop:web}"
CONTAINER="smallshop-web"
APP_LABEL="org.suaveforge.application"
OLD_IMAGE=""

case "$PORT" in
  ''|*[!0-9]*) echo "Invalid port: $PORT"; exit 1 ;;
esac
if [ "$PORT" -lt 1024 ] || [ "$PORT" -gt 65535 ]; then
  echo "Port out of allowed range: $PORT"
  exit 1
fi

test -f "$SOURCE_DIR/Dockerfile"
command -v docker >/dev/null
command -v curl >/dev/null
docker info >/dev/null

# Never replace a container that another project owns.
if docker container inspect "$CONTAINER" >/dev/null 2>&1; then
  owner="$(docker inspect --format '{{ index .Config.Labels "org.suaveforge.application" }}' "$CONTAINER")"
  if [ "$owner" != "smallshop" ]; then
    echo "Refusing: container $CONTAINER is not labeled as smallshop-owned."
    exit 1
  fi
  OLD_IMAGE="$(docker inspect --format '{{.Image}}' "$CONTAINER")"
fi

# A pre-existing listening port is acceptable only when our own named
# container already exists. Fail closed instead of stopping another service.
if command -v ss >/dev/null 2>&1; then
  if ss -H -ltn | awk '{print $4}' | grep -Eq "(:|\.)$PORT$"; then
    if [ -z "$OLD_IMAGE" ]; then
      echo "Refusing: port $PORT belongs to another service."
      exit 1
    fi
  fi
fi

echo "Building image $IMAGE from $SOURCE_DIR"
docker build --tag "$IMAGE" "$SOURCE_DIR"

start_smallshop() {
  local image="$1"
  docker run -d \
    --name "$CONTAINER" \
    --label "$APP_LABEL=smallshop" \
    --restart unless-stopped \
    --publish "127.0.0.1:$PORT:3000" \
    --env NODE_ENV=production \
    --env PORT=3000 \
    --env HOSTNAME=0.0.0.0 \
    --health-cmd="node -e \"require('http').get('http://127.0.0.1:3000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))\"" \
    --health-interval=15s \
    --health-timeout=5s \
    --health-retries=5 \
    --health-start-period=30s \
    "$image"
}

check_smallshop() {
  local health_file="/tmp/smallshop-health-$$.json"
  for i in $(seq 1 25); do
    if curl -fsS --connect-timeout 2 --max-time 5 "http://127.0.0.1:$PORT/api/health" -o "$health_file" && \
      grep -q '"payments":"disabled"' "$health_file" && \
      curl -fsS --max-time 10 -o /dev/null "http://127.0.0.1:$PORT/"; then
      echo "Health: $(cat "$health_file")"
      rm -f "$health_file"
      echo "Success: http://127.0.0.1:$PORT"
      return 0
    fi
    sleep 3
  done
  rm -f "$health_file"
  return 1
}

if [ -n "$OLD_IMAGE" ]; then
  echo "Replacing only the existing smallshop-owned container"
  docker rm -f "$CONTAINER"
fi

if ! start_smallshop "$IMAGE"; then
  echo "Failed to start new smallshop container"
  if [ -n "$OLD_IMAGE" ]; then
    docker rm -f "$CONTAINER" >/dev/null 2>&1 || true
    start_smallshop "$OLD_IMAGE" || true
  fi
  exit 1
fi

if ! check_smallshop; then
  echo "New smallshop instance failed its health check."
  docker logs --tail 60 "$CONTAINER" || true
  docker rm -f "$CONTAINER" || true
  if [ -n "$OLD_IMAGE" ]; then
    echo "Attempting rollback to prior smallshop image"
    start_smallshop "$OLD_IMAGE" || true
  fi
  exit 1
fi

docker ps --filter "name=^/$CONTAINER$" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
