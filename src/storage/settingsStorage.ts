import type { Config, Unit } from "../types/Config";
import { saveConfig } from "./configFile";

export async function setStoredDefaultCity(config: Config, name: string): Promise<Config> {
  const next = { ...config, defaultCity: name };
  await saveConfig(next);
  return next;
}

export async function toggleStoredUnit(config: Config): Promise<Config> {
  const unit: Unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  const next = { ...config, unit };
  await saveConfig(next);
  return next;
}