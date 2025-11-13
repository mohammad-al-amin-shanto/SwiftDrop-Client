// src/api/baseApi.ts
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { createApi } from "@reduxjs/toolkit/query/react";
import { RootState } from "../app/store";
import { getToken } from "../lib/storage";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Preferred: read token from storage util so RTK Query works outside of store contexts.
      const token = getToken() || (getState() as RootState).auth.token;
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
    credentials: "include", // optional, depends on backend
  }),
  tagTypes: ["User", "Parcel", "Auth"],
  endpoints: () => ({}),
});
