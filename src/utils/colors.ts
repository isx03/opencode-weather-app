const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const BOLD = "\x1b[1m";

const COLOR = process.stdout.isTTY && !process.env.NO_COLOR;

export function paint(code: string, text: string): string {
  return COLOR ? `${code}${text}${RESET}` : text;
}

export function cyan(text: string): string {
  return paint(CYAN, text);
}

export function green(text: string): string {
  return paint(GREEN, text);
}

export function red(text: string): string {
  return paint(RED, text);
}

export function yellowBold(text: string): string {
  return paint(`${YELLOW}${BOLD}`, text);
}