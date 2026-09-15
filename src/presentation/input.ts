import { stdin as input, stdout as output } from "node:process";

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