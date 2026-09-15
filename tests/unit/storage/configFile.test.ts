import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEFAULT_CONFIG, loadConfig, saveConfig } from "../../../src/storage/configFile";
import type { Config } from "../../../src/types/Config";

const configFile = join("config.json");
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
  await rm(join(dir, configFile), { force: true });
});

const custom: Config = {
  defaultCity: "Lima",
  cities: [{ name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 }],
  unit: "fahrenheit",
};

describe("loadConfig", () => {
  test("devuelve la configuración por defecto si el archivo no existe", async () => {
    await expect(loadConfig()).resolves.toEqual(DEFAULT_CONFIG);
  });

  test("mezcla valores parciales con los defaults", async () => {
    await writeFile(
      join(dir, configFile),
      JSON.stringify({ cities: custom.cities }),
      "utf-8",
    );
    const loaded = await loadConfig();
    expect(loaded.cities).toEqual(custom.cities);
    expect(loaded.defaultCity).toBeNull();
    expect(loaded.unit).toBe("celsius");
  });

  test("devuelve la configuración por defecto ante un JSON corrupto", async () => {
    await writeFile(join(dir, configFile), "{ no es json", "utf-8");
    await expect(loadConfig()).resolves.toEqual(DEFAULT_CONFIG);
  });
});

describe("saveConfig", () => {
  test("persiste la configuración y vuelve a cargarla", async () => {
    await saveConfig(custom);
    await expect(loadConfig()).resolves.toEqual(custom);
  });
});