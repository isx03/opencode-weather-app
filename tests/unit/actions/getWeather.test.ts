import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import type { City } from "../../../src/types/City";
import type { Config } from "../../../src/types/Config";

const getCurrentTemp = mock<(city: City, unit: Config["unit"]) => Promise<number>>();
const printWeather = mock<(city: City, temp: number, unit: Config["unit"]) => void>();
const printError = mock<(message: string) => void>();
const printMessage = mock<(message: string) => void>();

mock.module("../../../src/api/weather", () => ({ getCurrentTemp, getForecast7Days: mock() }));
mock.module("../../../src/presentation/output", () => ({
  printWeather,
  printError,
  printMessage,
  printCityList: mock(),
}));

afterAll(() => mock.restore());

const { ApiError } = await import("../../../src/api/http");
const { connectionError, showAllCitiesWeather, showDefaultCityWeather } = await import(
  "../../../src/actions/getWeather"
);

const lima: City = { name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 };
const cuenca: City = { name: "Cuenca", country: "Ecuador", latitude: -2.9, longitude: -78.99 };

beforeEach(() => {
  getCurrentTemp.mockReset();
  printWeather.mockReset();
  printError.mockReset();
  printMessage.mockReset();
  getCurrentTemp.mockImplementation(async () => 0);
});

describe("connectionError", () => {
  test("incluye el detalle del ApiError", () => {
    expect(connectionError(lima, new ApiError("HTTP 500"))).toBe(
      'No se pudo obtener el clima de "Lima" (HTTP 500).',
    );
  });

  test("omite el detalle para errores genéricos", () => {
    expect(connectionError(lima, new Error("boom"))).toBe('No se pudo obtener el clima de "Lima".');
    expect(connectionError(lima, "texto")).toBe('No se pudo obtener el clima de "Lima".');
  });
});

describe("showDefaultCityWeather", () => {
  test("informa cuando no hay ciudad default configurada", async () => {
    const config: Config = { defaultCity: null, cities: [lima], unit: "celsius" };
    await showDefaultCityWeather(config);
    expect(printMessage).toHaveBeenCalledWith(
      "No hay una ciudad default configurada (opción 5).",
    );
    expect(getCurrentTemp).not.toHaveBeenCalled();
  });

  test("imprime el clima de la ciudad default", async () => {
    const config: Config = { defaultCity: "Lima", cities: [lima], unit: "celsius" };
    getCurrentTemp.mockResolvedValue(21.4);
    await showDefaultCityWeather(config);
    expect(getCurrentTemp).toHaveBeenCalledWith(lima, "celsius");
    expect(printWeather).toHaveBeenCalledWith(lima, 21.4, "celsius");
    expect(printError).not.toHaveBeenCalled();
  });

  test("imprime un error cuando la API falla", async () => {
    const config: Config = { defaultCity: "Lima", cities: [lima], unit: "celsius" };
    getCurrentTemp.mockRejectedValue(new ApiError("HTTP 500"));
    await showDefaultCityWeather(config);
    expect(printError).toHaveBeenCalledWith(
      'No se pudo obtener el clima de "Lima" (HTTP 500).',
    );
  });
});

describe("showAllCitiesWeather", () => {
  test("informa cuando no hay ciudades registradas", async () => {
    const config: Config = { defaultCity: null, cities: [], unit: "celsius" };
    await showAllCitiesWeather(config);
    expect(printMessage).toHaveBeenCalledWith(
      "No hay ciudades registradas. Agrega una con la opción 3.",
    );
    expect(getCurrentTemp).not.toHaveBeenCalled();
  });

  test("procesa cada ciudad y reporta errores por separado", async () => {
    const config: Config = { defaultCity: "Lima", cities: [lima, cuenca], unit: "celsius" };
    getCurrentTemp.mockImplementation(async (city) => {
      if (city.name === "Cuenca") throw new ApiError("HTTP 404");
      return 21.4;
    });
    await showAllCitiesWeather(config);
    expect(printWeather).toHaveBeenCalledTimes(1);
    expect(printWeather).toHaveBeenCalledWith(lima, 21.4, "celsius");
    expect(printError).toHaveBeenCalledTimes(1);
    expect(printError).toHaveBeenCalledWith(
      'No se pudo obtener el clima de "Cuenca" (HTTP 404).',
    );
  });
});
