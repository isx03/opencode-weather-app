import { afterEach, describe, expect, test } from "bun:test";
import { getCurrentTemp, getForecast7Days } from "../../../src/api/weather";
import type { City } from "../../../src/types/City";
import type { DailyForecastResponse, ForecastResponse } from "../../../src/types/Weather";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(body: unknown, onUrl?: (url: string) => void): void {
  globalThis.fetch = ((input: string) => {
    onUrl?.(input);
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  }) as unknown as typeof fetch;
}

const lima: City = { name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 };

describe("getCurrentTemp", () => {
  test("devuelve la temperatura actual", async () => {
    const body: ForecastResponse = { current: { time: "2026-09-14T12:00", temperature_2m: 21.4 } };
    let url = "";
    stubFetch(body, (u) => (url = u));
    await expect(getCurrentTemp(lima, "celsius")).resolves.toBe(21.4);
    expect(url).toContain("https://api.open-meteo.com/v1/forecast");
    expect(url).toContain("latitude=-12.04");
    expect(url).toContain("longitude=-77.03");
    expect(url).toContain("current=temperature_2m");
  });

  test("añade temperature_unit=fahrenheit cuando la unidad es fahrenheit", async () => {
    const body: ForecastResponse = { current: { time: "2026-09-14T12:00", temperature_2m: 70 } };
    let url = "";
    stubFetch(body, (u) => (url = u));
    await getCurrentTemp(lima, "fahrenheit");
    expect(url).toContain("temperature_unit=fahrenheit");
  });

  test("omite temperature_unit cuando la unidad es celsius", async () => {
    const body: ForecastResponse = { current: { time: "2026-09-14T12:00", temperature_2m: 21.4 } };
    let url = "";
    stubFetch(body, (u) => (url = u));
    await getCurrentTemp(lima, "celsius");
    expect(url).not.toContain("temperature_unit");
  });
});

describe("getForecast7Days", () => {
  test("mapea la respuesta diaria a DailyForecast[]", async () => {
    const body: DailyForecastResponse = {
      daily: {
        time: ["2026-09-14", "2026-09-15", "2026-09-16"],
        temperature_2m_max: [20, 21, 22],
        temperature_2m_min: [10, 11, 12],
        weather_code: [0, 61, 95],
      },
    };
    stubFetch(body);
    const days = await getForecast7Days(lima, "celsius");
    expect(days).toEqual([
      { time: "2026-09-14", tempMax: 20, tempMin: 10, weatherCode: 0 },
      { time: "2026-09-15", tempMax: 21, tempMin: 11, weatherCode: 61 },
      { time: "2026-09-16", tempMax: 22, tempMin: 12, weatherCode: 95 },
    ]);
  });

  test("solicita los parámetros diarios correctos", async () => {
    const body: DailyForecastResponse = {
      daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], weather_code: [] },
    };
    let url = "";
    stubFetch(body, (u) => (url = u));
    await getForecast7Days(lima, "celsius");
    expect(url).toContain("daily=temperature_2m_max,temperature_2m_min,weather_code");
    expect(url).toContain("forecast_days=7");
    expect(url).toContain("timezone=auto");
  });
});