// src/api/usersApi.ts
import { baseApi } from "./baseApi";
import type { User } from "../types";

type ListUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  blocked?: boolean;
};

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<
      { data: User[]; total: number; page: number; limit: number },
      ListUsersParams
    >({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.page) qs.set("page", String(params.page));
        if (params.limit) qs.set("limit", String(params.limit));
        if (params.search) qs.set("search", params.search || "");
        if (params.role) qs.set("role", params.role);
        if (typeof params.blocked === "boolean")
          qs.set("blocked", String(params.blocked));
        return {
          url: `/users${qs.toString() ? `?${qs.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: (r) =>
        r
          ? [
              ...r.data.map((u) => ({ type: "User" as const, id: u._id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUser: build.query<User, { id: string }>({
      query: ({ id }) => ({ url: `/users/${id}`, method: "GET" }),
      providesTags: (_result, _error, arg) => [{ type: "User", id: arg.id }],
    }),

    updateUser: build.mutation<User, { id: string; body: Partial<User> }>({
      query: ({ id, body }) => ({ url: `/users/${id}`, method: "PATCH", body }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
      ],
    }),

    blockUser: build.mutation<
      { success: boolean },
      { id: string; block: boolean }
    >({
      query: ({ id, block }) => ({
        url: `/users/${id}/block`,
        method: "PATCH",
        body: { block },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
      ],
    }),

    // Admin: optional assign delivery staff to parcel (if you want to call from usersApi)
    assignDelivery: build.mutation<
      { success: boolean },
      { userId: string; parcelId: string }
    >({
      query: ({ userId, parcelId }) => ({
        url: `/users/${userId}/assign`,
        method: "POST",
        body: { parcelId },
      }),
      invalidatesTags: [
        { type: "Parcel", id: "LIST" },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useListUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useBlockUserMutation,
  useAssignDeliveryMutation,
} = usersApi;
