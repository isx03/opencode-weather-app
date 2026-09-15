import type { Unit } from "../types/Config";
import type { MenuOption } from "../types/MenuOption";
import { cyan } from "../utils/colors";
import { BOX } from "../utils/constants";
import { unitSymbol } from "../utils/format";

const MENU_OPTIONS: MenuOption[] = [
  { id: "1", label: "Clima de ciudad default" },
  { id: "2", label: "Clima de todas las ciudades" },
  { id: "3", label: "Buscar y agregar ciudad" },
  { id: "4", label: "Eliminar ciudad" },
  { id: "5", label: "Establecer ciudad default" },
  { id: "6", label: "Pronóstico 7 días (todas las ciudades)" },
  { id: "7", label: "Listar ciudades" },
  { id: "8", label: "Ajustes" },
  { id: "9", label: "Salir" },
];

export function printMenu(cityCount: number, unit: Unit): void {
  console.log(cyan(BOX));
  console.log(cyan("         WEATHER CLI"));
  console.log(cyan(BOX));
  for (const option of MENU_OPTIONS) {
    const detail =
      option.id === "2" ? ` (${cityCount})` : option.id === "8" ? ` (${unitSymbol(unit)})` : "";
    console.log(cyan(`  ${option.id}. ${option.label}${detail}`));
  }
  console.log(cyan(BOX));
}