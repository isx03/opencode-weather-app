import { stdin as input, stdout as output } from "node:process";
import type { City, Unit } from "./types";

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