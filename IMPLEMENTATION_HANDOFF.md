# Implementation Handoff

Role split for current team-mode work:

- 과메기 (implementation/main): React/Vite MVP, local build verification, git commits, integration notes.
- 공작 (UI/brand): review visual direction, naming tone, icon language, and whether the retro desktop feels original enough.
- 비버 (deployment/Caddy/TLS): own server-side deployment, Caddy host block, DNS/TLS handshake fix, and production copy of `dist/`.
- 고슴도치 (legal/security): review trademark/lookalike risk, auth/privacy/security notes, and public exposure risks.

## Current implementation state

- Repo: `/Users/gorani/.openclaw/workspace/projects/eureka-os`
- Stack: React + TypeScript + Vite, static output in `dist/`.
- MVP features:
  - Desktop-like launcher and taskbar.
  - Multiple app windows with open/minimize/close/focus.
  - Draggable window titlebars on pointer devices.
  - Three custom themes: `atelier`, `retro95`, `glass`.
  - App placeholders for AgentRoom, UniPlan, Documents, Notes, Terminal, Settings.
- Validation run: `npm run build` passes locally.

## Integration notes for reviewers

- UI intentionally avoids Windows/Molroo logos, names, exact assets, and exact system UI copies. It uses generic geometric glyphs and custom theme names.
- Deployment should use a dedicated web root and Caddy block for `os.eureka.pe.kr`; see `DEPLOYMENT.md`.
- Current external check found `http://os.eureka.pe.kr` redirects to HTTPS via Caddy, but HTTPS fails TLS handshake from local curl. Treat as 비버-owned server/TLS blocker before public launch.

## Suggested next implementation tasks

1. Replace placeholder app content with real project links once routing/targets are confirmed.
2. Add keyboard accessibility polish for launcher/window controls.
3. Add a small status/config file if deployment needs runtime link targets without rebuilding.
