/**
 * Client for the Prelegal API.
 *
 * The API is same-origin in the container. When running `next dev` against a
 * local backend, set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export interface CatalogEntry {
  name: string;
  description: string;
  filename: string;
}

export interface DocumentInput<T> {
  doc_type: string;
  title: string;
  data: T;
}

export interface StoredDocument<T> extends DocumentInput<T> {
  id: string;
  created_at: string;
  updated_at: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    throw new Error(
      `${init?.method ?? "GET"} /api${path} failed (${response.status})`,
    );
  }

  return response.json() as Promise<T>;
}

export function fetchCatalog(): Promise<CatalogEntry[]> {
  return request("/catalog");
}

export function fetchDocument<T>(id: string): Promise<StoredDocument<T>> {
  return request(`/documents/${id}`);
}

export function createDocument<T>(
  input: DocumentInput<T>,
): Promise<StoredDocument<T>> {
  return request("/documents", { method: "POST", body: JSON.stringify(input) });
}

export function updateDocument<T>(
  id: string,
  input: DocumentInput<T>,
): Promise<StoredDocument<T>> {
  return request(`/documents/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}
