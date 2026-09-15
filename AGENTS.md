# 02-weather

Weather CLI app built with Bun + TypeScript using the OpenMeteo API.

## Runtime & toolchain

- **Runtime:** Bun (`bun run src/index.ts`)
- **Module system:** ESM (`"type": "module"` in package.json), `"module": "Preserve"` in tsconfig
- **TypeScript:** Strict mode enabled; `noEmit: true` (Bun runs TS directly, no build step)
- **Tests:** `bun test` (runner de Bun) con los tests en `tests/` — ver sección **Testing** abajo
- **No lint/format config exists yet** — if you add tooling, keep it simple

## Key files

- `src/index.ts` — entrypoint (CLI loop + dispatch)
- `src/actions/` — user actions (add/remove cities, weather/forecast, settings)
- `src/api/` — OpenMeteo HTTP integration (geocoding, forecast, shared fetcher)
- `src/presentation/` — console interaction (menu, input, output)
- `src/storage/` — persistence in `~/.config/weather-cli/config.json`
- `src/types/` — shared TS contracts
- `src/utils/` — colors, formatters, constants
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

## Testing

- Runner: `bun test` (los tests viven en `tests/`)
- **Siempre ejecutar con `--isolate`:** `bun test --isolate tests/` o via los scripts `bun run test` y `bun run build`.
  - Sin `--isolate`, todos los archivos de test comparten un único registro de módulos; los `mock.module(...)` de `tests/unit/actions/` reemplazan los módulos reales (`output.ts`, `settingsStorage.ts`, etc.) y contaminan a otros archivos (p. ej. `output.test.ts` falla en `printMessage`/`printError`). `--isolate` le da a cada archivo un registro de módulos limpio.
- Scripts en `package.json`: `test`, `test:watch`, `test:coverage` y `build` (este último no compila el binario si los tests fallan).
- Tipo de tests: unitarios, sin red real. Se usan `globalThis.fetch` stubbeado en `api/*`, `mock.module` + `mock()` en `actions/*`, y `WEATHER_CLI_CONFIG_DIR` apuntando a un directorio temporal para aislar el storage.
- **CUIDADO con los colores ANSI:** `src/utils/colors.ts` pinta solo cuando `process.stdout.isTTY`. En un terminal (p. ej. `test:watch`) los mensajes llevan códigos ANSI. Por eso en `output.test.ts` las aserciones sobre funciones reales que pintan (`printMessage`/`printError`) usan `joinedOutput()` + `toContain(...)`, NUNCA igualdad exacta con `toHaveBeenCalledWith`. Los `toHaveBeenCalledWith` de `actions/*` son seguros porque apuntan a funciones mockeadas cuyo argumento no pasa por colores.
- Verificación de tipos: `bunx tsc --noEmit`.
