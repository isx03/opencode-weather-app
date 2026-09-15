import { describe, expect, test } from "bun:test";

process.env.NO_COLOR = "1";

const { cyan, green, paint, red, yellowBold } = await import("../../../src/utils/colors");

describe("paint", () => {
  test("no añade códigos ANSI sin TTY o con NO_COLOR", () => {
    expect(paint("\x1b[31m", "texto")).toBe("texto");
  });
});

describe("colores", () => {
  test("devuelven el texto sin decorar", () => {
    expect(cyan("a")).toBe("a");
    expect(green("b")).toBe("b");
    expect(red("c")).toBe("c");
    expect(yellowBold("d")).toBe("d");
  });
});