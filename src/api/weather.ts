import type { City } from "../types/City";
import type { Unit } from "../types/Config";
import type { DailyForecast, DailyForecastResponse, ForecastResponse } from "../types/Weather";
import { fetchJson } from "./http";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export async function getCurrentTemp(city: City, unit: Unit): Promise<number> {
  const unitParam = unit === "fahrenheit" ? "&temperature_unit=fahrenheit" : "";
  const url =
    `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}` +
    `&current=temperature_2m${unitParam}`;
  const data = await fetchJson<ForecastResponse>(url);
  return data.current.temperature_2m;
}

export async function getForecast7Days(city: City, unit: Unit): Promise<DailyForecast[]> {
  const unitParam = unit === "fahrenheit" ? "&temperature_unit=fahrenheit" : "";
  const url =
    `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
    `&forecast_days=7&timezone=auto${unitParam}`;
  const data = await fetchJson<DailyForecastResponse>(url);
  return data.daily.time.map((time, i) => ({
    time,
    tempMax: data.daily.temperature_2m_max[i]!,
    tempMin: data.daily.temperature_2m_min[i]!,
    weatherCode: data.daily.weather_code[i]!,
  }));
}