# Game Lab Design

Game Lab is a safe emulator-app shell for future js-dos/DOSBox-style games.

## Current scope

- Shows bundle slots and registry location in the Eureka OS UI.
- Keeps the registry limited to rights-cleared local bundles.
- Does not install `js-dos` yet because no licensed bundle is present.
- Does not include ROMs, commercial game assets, copied site files, or third-party UI assets.

## Future implementation path

1. Add a rights-cleared `.jsdos` bundle under `public/games/<slug>/`.
2. Add metadata to `public/games/registry.json`:
   - title
   - slug
   - bundle path
   - license
   - source URL or ownership note
3. Add the js-dos dependency and a lazy-loaded runner component.
4. Keep third-party sites out of the shell unless explicit hosting/embedding permission exists.

## Legal rule

Private use does not automatically permit copying or integrating someone else's ROMs/game bundles into this repo or public deployment. Use only assets 고라니 owns or assets with clear redistribution/web-hosting permission.
