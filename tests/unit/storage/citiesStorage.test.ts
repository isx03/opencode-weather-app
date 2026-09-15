import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEFAULT_CONFIG, loadConfig } from "../../../src/storage/configFile";
import { addStoredCity, listStoredCities, removeStoredCity } from "../../../src/storage/citiesStorage";
import type { City } from "../../../src/types/City";
import type { Config } from "../../../src/types/Config";

const lima: City = { name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 };
const cuenca: City = { name: "Cuenca", country: "Ecuador", latitude: -2.9, longitude: -78.99 };

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

describe("addStoredCity", () => {
  test("añade la ciudad y establece el default si no había ninguno", async () => {
    const next = await addStoredCity({ ...DEFAULT_CONFIG }, lima);
    expect(next.cities).toEqual([lima]);
    expect(next.defaultCity).toBe("Lima");
  });

  test("mantiene el default existente", async () => {
    const config: Config = { ...DEFAULT_CONFIG, defaultCity: "Lima", cities: [lima] };
    const next = await addStoredCity(config, cuenca);
    expect(next.cities).toEqual([lima, cuenca]);
    expect(next.defaultCity).toBe("Lima");
  });

  test("persiste en disco la nueva ciudad", async () => {
    const next = await addStoredCity({ ...DEFAULT_CONFIG }, lima);
    const loaded = await loadConfig();
    expect(loaded).toEqual(next);
  });
});

describe("removeStoredCity", () => {
  test("elimina la ciudad y limpia el default si era la default", async () => {
    const config: Config = { ...DEFAULT_CONFIG, defaultCity: "Lima", cities: [lima, cuenca] };
    const next = await removeStoredCity(config, "Lima");
    expect(next.cities).toEqual([cuenca]);
    expect(next.defaultCity).toBeNull();
  });

  test("conserva el default si la eliminada no era la default", async () => {
    const config: Config = { ...DEFAULT_CONFIG, defaultCity: "Lima", cities: [lima, cuenca] };
    const next = await removeStoredCity(config, "Cuenca");
    expect(next.cities).toEqual([lima]);
    expect(next.defaultCity).toBe("Lima");
  });

  test("persiste en disco la eliminación", async () => {
    const config: Config = { ...DEFAULT_CONFIG, defaultCity: "Lima", cities: [lima, cuenca] };
    await removeStoredCity(config, "Lima");
    await expect(loadConfig()).resolves.toEqual({ ...DEFAULT_CONFIG, cities: [cuenca] });
  });
});

describe("listStoredCities", () => {
  test("devuelve las ciudades de la configuración", () => {
    const config: Config = { ...DEFAULT_CONFIG, cities: [lima, cuenca] };
    expect(listStoredCities(config)).toEqual([lima, cuenca]);
  });
});