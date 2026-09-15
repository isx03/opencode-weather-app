import { printCityList, printMessage } from "../presentation/output";
import { listStoredCities } from "../storage/citiesStorage";
import type { Config } from "../types/Config";

export async function listCities(config: Config): Promise<Config> {
  const cities = listStoredCities(config);
  if (cities.length === 0) {
    printMessage("No hay ciudades registradas.");
    return config;
  }
  printCityList(cities);
  return config;
}