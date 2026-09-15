import { afterAll, afterEach, describe, expect, spyOn, test } from "bun:test";
import { printMenu } from "../../../src/presentation/menu";

const log = spyOn(console, "log");

afterEach(() => log.mockClear());

afterAll(() => log.mockRestore());

function joinedOutput(): string {
  return log.mock.calls.map((call) => String(call[0])).join("\n");
}

describe("printMenu", () => {
  test("muestra el encabezado y todas las opciones", () => {
    printMenu(2, "celsius");
    const out = joinedOutput();
    expect(out).toContain("WEATHER CLI");
    expect(out).toContain("1. Clima de ciudad default");
    expect(out).toContain("2. Clima de todas las ciudades (2)");
    expect(out).toContain("3. Buscar y agregar ciudad");
    expect(out).toContain("4. Eliminar ciudad");
    expect(out).toContain("5. Establecer ciudad default");
    expect(out).toContain("6. Pronóstico 7 días (todas las ciudades)");
    expect(out).toContain("7. Listar ciudades");
    expect(out).toContain("8. Ajustes (°C)");
    expect(out).toContain("9. Salir");
  });

  test("refleja el conteo de ciudades y la unidad configurada", () => {
    printMenu(0, "fahrenheit");
    const out = joinedOutput();
    expect(out).toContain("2. Clima de todas las ciudades (0)");
    expect(out).toContain("8. Ajustes (°F)");
  });
});