/**
 * Robust localStorage helpers for auth token and user object.
 * - Treats "undefined", "null", empty or whitespace-only strings as absent.
 * - Avoids double-stringifying string user payloads.
 * - Keeps debug logging minimal (console.debug) so it's safe for production builds.
 */

const TOKEN_KEY = "swiftdrop_token";
const USER_KEY = "swiftdrop_user";

function isBadString(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "undefined" ||
    value === "null" ||
    (typeof value === "string" && value.trim() === "")
  );
}

/**
 * Persist a token. Passing null/undefined/blank will remove the token.
 */
export function setToken(token: string | null | undefined): void {
  try {
    if (isBadString(token)) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    localStorage.setItem(TOKEN_KEY, String(token));
  } catch (err) {
    // keep quiet in production-like environments, but helpful in dev
    console.debug("storage.setToken failed:", (err as Error)?.message ?? err);
  }
}

/**
 * Read token from storage. Returns null for missing / invalid values.
 */
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

/** Remove token */
export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.debug("storage.clearToken failed:", (err as Error)?.message ?? err);
  }
}

/**
 * Persist a user object.
 * - If given null/undefined, removes the stored user.
 * - If given a string, stores it as-is (unless blank/invalid).
 * - Otherwise JSON.stringify the object.
 */
export function setUser(user: unknown | null | undefined): void {
  try {
    if (user === null || user === undefined) {
      localStorage.removeItem(USER_KEY);
      return;
    }
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

/**
 * Read user from storage.
 * - If stored value is JSON, parse and return it.
 * - If it's a plain string (non-JSON), return the string.
 * - Returns null for missing/invalid values.
 */
export function getUser(): unknown | null {
  try {
    const json = localStorage.getItem(USER_KEY);
    if (isBadString(json)) return null;
    try {
      return json ? JSON.parse(json) : null;
    } catch {
      // if it isn't JSON, return the raw string
      return json ?? null;
    }
  } catch (err) {
    console.debug("storage.getUser failed:", (err as Error)?.message ?? err);
    return null;
  }
}

/** Remove user */
export function clearUser(): void {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    console.debug("storage.clearUser failed:", (err as Error)?.message ?? err);
  }
}
