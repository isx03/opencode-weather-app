import { afterAll, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import type { City, GeoResult } from "../../../src/types/City";
import type { Config } from "../../../src/types/Config";

const searchCity = mock<(name: string) => Promise<GeoResult[]>>();
const readInput = mock<(prompt: string) => Promise<string>>();
const addStoredCity = mock<(config: Config, city: City) => Promise<Config>>();
const printError = mock<(message: string) => void>();
const printMessage = mock<(message: string) => void>();

mock.module("../../../src/api/geocoding", () => ({ searchCity }));
mock.module("../../../src/presentation/input", () => ({ readInput }));
mock.module("../../../src/presentation/output", () => ({ printError, printMessage }));
mock.module("../../../src/storage/citiesStorage", () => ({ addStoredCity }));

const consoleLog = spyOn(console, "log").mockImplementation(() => {});

const baseConfig: Config = { defaultCity: null, cities: [], unit: "celsius" };
const lima: GeoResult = { name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 };
const cuenca: GeoResult = { name: "Cuenca", country: "Ecuador", latitude: -2.9, longitude: -78.99 };
const limaCity: City = { ...lima };
const cuencaCity: City = { ...cuenca };

beforeEach(() => {
  searchCity.mockReset();
  readInput.mockReset();
  addStoredCity.mockReset();
  printError.mockReset();
  printMessage.mockReset();
  searchCity.mockImplementation(async () => []);
  readInput.mockImplementation(async () => "");
  addStoredCity.mockImplementation(async (config, city) => ({
    ...config,
    cities: [city],
    defaultCity: city.name,
  }));
});

afterAll(() => {
  consoleLog.mockRestore();
  mock.restore();
});

const { addCity } = await import("../../../src/actions/addCity");

describe("addCity", () => {
  test("rechaza un nombre vacío", async () => {
    readInput.mockResolvedValue("   ");
    const result = await addCity(baseConfig);
    expect(result).toBe(baseConfig);
    expect(printError).toHaveBeenCalledWith("El nombre de la ciudad está vacío.");
    expect(searchCity).not.toHaveBeenCalled();
    expect(addStoredCity).not.toHaveBeenCalled();
  });

  test("rechaza una ciudad duplicada sin importar mayúsculas", async () => {
    const config: Config = { ...baseConfig, cities: [limaCity] };
    readInput.mockResolvedValue("liMa");
    const result = await addCity(config);
    expect(result).toBe(config);
    expect(printError).toHaveBeenCalledWith('"liMa" ya está registrada.');
    expect(addStoredCity).not.toHaveBeenCalled();
  });

  test("reporta un error de red del servicio de geolocalización", async () => {
    searchCity.mockRejectedValue(new Error("boom"));
    readInput.mockResolvedValue("Lima");
    const result = await addCity(baseConfig);
    expect(result).toBe(baseConfig);
    expect(printError).toHaveBeenCalledWith(
      "No se pudo conectar con el servicio de geolocalización.",
    );
  });

  test("informa cuando no se encuentra ninguna ciudad", async () => {
    searchCity.mockResolvedValue([]);
    readInput.mockResolvedValue("Quimbaya");
    const result = await addCity(baseConfig);
    expect(result).toBe(baseConfig);
    expect(printError).toHaveBeenCalledWith('No se encontró ninguna ciudad llamada "Quimbaya".');
  });

  test("agrega automáticamente cuando hay un único resultado", async () => {
    searchCity.mockResolvedValue([lima]);
    readInput.mockResolvedValue("Lima");
    const next: Config = { ...baseConfig, cities: [limaCity], defaultCity: "Lima" };
    addStoredCity.mockResolvedValue(next);
    const result = await addCity(baseConfig);
    expect(addStoredCity).toHaveBeenCalledWith(baseConfig, limaCity);
    expect(result).toBe(next);
    expect(printMessage).toHaveBeenCalledWith('"Lima" se agregó correctamente.');
  });

  test("selecciona la ciudad pedida entre varias coincidencias", async () => {
    searchCity.mockResolvedValue([lima, cuenca]);
    readInput.mockResolvedValueOnce("Lima").mockResolvedValueOnce("2");
    const result = await addCity(baseConfig);
    expect(addStoredCity).toHaveBeenCalledWith(baseConfig, cuencaCity);
    expect(result.cities).toEqual([cuencaCity]);
    expect(result.defaultCity).toBe("Cuenca");
  });

  test("reporta una selección inválida entre varias coincidencias", async () => {
    searchCity.mockResolvedValue([lima, cuenca]);
    readInput.mockResolvedValueOnce("Lima").mockResolvedValueOnce("9");
    const result = await addCity(baseConfig);
    expect(result).toBe(baseConfig);
    expect(printError).toHaveBeenCalledWith("Selección inválida.");
    expect(addStoredCity).not.toHaveBeenCalled();
  });
});
