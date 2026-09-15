import type { City } from "../types/City";
import type { Config } from "../types/Config";
import { saveConfig } from "./configFile";

export async function addStoredCity(config: Config, city: City): Promise<Config> {
  const next = { ...config, cities: [...config.cities, city] };
  if (next.defaultCity === null) {
    next.defaultCity = city.name;
  }
  await saveConfig(next);
  return next;
}

export async function removeStoredCity(config: Config, cityName: string): Promise<Config> {
  const next = {
    ...config,
    cities: config.cities.filter((c) => c.name !== cityName),
    defaultCity: config.defaultCity === cityName ? null : config.defaultCity,
  };
  await saveConfig(next);
  return next;
}

export function listStoredCities(config: Config): City[] {
  return config.cities;
}