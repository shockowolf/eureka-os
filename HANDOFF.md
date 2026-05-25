# Eureka OS Handoff

## 2026-05-25 MVP + deployment

- Local project: `/Users/gorani/.openclaw/workspace/projects/eureka-os`
- Stack: React + TypeScript + Vite, static build output in `dist/`
- Local git commit: `274a273 Initial Eureka OS MVP`
- Deployed URL: `https://os.eureka.pe.kr/`
- Server: Chuncheon (`100.126.69.81` via Tailscale, public `168.107.49.213`)
- Remote app dir: `/home/ubuntu/openclaw-workspace/projects/eureka-os/dist`
- Caddy is in Docker compose project: `/home/ubuntu/openclaw-workspace/projects/eureka-test`
- Caddy config uses a dedicated host block only:

```caddy
os.eureka.pe.kr {
    encode gzip
    root * /srv/eureka-os
    file_server
}
```

- Compose mount added:

```yaml
- /home/ubuntu/openclaw-workspace/projects/eureka-os/dist:/srv/eureka-os:ro
```

- Existing `eureka.pe.kr` root and subpaths were not used for this project.
- Backups created on server before Caddy/compose edit:
  - `/home/ubuntu/easierp-backups/eureka-Caddyfile-before-eureka-os-20260525_092557`
  - `/home/ubuntu/easierp-backups/eureka-compose-before-eureka-os-20260525_092557`

## Verification

- `npm run build` passed locally.
- Caddy config validated in Docker before/after restart.
- `https://os.eureka.pe.kr/` returns HTTP 200 and title `Eureka OS`.
- `https://eureka.pe.kr/` still returns title `Eureka Growth AI | AI 마케팅 자동화`.

## GitHub status

- `gh` CLI is not installed in this environment.
- GitHub SSH probe to `github.com:22` timed out, so remote repo creation/push was not completed from this subagent.
