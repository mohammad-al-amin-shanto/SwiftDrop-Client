import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { RootState } from "../app/store";
import { getToken, clearToken, clearUser } from "../lib/storage";
import { clearAuthState } from "../features/auth/authSlice";
import { toast } from "react-toastify";

const BASE_URL =
  (import.meta.env && (import.meta.env.VITE_API_URL as string)) ??
  "http://localhost:4000/api";

if (import.meta.env && import.meta.env.DEV) {
  console.info("[baseApi] API base URL:", BASE_URL);
}

/**
 * Raw fetchBaseQuery instance that attaches token from storage or redux
 * and sets sensible defaults.
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, api) => {
    // Prefer token from local storage (persisted) so reloads keep working.
    const tokenFromStorage = getToken(); // string | null

    // Trying reading token from redux store (may be undefined)
    let tokenFromStore: string | undefined;
    try {
      const getState = api.getState as () => RootState | undefined;
      const maybe = getState?.()?.auth?.token;
      tokenFromStore =
        maybe === null ? undefined : (maybe as string | undefined);
    } catch {
      tokenFromStore = undefined;
    }

    // Final token (string | undefined)
    const token = tokenFromStorage ?? tokenFromStore ?? undefined;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    // DEV logging of outgoing headers to confirm token goes out
    if (import.meta.env && import.meta.env.DEV) {
      try {
        const headObj: Record<string, string> = {};
        headers.forEach((value, key) => (headObj[key] = value));
        console.debug("[baseApi] prepared headers:", headObj);
      } catch {
        // ignore logging errors
      }
    }

    return headers;
  },
}) as BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

/**
 * Wrapper around rawBaseQuery which handles 401 responses:
 * - clears local storage
 * - clears redux auth state
 * - returns original error so callers see it
 */
const baseQueryWith401Handler: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    try {
      // Clear persisted storage keys
      clearToken();
      clearUser();
      // Clear redux slice
      api.dispatch(clearAuthState());
    } catch (e) {
      console.debug("401 handler cleanup failed:", e);
    }

    // OPTIONAL: notify user (uncomment to enable)
    toast.error("Session expired — please sign in again.");
    // OPTIONAL: redirect user to login page
    // window.location.href = "/auth/login";

    // Return original error upward so components can handle it
    return result;
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWith401Handler,
  tagTypes: ["User", "Parcel", "Auth"],
  endpoints: () => ({}),
});

// named + default export for compatibility with different import styles
export default baseApi;
