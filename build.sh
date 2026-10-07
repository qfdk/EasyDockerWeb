#!/bin/bash
set -euo pipefail

# Credentials are mandatory. Pass them in, or a random password is generated.
EDW_USERNAME="${EDW_USERNAME:-admin}"
if [ -z "${EDW_PASSWORD:-}" ]; then
  EDW_PASSWORD="$(openssl rand -base64 18)"
  GENERATED=1
fi
EDW_SESSION_SECRET="${EDW_SESSION_SECRET:-$(openssl rand -hex 32)}"
EDW_BIND="${EDW_BIND:-127.0.0.1}"

echo "🔨 Building Docker image..."
docker build -t easy-docker-web .

echo "🚀 Starting container..."
docker run -d \
  --name easy-docker-web \
  -p "${EDW_BIND}:3000:3000" \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e EDW_USERNAME="${EDW_USERNAME}" \
  -e EDW_PASSWORD="${EDW_PASSWORD}" \
  -e EDW_SESSION_SECRET="${EDW_SESSION_SECRET}" \
  easy-docker-web

echo "✅ Container started! Access the application at http://${EDW_BIND}:3000"
if [ "${GENERATED:-0}" = "1" ]; then
  echo "🔑 Login: ${EDW_USERNAME} / ${EDW_PASSWORD}  (shown once, store it safely)"
fi
