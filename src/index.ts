import { addCity } from "./actions/addCity";
import { showAllCitiesForecast } from "./actions/getForecast";
import { showAllCitiesWeather, showDefaultCityWeather } from "./actions/getWeather";
import { listCities } from "./actions/listCities";
import { removeCity } from "./actions/removeCity";
import { setDefaultCity } from "./actions/setDefaultCity";
import { toggleUnit } from "./actions/toggleUnit";
import { closeInput, readInput } from "./presentation/input";
import { printMenu } from "./presentation/menu";
import { printError, printMessage } from "./presentation/output";
import { loadConfig } from "./storage/configFile";
import type { Config } from "./types/Config";
import { cyan } from "./utils/colors";

async function main(): Promise<void> {
  let config = await loadConfig();

  while (true) {
    printMenu(config.cities.length, config.unit);
    const option = (await readInput(cyan("  Selecciona una opción: "))).trim();

    try {
      switch (option) {
        case "1":
          await showDefaultCityWeather(config);
          break;
        case "2":
          await showAllCitiesWeather(config);
          break;
        case "3":
          config = await addCity(config);
          break;
        case "4":
          config = await removeCity(config);
          break;
        case "5":
          config = await setDefaultCity(config);
          break;
        case "6":
          await showAllCitiesForecast(config);
          break;
        case "7":
          config = await listCities(config);
          break;
        case "8":
          config = await toggleUnit(config);
          break;
        case "9":
          printMessage("¡Hasta pronto!");
          closeInput();
          return;
        default:
          printError("Opción inválida. Intenta de nuevo.");
      }
    } catch (err) {
      printError(`Error inesperado: ${err instanceof Error ? err.message : String(err)}`);
    }

    console.log();
  }
}

main().catch((err) => {
  printError(`Error fatal: ${err instanceof Error ? err.message : String(err)}`);
  closeInput();
  process.exit(1);
});