import { getForecast7Days } from "../api/weather";
import { printError, printForecast7Days, printMessage } from "../presentation/output";
import type { Config } from "../types/Config";
import { connectionError } from "./getWeather";

export async function showAllCitiesForecast(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    printMessage("No hay ciudades registradas. Agrega una con la opción 3.");
    return;
  }
  for (const city of config.cities) {
    try {
      printForecast7Days(city, await getForecast7Days(city, config.unit), config.unit);
    } catch (err) {
      printError(connectionError(city, err));
    }
  }
}