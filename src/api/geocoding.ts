import type { GeoResult } from "../types/City";
import { fetchJson } from "./http";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

export async function searchCity(name: string): Promise<GeoResult[]> {
  const url =
    `${GEOCODING_URL}?name=${encodeURIComponent(name)}&count=5&language=es&format=json`;
  const data = await fetchJson<{ results?: GeoResult[] }>(url);
  return data.results ?? [];
}