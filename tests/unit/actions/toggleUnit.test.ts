import { afterAll, beforeEach, describe, expect, mock, test } from "bun:test";
import type { Config } from "../../../src/types/Config";

const toggleStoredUnit = mock<(config: Config) => Promise<Config>>();
const printMessage = mock<(message: string) => void>();

mock.module("../../../src/storage/settingsStorage", () => ({ toggleStoredUnit }));
mock.module("../../../src/presentation/output", () => ({ printMessage }));

const baseConfig: Config = { defaultCity: null, cities: [], unit: "celsius" };

beforeEach(() => {
  toggleStoredUnit.mockReset();
  printMessage.mockReset();
  toggleStoredUnit.mockImplementation(async (config) => ({
    ...config,
    unit: config.unit === "celsius" ? "fahrenheit" : "celsius",
  }));
});

afterAll(() => mock.restore());

const { toggleUnit } = await import("../../../src/actions/toggleUnit");

describe("toggleUnit", () => {
  test("cambia de celsius a fahrenheit y lo informa", async () => {
    const next: Config = { ...baseConfig, unit: "fahrenheit" };
    toggleStoredUnit.mockResolvedValue(next);
    const result = await toggleUnit(baseConfig);
    expect(toggleStoredUnit).toHaveBeenCalledWith(baseConfig);
    expect(printMessage).toHaveBeenCalledWith("Unidad cambiada a °F.");
    expect(result).toBe(next);
  });

  test("cambia de fahrenheit a celsius y lo informa", async () => {
    const config: Config = { ...baseConfig, unit: "fahrenheit" };
    const next: Config = { ...baseConfig, unit: "celsius" };
    toggleStoredUnit.mockResolvedValue(next);
    const result = await toggleUnit(config);
    expect(printMessage).toHaveBeenCalledWith("Unidad cambiada a °C.");
    expect(result).toBe(next);
  });
});