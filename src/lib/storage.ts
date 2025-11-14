// src/lib/storage.ts
const TOKEN_KEY = "swiftdrop_token";
const USER_KEY = "swiftdrop_user";

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore for SSR or if storage blocked */
  }
}

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function setUser(user: unknown) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

export function getUser(): unknown | null {
  try {
    const json = localStorage.getItem(USER_KEY);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export function clearUser() {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {}
}
