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
  - Three custom themes: `classic-gray`, `meadow-blue`, `atelier`.
  - App placeholders for AgentRoom, UniPlan, Documents, Notes, Game Lab, Terminal, Settings.
  - CSS pixel-office background with agent workstations/status badges.
- Validation run: `npm run build` passes locally after UI/brand refinement.

## Integration notes for reviewers

- UI intentionally avoids Microsoft/Windows/Molroo logos, product UI names, exact assets, and exact system UI copies. It uses generic geometric glyphs and custom theme names.
- Game Lab is a safe shell only: no molroo game bundles/ROMs/assets are copied. Use only user-owned, directly provided, or public-license js-dos bundles; external originals open as new-tab shortcuts rather than iframes/rehosts. Game registry placeholders now exist at `public/games/README.md`, `public/games/registry.json`, and `docs/GAME_LAB.md`.
- Deployment should use a dedicated web root and Caddy block for `os.eureka.pe.kr`; see `DEPLOYMENT.md`.
- Latest external check: `http://os.eureka.pe.kr` redirects to HTTPS and `https://os.eureka.pe.kr` returns HTTP 200 from Caddy. SSH to `168.107.49.213:22` still times out from this environment, so direct server deployment remains blocked here unless another channel has server access.

## Suggested next implementation tasks

1. Replace placeholder app content with real project links once routing/targets are confirmed.
2. Add keyboard accessibility polish for launcher/window controls.
3. Add a small status/config file if deployment needs runtime link targets without rebuilding.
4. Implement Game Lab registry loading only after game bundle licenses/ownership are confirmed.
