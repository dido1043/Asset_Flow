import type { AuthSession } from "./types";

export const AUTH_STORAGE_KEY = "auth";
const AUTH_CHANGE_EVENT = "assetflow:auth-change";

function isBrowser() {
  return typeof window !== "undefined";
}

function getPrimaryStorage() {
  return window.sessionStorage;
}

function getLegacyStorage() {
  return window.localStorage;
}

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<AuthSession>;
  return typeof session.userId === "number" && typeof session.expiresIn === "number";
}

export function readAuthSession(): AuthSession | null {
  if (!isBrowser()) {
    return null;
  }

  const storage = getPrimaryStorage();
  const legacyStorage = getLegacyStorage();

  try {
    const raw = storage.getItem(AUTH_STORAGE_KEY) ?? legacyStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isValidSession(parsed)) {
      storage.removeItem(AUTH_STORAGE_KEY);
      legacyStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    const session = {
      ...parsed,
      issuedAt: typeof parsed.issuedAt === "number" ? parsed.issuedAt : Date.now(),
    };

    if (session.issuedAt + session.expiresIn <= Date.now()) {
      storage.removeItem(AUTH_STORAGE_KEY);
      legacyStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    legacyStorage.removeItem(AUTH_STORAGE_KEY);

    return session;
  } catch {
    storage.removeItem(AUTH_STORAGE_KEY);
    legacyStorage.removeItem(AUTH_STORAGE_KEY);
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

  getPrimaryStorage().setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
  getLegacyStorage().removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthSession() {
  if (!isBrowser()) {
    return;
  }

  getPrimaryStorage().removeItem(AUTH_STORAGE_KEY);
  getLegacyStorage().removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function subscribeToAuthChanges(callback: () => void) {
  if (!isBrowser()) {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== AUTH_STORAGE_KEY) {
      return;
    }

    callback();
  };
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
