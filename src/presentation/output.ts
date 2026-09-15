import type { City } from "../types/City";
import type { Unit } from "../types/Config";
import type { DailyForecast } from "../types/Weather";
import { cyan, green, red, yellowBold } from "../utils/colors";
import { BOX } from "../utils/constants";
import { dayLabel, formatTemperature, shortDate, unitSymbol } from "../utils/format";

function locationLabel(city: Pick<City, "name" | "country">): string {
  return [city.name, city.country]
    .filter((x): x is string => Boolean(x))
    .join(", ");
}

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

export function printWeather(city: City, temp: number, unit: Unit): void {
  const location = locationLabel(city);
  console.log(cyan(BOX));
  console.log(cyan(`  ${location}`));
  console.log(
    `  Temperatura actual: ${yellowBold(`${formatTemperature(temp)} ${unitSymbol(unit)}`)}`,
  );
  console.log(cyan(BOX));
}

export function printForecast7Days(city: City, forecast: DailyForecast[], unit: Unit): void {
  const location = locationLabel(city);
  console.log(cyan(BOX));
  console.log(cyan(`  ${location} — Pronóstico 7 días`));
  console.log(cyan(BOX));
  forecast.forEach((day) => {
    const min = `${formatTemperature(day.tempMin)}${unitSymbol(unit)}`;
    const max = `${formatTemperature(day.tempMax)}${unitSymbol(unit)}`;
    console.log(
      `  ${dayLabel(day.time).padEnd(4)} ${shortDate(day.time)}  ` +
        `${weatherDescription(day.weatherCode).padEnd(22)}  ` +
        `Mín ${min}  Máx ${max}`,
    );
  });
  console.log(cyan(BOX));
}

export function printCityList(cities: City[]): void {
  cities.forEach((city, index) => {
    console.log(`  ${index + 1}. ${locationLabel(city)}`);
  });
}

export function printMessage(message: string): void {
  console.log(green(`  ${message}`));
}

export function printError(message: string): void {
  console.log(red(`  ${message}`));
}