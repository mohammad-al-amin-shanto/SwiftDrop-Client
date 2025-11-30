// src/api/parcelsApi.ts
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
};

export const parcelsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listParcels: build.query<
      { data: Parcel[]; total: number; page: number; limit: number },
      ListParcelsParams
    >({
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
        const qs = searchParams.toString();
        return { url: `/parcels${qs ? `?${qs}` : ""}`, method: "GET" };
      },
      providesTags: (result) => {
        const list = result?.data ?? [];
        return [
          ...list.map((p) => ({
            type: "Parcel" as const,
            id: p._id,
          })),
          { type: "Parcel", id: "LIST" },
        ];
      },
    }),

    getParcel: build.query<Parcel, { id: string }>({
      query: ({ id }) => ({ url: `/parcels/${id}`, method: "GET" }),
      providesTags: (_result, _error, arg) => [
        { type: "Parcel" as const, id: arg.id },
      ],
    }),

    createParcel: build.mutation<Parcel, ParcelCreateDto>({
      query: (body) => ({ url: "/parcels", method: "POST", body }),
      invalidatesTags: [{ type: "Parcel", id: "LIST" }],
    }),

    updateParcelStatus: build.mutation<
      Parcel,
      { id: string; status: string; note?: string }
    >({
      query: ({ id, status, note }) => ({
        url: `/parcels/${id}/status`,
        method: "PATCH",
        body: { status, note },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Parcel", id: arg.id },
        { type: "Parcel", id: "LIST" },
      ],
    }),

    cancelParcel: build.mutation<{ success: boolean }, { id: string }>({
      query: ({ id }) => ({ url: `/parcels/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Parcel", id: arg.id },
        { type: "Parcel", id: "LIST" },
      ],
    }),

    trackByTrackingId: build.query<Parcel, { trackingId: string }>({
      query: ({ trackingId }) => ({
        url: `/parcels/track/${trackingId}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result ? [{ type: "Parcel", id: result._id }] : [],
    }),

    // Aggregates for charts / dashboard
    parcelsStats: build.query<
      {
        total: number;
        delivered: number;
        inTransit: number;
        cancelled: number;
        monthly: { month: string; count: number }[];
      },
      void
    >({
      query: () => ({ url: "/parcels/stats", method: "GET" }),
      providesTags: [{ type: "Parcel", id: "STATS" }],
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
