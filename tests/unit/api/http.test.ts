import { afterEach, describe, expect, test } from "bun:test";
import { ApiError, fetchJson } from "../../../src/api/http";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

describe("fetchJson", () => {
  test("devuelve el JSON cuando la respuesta es OK", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }))) as unknown as typeof fetch;
    await expect(fetchJson<{ ok: boolean }>("https://ejemplo.test")).resolves.toEqual({ ok: true });
  });

  test("lanza ApiError con el código HTTP cuando la respuesta no es OK", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(new Response("error", { status: 500 }))) as unknown as typeof fetch;
    await expect(fetchJson("https://ejemplo.test")).rejects.toThrow(ApiError);
    await expect(fetchJson("https://ejemplo.test")).rejects.toThrow("HTTP 500");
  });

  test("propaga errores al parsear el body", async () => {
    globalThis.fetch = (() =>
      Promise.resolve(new Response("no es json", { status: 200 }))) as unknown as typeof fetch;
    await expect(fetchJson("https://ejemplo.test")).rejects.toThrow();
  });

  test("hace fetch a la URL indicada", async () => {
    let requested = "";
    globalThis.fetch = ((input: string) => {
      requested = input;
      return Promise.resolve(new Response("{}", { status: 200 }));
    }) as unknown as typeof fetch;
    await fetchJson("https://api.example.com/v1/recurso");
    expect(requested).toBe("https://api.example.com/v1/recurso");
  });
});