# Eureka OS Game Bundles

This directory is reserved for game files that 고라니 explicitly has rights to host.

Allowed:

- User-owned or directly provided `.jsdos` bundles.
- Homebrew, public-license, freeware, or shareware games whose license allows web hosting.
- Metadata in `registry.json` that points only to allowed local bundles.

Not allowed:

- Copying third-party game bundles, ROMs, disk images, screenshots, sounds, or other assets without explicit redistribution permission.
- Uploading commercial games just because they are easy to find online.
- Embedding external game pages in iframes as if they were part of Eureka OS.

Suggested bundle path:

```text
public/games/<slug>/<slug>.jsdos
```

After adding a bundle, register it in `registry.json` with license/source notes.
