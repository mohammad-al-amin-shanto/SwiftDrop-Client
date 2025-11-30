// src/lib/storage.ts
const TOKEN_KEY = "swiftdrop_token";
const USER_KEY = "swiftdrop_user";

function isBadString(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "undefined" ||
    value === "null" ||
    value === ""
  );
}

export function setToken(token: string | null | undefined): void {
  try {
    if (isBadString(token)) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    localStorage.setItem(TOKEN_KEY, String(token));
  } catch (err) {
    console.debug("storage.setToken failed:", (err as Error)?.message ?? err);
  }
}

export function getToken(): string | null {
  try {
    const v = localStorage.getItem(TOKEN_KEY);
    if (isBadString(v)) return null;
    return v;
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

export function setUser(user: unknown | null | undefined): void {
  try {
    if (user === null || user === undefined) {
      localStorage.removeItem(USER_KEY);
      return;
    }
    // if user is already a string, avoid double-stringify
    if (typeof user === "string") {
      if (isBadString(user)) {
        localStorage.removeItem(USER_KEY);
        return;
      }
      localStorage.setItem(USER_KEY, user);
      return;
    }
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.debug("storage.setUser failed:", (err as Error)?.message ?? err);
  }
}

export function getUser(): unknown | null {
  try {
    const json = localStorage.getItem(USER_KEY);
    if (isBadString(json)) return null;
    try {
      return json ? JSON.parse(json) : null;
    } catch {
      // if it's not valid JSON but is a plain string, return the string
      return json ?? null;
    }
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
