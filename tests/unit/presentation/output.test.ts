import { afterAll, afterEach, describe, expect, spyOn, test } from "bun:test";
import {
  printCityList,
  printError,
  printForecast7Days,
  printMessage,
  printWeather,
  weatherDescription,
} from "../../../src/presentation/output";
import type { City } from "../../../src/types/City";
import type { DailyForecast } from "../../../src/types/Weather";

const log = spyOn(console, "log");

afterEach(() => log.mockClear());

afterAll(() => log.mockRestore());

const lima: City = { name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 };
const cuenca: City = { name: "Cuenca", country: "Ecuador", latitude: -2.9, longitude: -78.99 };

function joinedOutput(): string {
  return log.mock.calls.map((call) => String(call[0])).join("\n");
}

describe("weatherDescription", () => {
  test("traduce códigos WMO conocidos", () => {
    expect(weatherDescription(0)).toBe("Despejado");
    expect(weatherDescription(61)).toBe("Lluvia ligera");
    expect(weatherDescription(95)).toBe("Tormenta");
  });

  test("devuelve 'Sin datos' para códigos desconocidos", () => {
    expect(weatherDescription(999)).toBe("Sin datos");
  });
});

describe("printMessage", () => {
  test("imprime el mensaje con sangría", () => {
    printMessage("hola");
    expect(joinedOutput()).toContain("  hola");
  });
});

describe("printError", () => {
  test("imprime el error con sangría", () => {
    printError("boom");
    expect(joinedOutput()).toContain("  boom");
  });
});

describe("printWeather", () => {
  test("imprime ubicación y temperatura con la unidad", () => {
    printWeather(lima, 21.4, "celsius");
    const out = joinedOutput();
    expect(out).toContain("Lima, Perú");
    expect(out).toContain("21.4 °C");
    expect(out).toContain("═");
  });

  test("usa el símbolo de fahrenheit", () => {
    printWeather(lima, 70, "fahrenheit");
    expect(joinedOutput()).toContain("70 °F");
  });
});

describe("printForecast7Days", () => {
  test("imprime fecha, descripción y temperaturas mín/máx", () => {
    const forecast: DailyForecast[] = [
      { time: "2026-09-14", tempMax: 21.4, tempMin: 10, weatherCode: 61 },
    ];
    printForecast7Days(lima, forecast, "celsius");
    const out = joinedOutput();
    expect(out).toContain("Lima, Perú — Pronóstico 7 días");
    expect(out).toContain("14/09");
    expect(out).toContain("Lluvia ligera");
    expect(out).toContain("Mín 10°C  Máx 21.4°C");
  });
});

describe("printCityList", () => {
  test("enumera las ciudades", () => {
    printCityList([lima, cuenca]);
    const out = joinedOutput();
    expect(out).toContain("1. Lima, Perú");
    expect(out).toContain("2. Cuenca, Ecuador");
  });
});

