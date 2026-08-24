const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body ?? null;
  }
}

/** Turn DRF field errors into a single readable string. */
function formatErrorBody(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const b = body as Record<string, unknown>;

  if (typeof b.detail === "string" && b.detail) return b.detail;

  // Field-level errors: { title: ["This field is required."], inclusion_list: ["..."] }
  const parts: string[] = [];
  for (const [key, val] of Object.entries(b)) {
    if (key === "detail") continue;
    const label = key.replace(/_/g, " ");
    if (Array.isArray(val)) {
      const msgs = val.map((v) => String(v)).filter(Boolean);
      if (msgs.length) parts.push(`${label}: ${msgs.join(" ")}`);
    } else if (typeof val === "string" && val) {
      parts.push(`${label}: ${val}`);
    }
  }
  if (parts.length) return parts.join(" · ");
  return fallback;
}

type NextFetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

export type RequestOptions = RequestInit & {
  auth?: boolean;
  /** Next.js fetch cache options (App Router). */
  next?: NextFetchOptions;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false, ...init } = options;
  const url = `${API_BASE}/api${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.body && !(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (auth && typeof window !== "undefined") {
    const memberToken = window.localStorage.getItem("sl_access_token");
    if (memberToken) headers.Authorization = `Bearer ${memberToken}`;
  }
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* ignore */
    }
    const message = formatErrorBody(body, `Something went wrong (${res.status}). Please check the fields and try again.`);
    throw new ApiError(message, res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, {
      ...init,
      method: "POST",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, {
      ...init,
      method: "PUT",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, {
      ...init,
      method: "PATCH",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string, init?: RequestOptions) =>
    request<T>(path, { ...init, method: "DELETE" }),
};

export { API_BASE };