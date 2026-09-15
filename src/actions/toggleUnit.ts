import { printMessage } from "../presentation/output";
import { toggleStoredUnit } from "../storage/settingsStorage";
import { unitSymbol } from "../utils/format";
import type { Config } from "../types/Config";

export async function toggleUnit(config: Config): Promise<Config> {
  const next = await toggleStoredUnit(config);
  printMessage(`Unidad cambiada a ${unitSymbol(next.unit)}.`);
  return next;
}