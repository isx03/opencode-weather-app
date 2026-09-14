import { ApiError, getCurrentTemp, getForecast7Days, searchCity } from "./src/api";
import { loadConfig, saveConfig } from "./src/config";
import {
  closeInput,
  cyan,
  printCityList,
  printError,
  printForecast7Days,
  printMenu,
  printMessage,
  printWeather,
  readInput,
  unitSymbol,
} from "./src/ui";
import type { City, Config, GeoResult, Unit } from "./src/types";

async function showDefaultCityWeather(config: Config): Promise<void> {
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

async function showAllCitiesWeather(config: Config): Promise<void> {
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

async function showAllCitiesForecast(config: Config): Promise<void> {
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

function connectionError(city: City, err: unknown): string {
  const detail = err instanceof ApiError ? ` (${err.message})` : "";
  return `No se pudo obtener el clima de "${city.name}"${detail}.`;
}

async function addCity(config: Config): Promise<Config> {
  const name = (await readInput("  Nombre de la ciudad: ")).trim();
  if (!name) {
    printError("El nombre de la ciudad está vacío.");
    return config;
  }
  if (config.cities.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
    printError(`"${name}" ya está registrada.`);
    return config;
  }

  let results: GeoResult[];
  try {
    results = await searchCity(name);
  } catch {
    printError("No se pudo conectar con el servicio de geolocalización.");
    return config;
  }
  if (results.length === 0) {
    printError(`No se encontró ninguna ciudad llamada "${name}".`);
    return config;
  }

  let selected: GeoResult;
  if (results.length === 1) {
    selected = results[0]!;
  } else {
    printMessage("Se encontraron varias coincidencias:");
    results.forEach((result, i) => {
      const location = [result.name, result.country]
        .filter((x): x is string => Boolean(x))
        .join(", ");
      console.log(`  ${i + 1}. ${location}`);
    });
    const choice = (await readInput("  Selecciona una: ")).trim();
    const selectedIndex = Number(choice) - 1;
    const option = results[selectedIndex];
    if (option === undefined) {
      printError("Selección inválida.");
      return config;
    }
    selected = option;
  }

  const city: City = {
    name: selected.name,
    country: selected.country,
    latitude: selected.latitude,
    longitude: selected.longitude,
  };

  const next = { ...config, cities: [...config.cities, city] };
  if (next.defaultCity === null) {
    next.defaultCity = city.name;
  }
  await saveConfig(next);
  printMessage(`"${city.name}" se agregó correctamente.`);
  return next;
}

async function removeCity(config: Config): Promise<Config> {
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

  const next = {
    ...config,
    cities: config.cities.filter((_, i) => i !== index),
    defaultCity: config.defaultCity === city.name ? null : config.defaultCity,
  };
  await saveConfig(next);
  printMessage(`"${city.name}" se eliminó.`);
  return next;
}

async function setDefaultCity(config: Config): Promise<Config> {
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

  const next = { ...config, defaultCity: city.name };
  await saveConfig(next);
  printMessage(`Ciudad default establecida: ${city.name}`);
  return next;
}

async function toggleUnit(config: Config): Promise<Config> {
  const unit: Unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  const next = { ...config, unit };
  await saveConfig(next);
  printMessage(`Unidad cambiada a ${unitSymbol(unit)}.`);
  return next;
}

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