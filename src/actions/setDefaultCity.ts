import { readInput } from "../presentation/input";
import { printCityList, printError, printMessage } from "../presentation/output";
import { setStoredDefaultCity } from "../storage/settingsStorage";
import type { Config } from "../types/Config";

export async function setDefaultCity(config: Config): Promise<Config> {
  if (config.cities.length === 0) {
    printMessage("Primero agrega una ciudad (opción 3).");
    return config;
  }
  printCityList(config.cities);
  const choice = (await readInput("  Selecciona la ciudad default: ")).trim();
  const index = Number(choice) - 1;
  const city = config.cities[index];
  if (city === undefined) {
    printError("Selección inválida.");
    return config;
  }

  const next = await setStoredDefaultCity(config, city.name);
  printMessage(`Ciudad default establecida: ${city.name}`);
  return next;
}