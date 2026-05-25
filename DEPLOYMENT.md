# Deployment Notes

Target domain: `https://os.eureka.pe.kr`

This app is a static Vite build. Deploy only the `dist/` output to a dedicated directory for `os.eureka.pe.kr`.

## Build

```bash
npm ci
npm run build
```

## Recommended Caddy block

Do not mount this under `eureka.pe.kr/os` and do not change the existing main-site root.

```caddy
os.eureka.pe.kr {
    encode gzip
    root * /srv/eureka-os
    file_server
}
```

## Safe server checklist

1. Back up the existing Caddyfile before editing.
2. Create/use a dedicated web root, e.g. `/srv/eureka-os`.
3. Copy only the contents of local `dist/` into that directory.
4. Validate Caddy config before reload:

```bash
caddy validate --config /etc/caddy/Caddyfile
caddy reload --config /etc/caddy/Caddyfile
```

Current known blocker: `http://os.eureka.pe.kr` reaches Caddy and redirects to HTTPS, but HTTPS currently fails during TLS handshake. That likely means the host block/certificate issuance path needs server-side Caddy inspection.

## Immediate deployment automation

GitHub Actions workflow: `.github/workflows/deploy-os.yml`

Required repository secrets:

- `EUREKA_OS_HOST` = `168.107.49.213` or reachable Tailscale/VPN host
- `EUREKA_OS_USER` = `ubuntu`
- `EUREKA_OS_SSH_KEY` = private SSH key allowed to write/deploy on the server

After secrets are set, every push to `main` builds and deploys `dist/` to `/srv/eureka-os`, then verifies `https://os.eureka.pe.kr/`.

Manual fallback:

```bash
EUREKA_OS_HOST=168.107.49.213 EUREKA_OS_USER=ubuntu scripts/deploy-manual.sh
```
