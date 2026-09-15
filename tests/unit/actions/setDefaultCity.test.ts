import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import type { City } from "../../../src/types/City";
import type { Config } from "../../../src/types/Config";

const readInput = mock<(prompt: string) => Promise<string>>();
const setStoredDefaultCity = mock<(config: Config, name: string) => Promise<Config>>();
const printError = mock<(message: string) => void>();
const printMessage = mock<(message: string) => void>();
const printCityList = mock<(cities: City[]) => void>();

mock.module("../../../src/presentation/input", () => ({ readInput }));
mock.module("../../../src/presentation/output", () => ({ printError, printMessage, printCityList }));
mock.module("../../../src/storage/settingsStorage", () => ({ setStoredDefaultCity }));

const baseConfig: Config = { defaultCity: null, cities: [], unit: "celsius" };
const lima: City = { name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 };
const cuenca: City = { name: "Cuenca", country: "Ecuador", latitude: -2.9, longitude: -78.99 };

beforeEach(() => {
  readInput.mockReset();
  setStoredDefaultCity.mockReset();
  printError.mockReset();
  printMessage.mockReset();
  printCityList.mockReset();
  readInput.mockImplementation(async () => "");
  setStoredDefaultCity.mockImplementation(async (config, name) => ({ ...config, defaultCity: name }));
});

afterAll(() => mock.restore());

const { setDefaultCity } = await import("../../../src/actions/setDefaultCity");

describe("setDefaultCity", () => {
  test("pide agregar una ciudad si no hay ninguna", async () => {
    const result = await setDefaultCity(baseConfig);
    expect(result).toBe(baseConfig);
    expect(printMessage).toHaveBeenCalledWith("Primero agrega una ciudad (opción 3).");
    expect(readInput).not.toHaveBeenCalled();
  });

  test("reporta una selección inválida", async () => {
    const config: Config = { ...baseConfig, cities: [lima, cuenca] };
    readInput.mockResolvedValue("99");
    const result = await setDefaultCity(config);
    expect(result).toBe(config);
    expect(printCityList).toHaveBeenCalledWith(config.cities);
    expect(printError).toHaveBeenCalledWith("Selección inválida.");
    expect(setStoredDefaultCity).not.toHaveBeenCalled();
  });

  test("establece la ciudad default seleccionada", async () => {
    const config: Config = { ...baseConfig, cities: [lima, cuenca] };
    readInput.mockResolvedValue("2");
    const next: Config = { ...config, defaultCity: "Cuenca" };
    setStoredDefaultCity.mockResolvedValue(next);
    const result = await setDefaultCity(config);
    expect(setStoredDefaultCity).toHaveBeenCalledWith(config, "Cuenca");
    expect(printMessage).toHaveBeenCalledWith("Ciudad default establecida: Cuenca");
    expect(result).toBe(next);
  });
});