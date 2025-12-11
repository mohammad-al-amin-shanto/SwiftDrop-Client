import { baseApi } from "./baseApi";
import type { User } from "../types";

// What the frontend will use everywhere
export type ListUsersResponse = {
  data: User[];
  total: number;
  page: number;
  limit: number;
};

// What the backend actually returns:
// {
//   items: User[];
//   meta: { total, page, limit, pages }
// }
type ListUsersResponseRaw = {
  items: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

export type ListUsersParams = {
  page?: number;
  limit?: number;
  q?: string;
  role?: string;
  blocked?: boolean;
};

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listUsers: build.query<ListUsersResponse, ListUsersParams>({
      query: ({ page = 1, limit = 10, q, role, blocked } = {}) => {
        const qs = new URLSearchParams();

        if (page) qs.set("page", String(page));
        if (limit) qs.set("limit", String(limit));
        if (q) qs.set("q", q);
        if (role) qs.set("role", role);
        if (typeof blocked === "boolean") {
          qs.set("blocked", String(blocked));
        }

        const queryString = qs.toString();

        return {
          url: `/users${queryString ? `?${queryString}` : ""}`,
          method: "GET",
        };
      },

      // Normalize backend shape → { data, total, page, limit }
      transformResponse: (
        response: ListUsersResponseRaw | ListUsersResponse
      ): ListUsersResponse => {
        // If it's already normalized for some reason, just ensure defaults:
        if ("data" in response && Array.isArray(response.data)) {
          return {
            data: response.data,
            total:
              typeof response.total === "number"
                ? response.total
                : response.data.length,
            page: typeof response.page === "number" ? response.page : 1,
            limit:
              typeof response.limit === "number"
                ? response.limit
                : response.data.length || 10,
          };
        }

        // Otherwise it's the raw backend shape { items, meta }
        const raw = response as ListUsersResponseRaw;
        const items = Array.isArray(raw.items) ? raw.items : [];
        const meta = raw.meta ?? {
          total: items.length,
          page: 1,
          limit: items.length || 10,
          pages: 1,
        };

        return {
          data: items,
          total: typeof meta.total === "number" ? meta.total : items.length,
          page: typeof meta.page === "number" ? meta.page : 1,
          limit:
            typeof meta.limit === "number" ? meta.limit : items.length || 10,
        };
      },

      providesTags: (result) => {
        const list = result?.data ?? [];
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

    // NOTE: backend has PUT /users/:id/block and /users/:id/unblock.
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
  overrideExisting: true,
});

export const {
  useListUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useBlockUserMutation,
  useAssignDeliveryMutation,
} = usersApi;
