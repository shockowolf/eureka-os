#!/usr/bin/env bash
set -euo pipefail
HOST=${EUREKA_OS_HOST:-168.107.49.213}
USER=${EUREKA_OS_USER:-ubuntu}
TARGET=${EUREKA_OS_TARGET:-/srv/eureka-os}
npm ci
npm run build
tar -czf /tmp/eureka-os-dist.tgz -C dist .
scp /tmp/eureka-os-dist.tgz "$USER@$HOST:/tmp/eureka-os-dist.tgz"
ssh "$USER@$HOST" "set -e; sudo mkdir -p '$TARGET'; sudo tar -xzf /tmp/eureka-os-dist.tgz -C '$TARGET'; sudo chown -R root:root '$TARGET'"
curl -fsS https://os.eureka.pe.kr/ >/dev/null
curl -fsS https://os.eureka.pe.kr/system-log.json >/dev/null
echo 'deployed https://os.eureka.pe.kr/'
