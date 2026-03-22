import type { AuthSession } from "./types";

export const AUTH_STORAGE_KEY = "auth";
const AUTH_CHANGE_EVENT = "assetflow:auth-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<AuthSession>;
  return Boolean(session.token) && typeof session.userId === "number" && typeof session.expiresIn === "number";
}

export function readAuthSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isValidSession(parsed)) {
      return null;
    }

    return {
      ...parsed,
      issuedAt: typeof parsed.issuedAt === "number" ? parsed.issuedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveAuthSession(session: AuthSession) {
  if (!isBrowser()) {
    return;
  }

  const nextSession = {
    ...session,
    issuedAt: session.issuedAt ?? Date.now(),
  };

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function subscribeToAuthChanges(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleStorage = () => callback();
  const handleCustomEvent = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(AUTH_CHANGE_EVENT, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(AUTH_CHANGE_EVENT, handleCustomEvent);
  };
}

export function formatSessionExpiry(session: AuthSession | null) {
  if (!session?.issuedAt || !session.expiresIn) {
    return null;
  }

  return new Date(session.issuedAt + session.expiresIn).toLocaleString();
}
