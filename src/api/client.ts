import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
} from "@/lib/auth/storage";
import { ApiError } from "@/api/types";

const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
if (!rawApiBase) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is required (e.g. https://balon-admin-api.spherearth.ca)",
  );
}
const API_BASE = rawApiBase.replace(/\/$/, "");

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  formData?: FormData;
  signal?: AbortSignal;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/api/accounts/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearSession();
    return null;
  }

  const data = (await res.json()) as { access: string };
  setAccessToken(data.access);
  return data.access;
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const data = (await res.json()) as { error?: string; detail?: string };
    return new ApiError(
      data.error || data.detail || res.statusText || "Request failed",
      res.status,
    );
  } catch {
    return new ApiError(res.statusText || "Request failed", res.status);
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, formData, signal } = options;
  const headers: Record<string, string> = {};

  if (!formData) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const doFetch = (access?: string | null) => {
    const nextHeaders = { ...headers };
    if (auth && access) nextHeaders.Authorization = `Bearer ${access}`;
    return fetch(`${API_BASE}${path}`, {
      method,
      headers: nextHeaders,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal,
    });
  };

  let res = await doFetch();

  if (res.status === 401 && auth) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newAccess = await refreshPromise;
    if (!newAccess) {
      throw new ApiError("Authentication required", 401);
    }
    res = await doFetch(newAccess);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    throw await parseError(res);
  }

  return (await res.json()) as T;
}

export { API_BASE };
