import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEFAULT_CONFIG, loadConfig } from "../../../src/storage/configFile";
import { setStoredDefaultCity, toggleStoredUnit } from "../../../src/storage/settingsStorage";
import type { City } from "../../../src/types/City";
import type { Config } from "../../../src/types/Config";

const lima: City = { name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 };

let dir = "";

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "weather-cli-test-"));
  process.env.WEATHER_CLI_CONFIG_DIR = dir;
});

afterAll(async () => {
  delete process.env.WEATHER_CLI_CONFIG_DIR;
  await rm(dir, { recursive: true, force: true });
});

beforeEach(async () => {
  await rm(join(dir, "config.json"), { force: true });
});

describe("setStoredDefaultCity", () => {
  test("establece la ciudad default y persiste", async () => {
    const config: Config = { ...DEFAULT_CONFIG, cities: [lima] };
    const next = await setStoredDefaultCity(config, "Lima");
    expect(next.defaultCity).toBe("Lima");
    await expect(loadConfig()).resolves.toEqual(next);
  });
});

describe("toggleStoredUnit", () => {
  test("cambia de celsius a fahrenheit", async () => {
    const next = await toggleStoredUnit({ ...DEFAULT_CONFIG });
    expect(next.unit).toBe("fahrenheit");
  });

  test("vuelve a celsius tras dos toggles", async () => {
    const once = await toggleStoredUnit({ ...DEFAULT_CONFIG });
    const twice = await toggleStoredUnit(once);
    expect(twice.unit).toBe("celsius");
  });

  test("persiste en disco el cambio de unidad", async () => {
    await toggleStoredUnit({ ...DEFAULT_CONFIG });
    await expect(loadConfig()).resolves.toEqual({ ...DEFAULT_CONFIG, unit: "fahrenheit" });
  });

  test("no muta la configuración original", async () => {
    const config: Config = { ...DEFAULT_CONFIG };
    await toggleStoredUnit(config);
    expect(config.unit).toBe("celsius");
  });
});