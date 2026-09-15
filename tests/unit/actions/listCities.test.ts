import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import type { City } from "../../../src/types/City";
import type { Config } from "../../../src/types/Config";

const listStoredCities = mock<(config: Config) => City[]>();
const printMessage = mock<(message: string) => void>();
const printCityList = mock<(cities: City[]) => void>();

mock.module("../../../src/storage/citiesStorage", () => ({ listStoredCities }));
mock.module("../../../src/presentation/output", () => ({ printMessage, printCityList }));

const baseConfig: Config = { defaultCity: null, cities: [], unit: "celsius" };
const lima: City = { name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 };

beforeEach(() => {
  listStoredCities.mockReset();
  printMessage.mockReset();
  printCityList.mockReset();
  listStoredCities.mockImplementation((config) => config.cities);
});

afterAll(() => mock.restore());

const { listCities } = await import("../../../src/actions/listCities");

describe("listCities", () => {
  test("informa cuando no hay ciudades registradas", async () => {
    const result = await listCities(baseConfig);
    expect(result).toBe(baseConfig);
    expect(printMessage).toHaveBeenCalledWith("No hay ciudades registradas.");
    expect(printCityList).not.toHaveBeenCalled();
  });

  test("lista las ciudades cuando existen", async () => {
    const config: Config = { ...baseConfig, cities: [lima] };
    const result = await listCities(config);
    expect(printCityList).toHaveBeenCalledWith(config.cities);
    expect(printMessage).not.toHaveBeenCalled();
    expect(result).toBe(config);
  });
});