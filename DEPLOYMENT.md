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
