import { baseApi } from "./baseApi";
import type { ReceiverDashboardStats, ApiResponse } from "../types/dashboard";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReceiverDashboard: builder.query<
      ApiResponse<ReceiverDashboardStats>,
      void
    >({
      query: () => "/dashboard/receiver",
    }),
  }),
});

export const { useGetReceiverDashboardQuery } = dashboardApi;
