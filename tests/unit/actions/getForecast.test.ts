import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import type { City } from "../../../src/types/City";
import type { Config } from "../../../src/types/Config";
import type { DailyForecast } from "../../../src/types/Weather";

const getForecast7Days = mock<(city: City, unit: Config["unit"]) => Promise<DailyForecast[]>>();
const printForecast7Days = mock<
  (city: City, forecast: DailyForecast[], unit: Config["unit"]) => void
>();
const printError = mock<(message: string) => void>();
const printMessage = mock<(message: string) => void>();

mock.module("../../../src/api/weather", () => ({ getForecast7Days, getCurrentTemp: mock() }));
mock.module("../../../src/presentation/output", () => ({
  printForecast7Days,
  printError,
  printMessage,
  printWeather: mock(),
}));

afterAll(() => mock.restore());

const { ApiError } = await import("../../../src/api/http");
const { showAllCitiesForecast } = await import("../../../src/actions/getForecast");

const lima: City = { name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 };
const cuenca: City = { name: "Cuenca", country: "Ecuador", latitude: -2.9, longitude: -78.99 };
const sun: DailyForecast = { time: "2026-09-14", tempMax: 21.4, tempMin: 10, weatherCode: 0 };

beforeEach(() => {
  getForecast7Days.mockReset();
  printForecast7Days.mockReset();
  printError.mockReset();
  printMessage.mockReset();
  getForecast7Days.mockImplementation(async () => []);
});

describe("showAllCitiesForecast", () => {
  test("informa cuando no hay ciudades registradas", async () => {
    const config: Config = { defaultCity: null, cities: [], unit: "celsius" };
    await showAllCitiesForecast(config);
    expect(printMessage).toHaveBeenCalledWith(
      "No hay ciudades registradas. Agrega una con la opción 3.",
    );
    expect(getForecast7Days).not.toHaveBeenCalled();
  });

  test("imprime el pronóstico de cada ciudad", async () => {
    const config: Config = { defaultCity: "Lima", cities: [lima, cuenca], unit: "celsius" };
    getForecast7Days.mockResolvedValue([sun]);
    await showAllCitiesForecast(config);
    expect(printForecast7Days).toHaveBeenCalledTimes(2);
    expect(printForecast7Days).toHaveBeenCalledWith(lima, [sun], "celsius");
    expect(printForecast7Days).toHaveBeenCalledWith(cuenca, [sun], "celsius");
    expect(printError).not.toHaveBeenCalled();
  });

  test("reporta errores por ciudad sin interrumpir las demás", async () => {
    const config: Config = { defaultCity: "Lima", cities: [lima, cuenca], unit: "celsius" };
    getForecast7Days.mockImplementation(async (city) => {
      if (city.name === "Cuenca") throw new ApiError("HTTP 500");
      return [sun];
    });
    await showAllCitiesForecast(config);
    expect(printForecast7Days).toHaveBeenCalledTimes(1);
    expect(printForecast7Days).toHaveBeenCalledWith(lima, [sun], "celsius");
    expect(printError).toHaveBeenCalledTimes(1);
    expect(printError).toHaveBeenCalledWith(
      'No se pudo obtener el clima de "Cuenca" (HTTP 500).',
    );
  });
});