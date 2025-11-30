// src/api/authApi.ts
import type { User } from "../types";
import { baseApi } from "./baseApi";

/**
 * This module normalizes responses into { token, user } for the rest of the app.
 */

type ServerData =
  | {
      user?: User;
      accessToken?: string;
      token?: string;
      refreshToken?: string;
      [k: string]: unknown;
    }
  | null
  | undefined;

type ServerAuthResponse =
  | {
      status?: string;
      data?: ServerData;
      [k: string]: unknown;
    }
  | null
  | undefined;

type NormalizedAuth = { token: string; user: User | null };

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

/**
 * Safely extract the "data-like" object from various server response shapes.
 */
function extractServerData(response: ServerAuthResponse): ServerData {
  if (!response || typeof response !== "object") return null;

  // If the response has a 'data' property that's an object, prefer that.
  const asRecord = response as Record<string, unknown>;
  if (
    "data" in asRecord &&
    typeof asRecord.data === "object" &&
    asRecord.data !== null
  ) {
    return asRecord.data as ServerData;
  }

  // Otherwise, if the response itself looks like the data payload (has accessToken/user), return it.
  // We check for either accessToken/token or user to decide.
  if ("accessToken" in asRecord || "token" in asRecord || "user" in asRecord) {
    return asRecord as ServerData;
  }

  return null;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<NormalizedAuth, LoginPayload>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: ServerAuthResponse) => {
        const data = extractServerData(response);

        const token = (data && (data.accessToken ?? data.token)) ?? "";
        const user = (data && (data.user ?? null)) as User | null;

        return { token, user };
      },
      invalidatesTags: ["Auth"],
    }),

    register: build.mutation<NormalizedAuth, RegisterPayload>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      transformResponse: (response: ServerAuthResponse) => {
        const data = extractServerData(response);

        const token = (data && (data.accessToken ?? data.token)) ?? "";
        const user = (data && (data.user ?? null)) as User | null;

        return { token, user };
      },
      invalidatesTags: ["Auth"],
    }),

    me: build.query<{ user: User }, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
      providesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation, useMeQuery } = authApi;
export default authApi;
