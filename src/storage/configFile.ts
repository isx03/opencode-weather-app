import { homedir } from "node:os";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Config } from "../types/Config";

function configDir(): string {
  return process.env.WEATHER_CLI_CONFIG_DIR ?? join(homedir(), ".config", "weather-cli");
}

function configPath(): string {
  return join(configDir(), "config.json");
}

export const DEFAULT_CONFIG: Config = {
  defaultCity: null,
  cities: [],
  unit: "celsius",
};

export async function loadConfig(): Promise<Config> {
  try {
    const raw = await readFile(configPath(), "utf-8");
    const parsed = JSON.parse(raw) as Partial<Config>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await mkdir(configDir(), { recursive: true });
  await writeFile(configPath(), JSON.stringify(config, null, 2), "utf-8");
}