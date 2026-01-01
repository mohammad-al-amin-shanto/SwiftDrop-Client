import { baseApi } from "./baseApi";
import type { ReceiverDashboardStats, ApiResponse } from "../types/dashboard";

/* ================= TYPES ================= */

export type AdminDashboardStats = {
  totals: {
    totalParcels: number;
    pending: number;
    inTransit: number;
    delivered: number;
    cancelled: number;
  };
  today: {
    created: number;
    delivered: number;
    cancelled: number;
  };
  statusBreakdown: Record<string, number>;
  monthlyTrend: {
    month: string;
    count: number;
  }[];
};

/* ================= API ================= */

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /* Receiver dashboard */
    getReceiverDashboard: builder.query<
      ApiResponse<ReceiverDashboardStats>,
      void
    >({
      query: () => "/dashboard/receiver",
    }),

    /* Admin dashboard */
    getAdminDashboard: builder.query<ApiResponse<AdminDashboardStats>, void>({
      query: () => "/dashboard/admin",
    }),
  }),
});

export const { useGetReceiverDashboardQuery, useGetAdminDashboardQuery } =
  dashboardApi;
