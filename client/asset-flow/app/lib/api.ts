import { clearAuthSession } from "./session";

type Primitive = string | number | boolean;

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: BodyInit | null;
  json?: unknown;
  searchParams?: Record<string, Primitive | null | undefined>;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
  details?: string;
};

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function getApiBaseUrl() {
  const browserUrl = process.env.NEXT_PUBLIC_API_URL;
  const serverUrl = process.env.API_URL;

  if (typeof window === "undefined") {
    return serverUrl || browserUrl || "http://localhost:8080";
  }

  return browserUrl || serverUrl || "http://localhost:8080";
}

export function buildApiUrl(
  path: string,
  searchParams?: Record<string, Primitive | null | undefined>,
) {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalizedPath}`);

  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

async function buildApiError(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    const message = payload?.message || payload?.error || payload?.details || `Request failed with ${response.status}`;
    return new ApiError(message, response.status, payload);
  }

  const text = await response.text().catch(() => "");
  return new ApiError(text || `Request failed with ${response.status}`, response.status, text);
}

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith("XSRF-TOKEN="))
    ?.split("=")
    .slice(1)
    .join("=");
  return raw ? decodeURIComponent(raw) : null;
}

export function signOut(): void {
  fetch(buildApiUrl("/auth/logout"), { method: "POST", credentials: "include" }).catch(() => {});
  clearAuthSession();
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { auth = true, json, searchParams, headers, body, method = "GET", ...rest } = options;
  const requestHeaders = new Headers(headers);

  requestHeaders.set("Accept", "application/json, text/plain, */*");

  if (json !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const csrfToken = getCsrfToken();
  if (csrfToken && ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase())) {
    requestHeaders.set("X-XSRF-TOKEN", csrfToken);
  }

  const response = await fetch(buildApiUrl(path, searchParams), {
    ...rest,
    method,
    headers: requestHeaders,
    body: json !== undefined ? JSON.stringify(json) : body,
    cache: "no-store",
    redirect: "manual",
    credentials: "include",
  });

  if (response.type === "opaqueredirect" || response.status === 0) {
    if (auth) {
      clearAuthSession();
    }
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  if (!response.ok) {
    if (auth && response.status === 401) {
      clearAuthSession();
    }

    throw await buildApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while talking to the API.";
}
