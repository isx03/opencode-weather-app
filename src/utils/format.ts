import type { Unit } from "../types/Config";
import { DAY_NAMES } from "./constants";

export function formatTemperature(value: number): string {
  return String(Math.round(value * 10) / 10);
}

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function dayLabel(time: string): string {
  return DAY_NAMES[new Date(time).getDay()] ?? "";
}

export function shortDate(time: string): string {
  const [year, month, day] = time.split("-");
  return [day, month].filter(Boolean).join("/").padStart(5, " ");
}