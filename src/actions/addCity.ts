import { searchCity } from "../api/geocoding";
import { readInput } from "../presentation/input";
import { printError, printMessage } from "../presentation/output";
import { addStoredCity } from "../storage/citiesStorage";
import type { City, GeoResult } from "../types/City";
import type { Config } from "../types/Config";

export async function addCity(config: Config): Promise<Config> {
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

  const next = await addStoredCity(config, city);
  printMessage(`"${city.name}" se agregó correctamente.`);
  return next;
}