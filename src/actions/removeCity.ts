import { readInput } from "../presentation/input";
import { printCityList, printError, printMessage } from "../presentation/output";
import { removeStoredCity } from "../storage/citiesStorage";
import type { Config } from "../types/Config";

export async function removeCity(config: Config): Promise<Config> {
  if (config.cities.length === 0) {
    printMessage("No hay ciudades registradas.");
    return config;
  }
  printCityList(config.cities);
  const choice = (await readInput("  Selecciona una ciudad a eliminar: ")).trim();
  const index = Number(choice) - 1;
  const city = config.cities[index];
  if (city === undefined) {
    printError("Selección inválida.");
    return config;
  }

  const next = await removeStoredCity(config, city.name);
  printMessage(`"${city.name}" se eliminó.`);
  return next;
}