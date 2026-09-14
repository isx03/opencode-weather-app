# 02-weather

Weather CLI app built with Bun + TypeScript using the OpenMeteo API.

## Runtime & toolchain

- **Runtime:** Bun (`bun run index.ts`)
- **Module system:** ESM (`"type": "module"` in package.json), `"module": "Preserve"` in tsconfig
- **TypeScript:** Strict mode enabled; `noEmit: true` (Bun runs TS directly, no build step)
- **No lint/test/format config exists yet** — if you add tooling, keep it simple

## Key files

- `index.ts` — sole entrypoint (currently a stub)
- `package.json` — `bun.lock` is the lockfile, not `package-lock.json`

## External APIs

The app uses two OpenMeteo endpoints in sequence:

1. **Geocoding** — `https://geocoding-api.open-meteo.com/v1/search?name=...&count=1&language=es&format=json`
2. **Forecast** — `https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current=temperature_2m`

No API key required.

## Conventions

- README and UI strings are in Spanish — keep them in Spanish
- Menu-driven CLI (no web server)
- The goal is to produce a **compiled binary** (`bun build --compile`)
