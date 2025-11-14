// src/lib/storage.ts
const TOKEN_KEY = "swiftdrop_token";
const USER_KEY = "swiftdrop_user";

export function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.debug("storage.setToken failed:", (err as Error)?.message ?? err);
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.debug("storage.getToken failed:", (err as Error)?.message ?? err);
    return null;
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.debug("storage.clearToken failed:", (err as Error)?.message ?? err);
  }
}

export function setUser(user: unknown): void {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.debug("storage.setUser failed:", (err as Error)?.message ?? err);
  }
}

export function getUser(): unknown | null {
  try {
    const json = localStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch (err) {
    console.debug("storage.getUser failed:", (err as Error)?.message ?? err);
    return null;
  }
}

export function clearUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.debug("storage.clearUser failed:", (err as Error)?.message ?? err);
  }
}
