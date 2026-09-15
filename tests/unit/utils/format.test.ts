import { describe, expect, test } from "bun:test";
import { DAY_NAMES } from "../../../src/utils/constants";
import { dayLabel, formatTemperature, shortDate, unitSymbol } from "../../../src/utils/format";

describe("formatTemperature", () => {
  test("redondea a un decimal", () => {
    expect(formatTemperature(21.44)).toBe("21.4");
    expect(formatTemperature(21.45)).toBe("21.5");
    expect(formatTemperature(-3.26)).toBe("-3.3");
  });

  test("preserva valores sin decimales", () => {
    expect(formatTemperature(7)).toBe("7");
    expect(formatTemperature(0)).toBe("0");
  });
});

describe("unitSymbol", () => {
  test("celsius se muestra como °C", () => {
    expect(unitSymbol("celsius")).toBe("°C");
  });

  test("fahrenheit se muestra como °F", () => {
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });
});

describe("dayLabel", () => {
  test("devuelve la etiqueta en español del día de la semana", () => {
    const time = "2026-09-14T12:00:00";
    expect(dayLabel(time)).toBe(DAY_NAMES[new Date(time).getDay()] ?? "");
  });

  test("devuelve cadena vacía para una fecha inválida", () => {
    expect(dayLabel("")).toBe("");
  });
});

describe("shortDate", () => {
  test("convierte YYYY-MM-DD a DD/MM", () => {
    expect(shortDate("2026-09-05")).toBe("05/09");
    expect(shortDate("2026-11-22")).toBe("22/11");
  });
});
