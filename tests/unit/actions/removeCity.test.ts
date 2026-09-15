import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import type { City } from "../../../src/types/City";
import type { Config } from "../../../src/types/Config";

const readInput = mock<(prompt: string) => Promise<string>>();
const removeStoredCity = mock<(config: Config, name: string) => Promise<Config>>();
const printError = mock<(message: string) => void>();
const printMessage = mock<(message: string) => void>();
const printCityList = mock<(cities: City[]) => void>();

mock.module("../../../src/presentation/input", () => ({ readInput }));
mock.module("../../../src/presentation/output", () => ({ printError, printMessage, printCityList }));
mock.module("../../../src/storage/citiesStorage", () => ({ removeStoredCity }));

const baseConfig: Config = { defaultCity: "Lima", cities: [], unit: "celsius" };
const lima: City = { name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 };

beforeEach(() => {
  readInput.mockReset();
  removeStoredCity.mockReset();
  printError.mockReset();
  printMessage.mockReset();
  printCityList.mockReset();
  readInput.mockImplementation(async () => "");
  removeStoredCity.mockImplementation(async (config, name) => ({
    ...config,
    cities: config.cities.filter((c) => c.name !== name),
    defaultCity: config.defaultCity === name ? null : config.defaultCity,
  }));
});

afterAll(() => mock.restore());

const { removeCity } = await import("../../../src/actions/removeCity");

describe("removeCity", () => {
  test("informa cuando no hay ciudades registradas", async () => {
    const result = await removeCity(baseConfig);
    expect(result).toBe(baseConfig);
    expect(printMessage).toHaveBeenCalledWith("No hay ciudades registradas.");
    expect(readInput).not.toHaveBeenCalled();
  });

  test("reporta una selección inválida", async () => {
    const config: Config = { ...baseConfig, cities: [lima] };
    readInput.mockResolvedValue("99");
    const result = await removeCity(config);
    expect(result).toBe(config);
    expect(printCityList).toHaveBeenCalledWith(config.cities);
    expect(printError).toHaveBeenCalledWith("Selección inválida.");
    expect(removeStoredCity).not.toHaveBeenCalled();
  });

  test("elimina la ciudad seleccionada", async () => {
    const config: Config = { ...baseConfig, cities: [lima] };
    readInput.mockResolvedValue("1");
    const next: Config = { ...baseConfig, cities: [], defaultCity: null };
    removeStoredCity.mockResolvedValue(next);
    const result = await removeCity(config);
    expect(removeStoredCity).toHaveBeenCalledWith(config, "Lima");
    expect(printMessage).toHaveBeenCalledWith('"Lima" se eliminó.');
    expect(result).toBe(next);
  });
});