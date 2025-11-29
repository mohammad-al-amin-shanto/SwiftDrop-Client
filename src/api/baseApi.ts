// src/api/baseApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../app/store";
import { getToken } from "../lib/storage";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
console.log("API base URL:", BASE_URL);

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers: Headers, api) => {
      // 1) token from storage (string | null)
      const tokenFromStorage = getToken();

      // 2) attempt to read token from Redux store (could be string | null | undefined)
      const getState = api.getState as () => RootState | undefined;
      let tokenFromStoreRaw: string | null | undefined;
      try {
        tokenFromStoreRaw = getState?.()?.auth?.token;
      } catch {
        tokenFromStoreRaw = undefined;
      }

      // 3) normalize null -> undefined so final type is string | undefined
      const tokenFromStore: string | undefined =
        tokenFromStoreRaw === null ? undefined : tokenFromStoreRaw;

      // 4) final token (string | undefined) — no null here
      const token: string | undefined =
        tokenFromStorage ?? tokenFromStore ?? undefined;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
    credentials: "include",
  }),
  tagTypes: ["User", "Parcel", "Auth"],
  endpoints: () => ({}),
});
