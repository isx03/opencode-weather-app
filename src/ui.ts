import { stdin as input, stdout as output } from "node:process";
import type { City, DailyForecast, Unit } from "./types";

const BOX = "═".repeat(40);
const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";

const COLOR = process.stdout.isTTY && !process.env.NO_COLOR;

function paint(code: string, text: string): string {
  return COLOR ? `${code}${text}${RESET}` : text;
}

let buffer = "";
let waiting: ((line: string) => void) | null = null;

input.setEncoding("utf8");
input.on("data", (chunk: string) => {
  buffer += chunk;
  while (waiting) {
    const line = shiftLine();
    if (line === null) break;
    const resolve = waiting;
    waiting = null;
    resolve(line);
  }
});
input.on("close", () => {
  if (waiting) {
    const resolve = waiting;
    waiting = null;
    resolve("");
  }
});

function shiftLine(): string | null {
  const idx = buffer.indexOf("\n");
  if (idx === -1) return null;
  const line = buffer.slice(0, idx).replace(/\r$/, "");
  buffer = buffer.slice(idx + 1);
  return line;
}

export function cyan(text: string): string {
  return paint(CYAN, text);
}

export function unitSymbol(unit: Unit): string {
  return unit === "celsius" ? "°C" : "°F";
}

export function readInput(prompt: string): Promise<string> {
  output.write(prompt);
  const line = shiftLine();
  if (line !== null) return Promise.resolve(line);
  return new Promise((resolve) => {
    waiting = resolve;
  });
}

export function closeInput(): void {
  input.removeAllListeners("data");
}

export function formatTemperature(value: number): string {
  return String(Math.round(value * 10) / 10);
}

export function printMenu(cityCount: number, unit: Unit): void {
  console.log(paint(CYAN, BOX));
  console.log(paint(CYAN, "         WEATHER CLI"));
  console.log(paint(CYAN, BOX));
  console.log(paint(CYAN, "  1. Clima de ciudad default"));
  console.log(paint(CYAN, `  2. Clima de todas las ciudades (${cityCount})`));
  console.log(paint(CYAN, "  3. Buscar y agregar ciudad"));
  console.log(paint(CYAN, "  4. Eliminar ciudad"));
  console.log(paint(CYAN, "  5. Establecer ciudad default"));
  console.log(paint(CYAN, "  6. Pronóstico 7 días (todas las ciudades)"));
  console.log(paint(CYAN, `  8. Ajustes (${unitSymbol(unit)})`));
  console.log(paint(CYAN, "  9. Salir"));
  console.log(paint(CYAN, BOX));
}

export function printWeather(city: City, temp: number, unit: Unit): void {
  const location = [city.name, city.country]
    .filter((x): x is string => Boolean(x))
    .join(", ");
  console.log(paint(CYAN, BOX));
  console.log(paint(CYAN, `  ${location}`));
  console.log(
    `  Temperatura actual: ${paint(`${YELLOW}${BOLD}`, `${formatTemperature(temp)} ${unitSymbol(unit)}`)}`,
  );
  console.log(paint(CYAN, BOX));
}

const DAY_NAMES = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export function weatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Despejado",
    1: "Mayormente despejado",
    2: "Parcialmente nublado",
    3: "Nublado",
    45: "Niebla",
    48: "Niebla con escarcha",
    51: "Llovizna ligera",
    53: "Llovizna",
    55: "Llovizna densa",
    56: "Llovizna helada ligera",
    57: "Llovizna helada densa",
    61: "Lluvia ligera",
    63: "Lluvia",
    65: "Lluvia fuerte",
    66: "Lluvia helada ligera",
    67: "Lluvia helada fuerte",
    71: "Nieve ligera",
    73: "Nieve",
    75: "Nieve fuerte",
    77: "Copos de nieve",
    80: "Chubascos ligeros",
    81: "Chubascos",
    82: "Chubascos fuertes",
    85: "Chubascos de nieve ligeros",
    86: "Chubascos de nieve fuertes",
    95: "Tormenta",
    96: "Tormenta con granizo ligero",
    99: "Tormenta con granizo fuerte",
  };
  return descriptions[code] ?? "Sin datos";
}

function dayLabel(time: string): string {
  return DAY_NAMES[new Date(time).getDay()] ?? "";
}

function shortDate(time: string): string {
  const [year, month, day] = time.split("-");
  return [day, month].filter(Boolean).join("/").padStart(5, " ");
}

export function printForecast7Days(city: City, forecast: DailyForecast[], unit: Unit): void {
  const location = [city.name, city.country]
    .filter((x): x is string => Boolean(x))
    .join(", ");
  console.log(paint(CYAN, BOX));
  console.log(paint(CYAN, `  ${location} — Pronóstico 7 días`));
  console.log(paint(CYAN, BOX));
  forecast.forEach((day) => {
    const min = `${formatTemperature(day.tempMin)}${unitSymbol(unit)}`;
    const max = `${formatTemperature(day.tempMax)}${unitSymbol(unit)}`;
    console.log(
      `  ${dayLabel(day.time).padEnd(4)} ${shortDate(day.time)}  ` +
        `${weatherDescription(day.weatherCode).padEnd(22)}  ` +
        `Mín ${min}  Máx ${max}`,
    );
  });
  console.log(paint(CYAN, BOX));
}

export function printCityList(cities: City[]): void {
  cities.forEach((city, index) => {
    const location = [city.name, city.country]
      .filter((x): x is string => Boolean(x))
      .join(", ");
    console.log(`  ${index + 1}. ${location}`);
  });
}

export function printMessage(message: string): void {
  console.log(paint(GREEN, `  ${message}`));
}

export function printError(message: string): void {
  console.log(paint(RED, `  ${message}`));
}