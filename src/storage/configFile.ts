import { homedir } from "node:os";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Config } from "../types/Config";

const CONFIG_DIR = join(homedir(), ".config", "weather-cli");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");

export const DEFAULT_CONFIG: Config = {
  defaultCity: null,
  cities: [],
  unit: "celsius",
};

export async function loadConfig(): Promise<Config> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Config>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function saveConfig(config: Config): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}