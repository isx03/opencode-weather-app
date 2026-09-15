import { ApiError } from "../api/http";
import { getCurrentTemp } from "../api/weather";
import { printError, printMessage, printWeather } from "../presentation/output";
import type { City } from "../types/City";
import type { Config } from "../types/Config";

export function connectionError(city: City, err: unknown): string {
  const detail = err instanceof ApiError ? ` (${err.message})` : "";
  return `No se pudo obtener el clima de "${city.name}"${detail}.`;
}

export async function showDefaultCityWeather(config: Config): Promise<void> {
  const city = config.cities.find((c) => c.name === config.defaultCity);
  if (!city) {
    printMessage("No hay una ciudad default configurada (opción 5).");
    return;
  }
  try {
    printWeather(city, await getCurrentTemp(city, config.unit), config.unit);
  } catch (err) {
    printError(connectionError(city, err));
  }
}

export async function showAllCitiesWeather(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    printMessage("No hay ciudades registradas. Agrega una con la opción 3.");
    return;
  }
  for (const city of config.cities) {
    try {
      printWeather(city, await getCurrentTemp(city, config.unit), config.unit);
    } catch (err) {
      printError(connectionError(city, err));
    }
  }
}