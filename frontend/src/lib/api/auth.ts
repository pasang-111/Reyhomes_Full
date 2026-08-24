import { API_BASE, ApiError } from "./client";

export type ApiUser = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  marketing_opt_in: boolean;
  date_joined?: string;
  is_client: boolean;
  is_reypro: boolean;
};

export type AuthTokens = { access: string; refresh: string; user: ApiUser };

const ACCESS_KEY = "sl_access_token";
const REFRESH_KEY = "sl_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  window.localStorage.setItem(ACCESS_KEY, access);
  window.localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/api/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    return null;
  }

  const data = await res.json();
  window.localStorage.setItem(ACCESS_KEY, data.access);
  return data.access as string;
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  auth?: boolean; // attach bearer token, retrying once on 401 via refresh
};

/**
 * Auth-aware fetch. Kept separate from the plain `api` client in ./client
 * because it needs bearer-token attachment and one automatic refresh retry.
 */
export async function authFetch<T>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = false } = opts;

  const doFetch = async (token: string | null) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (auth && token) headers.Authorization = `Bearer ${token}`;
    return fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch(auth ? getAccessToken() : null);

  if (auth && res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) res = await doFetch(newToken);
  }

  if (!res.ok) {
    let body: unknown = null;
    let message = `Something went wrong (${res.status}). Please try again.`;
    try {
      body = await res.json();
      if (body && typeof body === "object") {
        const b = body as Record<string, unknown>;
        if (typeof b.detail === "string" && b.detail) message = b.detail;
        else if (typeof b.message === "string" && b.message) message = b.message;
        else {
          const parts: string[] = [];
          for (const [key, val] of Object.entries(b)) {
            if (key === "detail" || key === "message") continue;
            const label = key.replace(/_/g, " ");
            if (Array.isArray(val)) {
              const msgs = val.map((v) => String(v)).filter(Boolean);
              if (msgs.length) parts.push(`${label}: ${msgs.join(" ")}`);
            } else if (typeof val === "string" && val) {
              parts.push(`${label}: ${val}`);
            }
          }
          if (parts.length) message = parts.join(" · ");
        }
      }
    } catch {
      /* no body */
    }
    throw new ApiError(message, res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const authApi = {
  register: (payload: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    marketing_opt_in?: boolean;
    password: string;
    password_confirm: string;
  }) =>
    authFetch<AuthTokens>("/api/auth/register/", {
      method: "POST",
      body: payload,
    }),

  login: (email: string, password: string) =>
    authFetch<AuthTokens>("/api/auth/login/", {
      method: "POST",
      body: { email, password },
    }),

  me: () => authFetch<ApiUser>("/api/auth/me/", { auth: true }),

  requestPasswordReset: (email: string) =>
    authFetch<{ detail: string }>("/api/auth/password-reset/", {
      method: "POST",
      body: { email },
    }),

  confirmPasswordReset: (payload: {
    uid: string;
    token: string;
    password: string;
    password_confirm: string;
  }) =>
    authFetch<{ detail: string }>("/api/auth/password-reset/confirm/", {
      method: "POST",
      body: payload,
    }),
};
