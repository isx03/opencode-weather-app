import { afterEach, describe, expect, test } from "bun:test";
import { searchCity } from "../../../src/api/geocoding";
import type { GeoResult } from "../../../src/types/City";

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(body: unknown, onUrl?: (url: string) => void): void {
  globalThis.fetch = ((input: string) => {
    onUrl?.(input);
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  }) as unknown as typeof fetch;
}

const lima: GeoResult = { name: "Lima", country: "Perú", latitude: -12.04, longitude: -77.03 };

describe("searchCity", () => {
  test("devuelve los resultados del geocoder", async () => {
    stubFetch({ results: [lima] });
    const results = await searchCity("Lima");
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject(lima);
  });

  test("devuelve un array vacío cuando no hay resultados", async () => {
    stubFetch({});
    await expect(searchCity("xyz")).resolves.toEqual([]);
  });

  test("construye la URL con los parámetros esperados", async () => {
    let url = "";
    stubFetch({}, (u) => (url = u));
    await searchCity("Nueva York");
    expect(url).toContain("https://geocoding-api.open-meteo.com/v1/search");
    expect(url).toContain("name=Nueva%20York");
    expect(url).toContain("count=5");
    expect(url).toContain("language=es");
    expect(url).toContain("format=json");
  });
});