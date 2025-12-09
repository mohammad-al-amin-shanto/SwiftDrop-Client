// src/pages/dashboards/ReceiverDashboard.tsx
import React from "react";
import { FaBoxOpen, FaCheckCircle, FaTruck, FaClock } from "react-icons/fa";
import ParcelTable from "../../components/parcels/ParcelTable";
import { useParcelsStatsQuery } from "../../api/parcelsApi";
import StatusPieChart from "../../components/charts/StatusPieChart";

type ParcelsStatsShape = {
  total: number;
  delivered: number;
  inTransit: number;
  cancelled: number;
  monthly: { month: string; count: number }[];
};

const ReceiverDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useParcelsStatsQuery();

  const total = (stats as ParcelsStatsShape | undefined)?.total ?? 0;
  const delivered = stats?.delivered ?? 0;
  const inTransit = stats?.inTransit ?? 0;
  const cancelled = stats?.cancelled ?? 0;
  const pending = Math.max(0, total - (delivered + inTransit + cancelled));

  const isStatsLoading = statsLoading && !stats;

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 md:py-6">
      <div className="w-full max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* HEADER */}
        <section className="bg-white dark:bg-slate-800 p-4 sm:p-5 md:p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1 sm:space-y-2 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                Receiver Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto md:mx-0">
                Track your incoming parcels, see what&apos;s on the way, and
                quickly confirm deliveries from one place.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 gap-0.5">
              {isStatsLoading ? (
                <div className="animate-pulse text-slate-400 dark:text-slate-500">
                  Loading your parcel summary...
                </div>
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
                    <span>Pending: {pending}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* STATS CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Incoming (Total) */}
          <div className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl hover:shadow-md transition flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 shrink-0">
              <FaBoxOpen className="text-sm sm:text-base" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">
                Incoming Parcels
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">
                {isStatsLoading ? "—" : total}
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
                {isStatsLoading ? "—" : delivered}
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
                {isStatsLoading ? "—" : inTransit}
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl hover:shadow-md transition flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 shrink-0">
              <FaClock className="text-sm sm:text-base" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">
                Pending / Not Confirmed
              </div>
              <div className="text-xl sm:text-2xl font-semibold text-amber-600 dark:text-amber-400">
                {isStatsLoading ? "—" : pending}
              </div>
            </div>
          </div>
        </section>

        {/* PARCELS LIST – FULL WIDTH */}
        <section className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50">
                My Parcels
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                Track all parcels sent to you. Use the actions to view full
                details or confirm delivery once received.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 whitespace-nowrap">
                📥 Incoming shipments
              </span>
            </div>
          </div>

          <ParcelTable initialLimit={10} />
        </section>

        {/* STATUS DISTRIBUTION – SEPARATE SECTION BELOW */}
        <section className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <StatusPieChart
            stats={stats as ParcelsStatsShape | undefined}
            loading={statsLoading}
            title="Status Distribution"
            height={320}
          />
        </section>

        {/* INFO / HELPER SECTION */}
        <section className="bg-white dark:bg-slate-800 p-3.5 sm:p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
            How to confirm delivery
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">
            1. Find your parcel in the &quot;My Parcels&quot; table.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">
            2. Click <span className="font-semibold">View</span> to open full
            details.
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            3. From the details modal, use the available actions (if enabled) to
            confirm delivery or check the full status timeline.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReceiverDashboard;
