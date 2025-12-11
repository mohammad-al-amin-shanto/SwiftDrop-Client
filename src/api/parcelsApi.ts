import { baseApi } from "./baseApi";
import type { Parcel, ParcelCreateDto } from "../types";

type ListParcelsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  senderId?: string;
  receiverId?: string;
  // sent from ParcelTable
  dateRange?: "7d" | "30d" | "90d" | "all";
};

type PaginatedParcelsResponse = {
  data: Parcel[];
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

type ParcelsStatsInner = {
  total: number;
  delivered: number;
  inTransit: number;
  cancelled?: number;
  pending?: number;
  monthly: { month: string; count: number }[];
};

// Type guard to check if something is ApiResponse<T>
function isApiResponse<T>(response: unknown): response is ApiResponse<T> {
  if (
    typeof response === "object" &&
    response !== null &&
    "data" in (response as Record<string, unknown>)
  ) {
    return true;
  }
  return false;
}

// Helper to handle both raw and wrapped responses safely
function unwrap<T>(response: T | ApiResponse<T>): T {
  if (isApiResponse<T>(response)) {
    return response.data;
  }
  return response as T;
}

export const parcelsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listParcels: build.query<PaginatedParcelsResponse, ListParcelsParams>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.page) searchParams.set("page", String(params.page));
        if (params.limit) searchParams.set("limit", String(params.limit));
        if (params.search) searchParams.set("search", params.search);
        if (params.status) searchParams.set("status", params.status);
        if (params.sort) searchParams.set("sort", params.sort);
        if (params.senderId) searchParams.set("senderId", params.senderId);
        if (params.receiverId)
          searchParams.set("receiverId", params.receiverId);
        if (params.dateRange) searchParams.set("dateRange", params.dateRange);

        const qs = searchParams.toString();
        return { url: `/parcels${qs ? `?${qs}` : ""}`, method: "GET" };
      },
      // Works with either:
      // - { data, total, page, limit }
      // - { status, data: { data, total, page, limit } }
      transformResponse: (
        response:
          | PaginatedParcelsResponse
          | ApiResponse<PaginatedParcelsResponse>
      ) => unwrap<PaginatedParcelsResponse>(response),
      providesTags: (result) => {
        const list = result?.data ?? [];
        return [
          ...list.map((p) => ({
            type: "Parcel" as const,
            id: p._id,
          })),
          { type: "Parcel" as const, id: "LIST" },
        ];
      },
    }),

    getParcel: build.query<Parcel, { id: string }>({
      query: ({ id }) => ({ url: `/parcels/${id}`, method: "GET" }),
      // Works with Parcel or { status, data: Parcel }
      transformResponse: (response: Parcel | ApiResponse<Parcel>) =>
        unwrap<Parcel>(response),
      providesTags: (_result, _error, arg) => [
        { type: "Parcel" as const, id: arg.id },
      ],
    }),

    createParcel: build.mutation<Parcel, ParcelCreateDto>({
      query: (body) => ({ url: "/parcels", method: "POST", body }),
      // Works with Parcel or { status, data: Parcel }
      transformResponse: (response: Parcel | ApiResponse<Parcel>) =>
        unwrap<Parcel>(response),
      invalidatesTags: [{ type: "Parcel" as const, id: "LIST" }],
    }),

    // ✅ Use PUT to match routes like: router.put("/:id/status", ...)
    updateParcelStatus: build.mutation<
      Parcel,
      { id: string; status: string; note?: string }
    >({
      query: ({ id, status, note }) => ({
        url: `/parcels/${id}/status`,
        method: "PUT",
        body: { status, note },
      }),
      // Works with Parcel or { status, data: Parcel }
      transformResponse: (response: Parcel | ApiResponse<Parcel>) =>
        unwrap<Parcel>(response),
      // ❗ Invalidate list + item + stats so charts refresh
      invalidatesTags: (_result, _error, arg) => [
        { type: "Parcel" as const, id: arg.id },
        { type: "Parcel" as const, id: "LIST" },
        { type: "Parcel" as const, id: "STATS" },
      ],
    }),

    // ✅ Use PUT to match routes like: router.put("/:id/cancel", ...)
    cancelParcel: build.mutation<Parcel, { id: string }>({
      query: ({ id }) => ({ url: `/parcels/${id}/cancel`, method: "PUT" }),
      // Works with Parcel or { status, data: Parcel }
      transformResponse: (response: Parcel | ApiResponse<Parcel>) =>
        unwrap<Parcel>(response),
      // ❗ Also invalidate stats here
      invalidatesTags: (_result, _error, arg) => [
        { type: "Parcel" as const, id: arg.id },
        { type: "Parcel" as const, id: "LIST" },
        { type: "Parcel" as const, id: "STATS" },
      ],
    }),

    trackByTrackingId: build.query<Parcel, { trackingId: string }>({
      query: ({ trackingId }) => ({
        url: `/parcels/track/${trackingId}`,
        method: "GET",
      }),
      // Works with Parcel or { status, data: Parcel }
      transformResponse: (response: Parcel | ApiResponse<Parcel>) =>
        unwrap<Parcel>(response),
      providesTags: (result) =>
        result ? [{ type: "Parcel" as const, id: result._id }] : [],
    }),

    // Aggregates for charts / dashboard
    parcelsStats: build.query<
      {
        total: number;
        delivered: number;
        inTransit: number;
        cancelled: number;
        pending?: number;
        monthly: { month: string; count: number }[];
      },
      void
    >({
      query: () => ({ url: "/parcels/stats", method: "GET" }),
      // Works with ParcelsStatsInner or { status, data: ParcelsStatsInner }
      transformResponse: (
        response: ParcelsStatsInner | ApiResponse<ParcelsStatsInner>
      ) => {
        const data = unwrap<ParcelsStatsInner>(response) ?? {};
        const { total, delivered, inTransit, monthly, cancelled, pending } =
          data;
        return {
          total: total ?? 0,
          delivered: delivered ?? 0,
          inTransit: inTransit ?? 0,
          cancelled: cancelled ?? 0,
          pending,
          monthly: Array.isArray(monthly) ? monthly : [],
        };
      },
      // This is the tag we invalidate from mutations
      providesTags: [{ type: "Parcel" as const, id: "STATS" }],
    }),
  }),
});

export const {
  useListParcelsQuery,
  useGetParcelQuery,
  useCreateParcelMutation,
  useUpdateParcelStatusMutation,
  useCancelParcelMutation,
  useTrackByTrackingIdQuery,
  useParcelsStatsQuery,
} = parcelsApi;
