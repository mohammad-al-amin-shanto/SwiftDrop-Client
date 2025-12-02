// src/api/authApi.ts
import type { User } from "../types";
import { baseApi } from "./baseApi";

/**
 * Normalize server response shapes into { token, user }.
 *
 * Servers commonly reply:
 *  { status: 'success', data: { user: {...}, accessToken: '...', refreshToken: '...' } }
 * or sometimes:
 *  { user: {...}, accessToken: '...' }
 *
 * This module tries to detect both shapes gracefully.
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

/** Safely extract the "data-like" object from the various payload shapes. */
function extractServerData(response: ServerAuthResponse): ServerData {
  if (!response || typeof response !== "object") return null;

  const asRecord = response as Record<string, unknown>;

  if (
    "data" in asRecord &&
    typeof asRecord.data === "object" &&
    asRecord.data !== null
  ) {
    return asRecord.data as ServerData;
  }

  // If top-level contains tokens or user, treat it as data
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

    // optional: get current user
    me: build.query<{ user: User }, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
      providesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useRegisterMutation, useMeQuery } = authApi;
export default authApi;
