export class ApiError extends Error {}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new ApiError(`HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}