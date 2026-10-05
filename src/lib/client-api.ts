import type { ApiErrorBody, Debt } from "@/lib/types";

export class ApiRequestError extends Error {
  constructor(message: string, public status: number, public fields?: Record<string, string>) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (res.status === 401) {
    window.location.href = "/login";
    throw new ApiRequestError("Sesi berakhir. Silakan login lagi.", 401);
  }
  if (res.status === 204) return undefined as T;

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (json as ApiErrorBody | null)?.error;
    throw new ApiRequestError(err?.message ?? "Terjadi kesalahan.", res.status, err?.fields);
  }
  return (json as { data: T }).data;
}

export const debtsApi = {
  list: (query: { status?: string; type?: string } = {}) => {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v && v !== "all") as [string, string][],
    ).toString();
    return request<Debt[]>(`/api/debts${qs ? `?${qs}` : ""}`);
  },
  create: (body: unknown) =>
    request<Debt>("/api/debts", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: unknown) =>
    request<Debt>(`/api/debts/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  remove: (id: string) => request<void>(`/api/debts/${id}`, { method: "DELETE" }),
};
