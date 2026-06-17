#!/usr/bin/env bash
set -euo pipefail

HOST=${EUREKA_OS_HOST:-168.107.49.213}
USER=${EUREKA_OS_USER:-ubuntu}
REMOTE_TARGET=${EUREKA_OS_TARGET:-/srv/eureka-os}
LOCAL_TARGET=${EUREKA_OS_LOCAL_TARGET:-/home/ubuntu/openclaw-workspace/projects/eureka-os/dist}
PUBLIC_URL=${EUREKA_OS_PUBLIC_URL:-https://os.eureka.pe.kr/}

npm ci
npm run build

is_local_host() {
  local host="$1"
  [[ "$host" == "localhost" || "$host" == "127.0.0.1" ]] && return 0
  hostname -I 2>/dev/null | tr ' ' '\n' | grep -Fxq "$host" && return 0
  if command -v curl >/dev/null 2>&1; then
    local public_ip
    public_ip=$(curl -fsS --max-time 5 https://ifconfig.me 2>/dev/null || true)
    [[ -n "$public_ip" && "$host" == "$public_ip" ]] && return 0
  fi
  return 1
}

if is_local_host "$HOST" && [[ -d "$(dirname "$LOCAL_TARGET")" ]]; then
  mkdir -p "$LOCAL_TARGET"
  rsync -a --delete dist/ "$LOCAL_TARGET/"
  echo "deployed locally to $LOCAL_TARGET"
else
  tar -czf /tmp/eureka-os-dist.tgz -C dist .
  scp /tmp/eureka-os-dist.tgz "$USER@$HOST:/tmp/eureka-os-dist.tgz"
  ssh "$USER@$HOST" "set -e; sudo mkdir -p '$REMOTE_TARGET'; sudo tar -xzf /tmp/eureka-os-dist.tgz -C '$REMOTE_TARGET'; sudo chown -R root:root '$REMOTE_TARGET'"
  echo "deployed remotely to $USER@$HOST:$REMOTE_TARGET"
fi

curl -fsS "$PUBLIC_URL" >/dev/null
echo "verified $PUBLIC_URL"
