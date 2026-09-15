import type { City } from "./City";

export type Unit = "celsius" | "fahrenheit";

export interface Config {
  defaultCity: string | null;
  cities: City[];
  unit: Unit;
}