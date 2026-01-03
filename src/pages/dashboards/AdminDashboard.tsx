import React from "react";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
} from "react-icons/fa";
import UsersTable from "../../components/admin/UsersTable";
import ParcelTable from "../../components/parcels/ParcelTable";
import { useParcelsStatsQuery } from "../../api/parcelsApi";
import ShipmentsBarChart from "../../components/charts/ShipmentsBarChart";
import StatusPieChart from "../../components/charts/StatusPieChart";
import { DashboardTour } from "./../../components/ui/DashboardTour";

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useParcelsStatsQuery();

  const total = stats?.total ?? 0;
  const delivered = stats?.delivered ?? 0;
  const inTransit = stats?.inTransit ?? 0;
  const cancelled = stats?.cancelled ?? 0;

  const isStatsLoading = isLoading || !stats;

  const pending = Math.max(total - (delivered + inTransit + cancelled), 0);
  const hasOperationalIssues = pending > 10;

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 md:py-6">
      <div className="w-full max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* HEADER */}
        <section
          data-driver-id="hero"
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1 sm:space-y-2 text-center md:text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                  Admin Dashboard
                </h1>

                {hasOperationalIssues && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-medium">
                    ⚠ Operational backlog
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto md:mx-0">
                Monitor parcel activity, user accounts, and overall system
                health from a single, centralized view.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 gap-0.5">
              {isStatsLoading ? (
                <span className="text-xs text-slate-400 animate-pulse">
                  Fetching system metrics…
                </span>
              ) : (
                <>
                  <span className="font-medium">
                    Total parcels:{" "}
                    <span className="text-slate-900 dark:text-slate-100">
                      {total}
                    </span>
                  </span>
                  <span className="flex flex-wrap justify-center md:justify-end gap-x-1.5">
                    <span>Delivered: {delivered}</span>
                    <span>·</span>
                    <span>In transit: {inTransit}</span>
                    <span>·</span>
                    <span>Cancelled: {cancelled}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* STATS CARDS */}
        <section
          data-driver-id="stats"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"
        >
          {/* Total Parcels */}
          <div className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl hover:shadow-md transition flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 shrink-0">
              <FaBoxOpen className="text-sm sm:text-base" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">
                Total Parcels
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                {isStatsLoading ? (
                  <span className="animate-pulse text-slate-400">--</span>
                ) : (
                  total
                )}
              </div>
            </div>
          </div>

          {/* Pending */}
          <div
            className={`shadow-sm border rounded-xl p-3.5 sm:p-4 transition flex items-center gap-3 sm:gap-4
    ${
      hasOperationalIssues
        ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
    }`}
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0
      ${
        hasOperationalIssues
          ? "bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200"
          : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
      }`}
            >
              ⏳
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">
                  Pending
                </span>

                {hasOperationalIssues && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 font-medium">
                    Attention
                  </span>
                )}
              </div>

              <div
                className={`text-xl sm:text-2xl font-semibold ${
                  hasOperationalIssues
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {isStatsLoading ? (
                  <span className="animate-pulse text-slate-400">--</span>
                ) : (
                  pending
                )}
              </div>
            </div>
          </div>

          {/* In Transit */}
          <div className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl hover:shadow-md transition flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shrink-0">
              <FaTruck className="text-sm sm:text-base" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">
                In Transit
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {isStatsLoading ? (
                  <span className="animate-pulse text-slate-400">--</span>
                ) : (
                  inTransit
                )}
              </div>
            </div>
          </div>

          {/* Delivered */}
          <div className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl hover:shadow-md transition flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 shrink-0">
              <FaCheckCircle className="text-sm sm:text-base" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">
                Delivered
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                {isStatsLoading ? (
                  <span className="animate-pulse text-slate-400">--</span>
                ) : (
                  delivered
                )}
              </div>
            </div>
          </div>

          {/* Cancelled */}
          <div className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl hover:shadow-md transition flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300 shrink-0">
              <FaTimesCircle className="text-sm sm:text-base" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">
                Cancelled
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-rose-600 dark:text-rose-400">
                {isStatsLoading ? (
                  <span className="animate-pulse text-slate-400">--</span>
                ) : (
                  cancelled
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CHARTS – STACKED ON SMALL, SIDE-BY-SIDE ON LG */}
        <section
          data-driver-id="charts"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-start"
        >
          {/* ================= MONTHLY SHIPMENTS ================= */}
          <div className="lg:col-span-2">
            {isStatsLoading ? (
              <div className="h-80 flex items-center justify-center text-sm text-slate-400 animate-pulse">
                Loading shipment trends…
              </div>
            ) : stats && stats.monthly?.length ? (
              <ShipmentsBarChart
                data={stats.monthly}
                loading={false}
                title="Monthly Shipments"
                height={320}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-sm text-slate-500">
                No shipment data available yet
              </div>
            )}
          </div>

          {/* ================= STATUS DISTRIBUTION ================= */}
          <div>
            {isStatsLoading ? (
              <div className="h-80 flex items-center justify-center text-sm text-slate-400 animate-pulse">
                Loading status breakdown…
              </div>
            ) : stats ? (
              <StatusPieChart
                stats={stats}
                loading={false}
                title="Status Distribution"
                height={320}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-sm text-slate-500">
                No status data available
              </div>
            )}
          </div>
        </section>

        {/* MANAGEMENT SECTIONS */}
        <section className="space-y-5 md:space-y-6">
          {/* Parcels management */}
          <div className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Parcels Management
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                  Search, filter, update status, and cancel parcels from a
                  single interface.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 whitespace-nowrap">
                  📦 Operational control
                </span>
              </div>
            </div>

            {/* ParcelTable handles its own responsiveness horizontally */}
            <ParcelTable initialLimit={10} showConfirmAll embedded />
          </div>

          {/* Users management */}
          <div
            data-driver-id="users-table"
            className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
                  Users Management
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                  View registered users, review roles, and block/unblock
                  accounts when required.
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 whitespace-nowrap">
                  👥 Admin tools
                </span>
              </div>
            </div>

            {/* UsersTable already has overflow-x-auto logic inside */}
            <UsersTable />
          </div>
        </section>
        {/* ✅ ADMIN DASHBOARD TOUR */}
        <DashboardTour role="admin" autostart />
      </div>
    </div>
  );
};

export default AdminDashboard;
