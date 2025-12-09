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

type ListUsersResponse = {
  data: User[];
  total: number;
  page: number;
  limit: number;
};

// Generic backend response: { status, data }
type ApiResponse<T> = {
  status: "success" | "fail" | "error";
  message?: string;
  data: T;
};

// Type guard to check if something is ApiResponse<T>
function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  return (
    typeof response === "object" &&
    response !== null &&
    "data" in (response as Record<string, unknown>)
  );
}

// Helper to handle both raw and wrapped responses safely
function unwrap<T>(response: T | ApiResponse<T>): T {
  return isApiResponse<T>(response) ? response.data : (response as T);
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<ListUsersResponse, ListUsersParams>({
      query: (params = {}) => {
        const qs = new URLSearchParams();
        if (params.page) qs.set("page", String(params.page));
        if (params.limit) qs.set("limit", String(params.limit));
        if (params.search) qs.set("search", params.search || "");
        if (params.role) qs.set("role", params.role);
        if (typeof params.blocked === "boolean") {
          qs.set("blocked", String(params.blocked));
        }

        const queryString = qs.toString();
        return {
          url: `/users${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },

      // Works with:
      //  - { data: User[], total, page, limit }
      //  - { status, data: { data: User[], total, page, limit } }
      transformResponse: (
        response: ListUsersResponse | ApiResponse<ListUsersResponse>
      ): ListUsersResponse => {
        const data = unwrap<ListUsersResponse>(response);
        return {
          data: Array.isArray(data.data) ? data.data : [],
          total: typeof data.total === "number" ? data.total : 0,
          page: typeof data.page === "number" ? data.page : 1,
          limit: typeof data.limit === "number" ? data.limit : 10,
        };
      },

      providesTags: (result) => {
        if (!result) {
          return [{ type: "User" as const, id: "LIST" }];
        }

        const list = Array.isArray(result.data) ? result.data : [];

        return [
          ...list.map((u) => ({ type: "User" as const, id: u._id })),
          { type: "User" as const, id: "LIST" },
        ];
      },
    }),

    getUser: build.query<User, { id: string }>({
      query: ({ id }) => ({ url: `/users/${id}`, method: "GET" }),
      providesTags: (_result, _error, arg) => [
        { type: "User" as const, id: arg.id },
      ],
    }),

    updateUser: build.mutation<User, { id: string; body: Partial<User> }>({
      query: ({ id, body }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "User" as const, id: arg.id },
        { type: "User" as const, id: "LIST" },
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
        { type: "User" as const, id: arg.id },
        { type: "User" as const, id: "LIST" },
      ],
    }),

    // Admin: optional assign delivery staff to parcel
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
        { type: "Parcel" as const, id: "LIST" },
        { type: "User" as const, id: "LIST" },
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
