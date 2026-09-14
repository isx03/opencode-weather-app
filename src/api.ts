import type { City, ForecastResponse, GeoResult, Unit } from "./types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export class ApiError extends Error {}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new ApiError(`HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function searchCity(name: string): Promise<GeoResult[]> {
  const url =
    `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=5&language=es&format=json`;
  const data = await fetchJson<{ results?: GeoResult[] }>(url);
  return data.results ?? [];
}

export async function getCurrentTemp(city: City, unit: Unit): Promise<number> {
  const unitParam = unit === "fahrenheit" ? "&temperature_unit=fahrenheit" : "";
  const url =
    `${FORECAST_URL}?latitude=${city.latitude}&longitude=${city.longitude}` +
    `&current=temperature_2m${unitParam}`;
  const data = await fetchJson<ForecastResponse>(url);
  return data.current.temperature_2m;
}