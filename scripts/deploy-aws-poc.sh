#!/bin/bash
set -euo pipefail

cd /opt/adaptly

rollback_image=adaptly-poc:rollback
if docker image inspect adaptly-poc:latest >/dev/null 2>&1; then
  docker tag adaptly-poc:latest "$rollback_image"
fi

docker build --pull -f Dockerfile.aws-poc -t adaptly-poc:latest .
docker rm -f adaptly-poc >/dev/null 2>&1 || true
docker run -d --name adaptly-poc --restart unless-stopped \
  -p 127.0.0.1:8787:8787 \
  -v /var/lib/adaptly/state:/var/lib/adaptly/state \
  adaptly-poc:latest

for attempt in $(seq 1 45); do
  if curl --fail --silent --show-error http://127.0.0.1:8787/ -o /dev/null 2>/dev/null; then
    docker image prune --force >/dev/null
    echo "Adaptly deployment is healthy."
    exit 0
  fi
  sleep 2
done

echo "The new container did not become healthy; checking its logs." >&2
docker logs --tail 100 adaptly-poc >&2 || true
docker rm -f adaptly-poc >/dev/null 2>&1 || true
if docker image inspect "$rollback_image" >/dev/null 2>&1; then
  echo "Restoring the previous app image." >&2
  docker run -d --name adaptly-poc --restart unless-stopped \
    -p 127.0.0.1:8787:8787 \
    -v /var/lib/adaptly/state:/var/lib/adaptly/state \
    "$rollback_image"
fi
exit 1
