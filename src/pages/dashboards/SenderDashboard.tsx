import React from "react";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
} from "react-icons/fa";
import CreateParcelForm from "../../components/parcels/CreateParcelForm";
import ParcelTable from "../../components/parcels/ParcelTable";
import { useAppSelector } from "../../app/hooks";
import { useParcelsStatsQuery } from "../../api/parcelsApi";
import ShipmentsBarChart from "../../components/charts/ShipmentsBarChart";
import StatusPieChart from "../../components/charts/StatusPieChart";
import DashboardTour from "../../components/ui/DashboardTour";

type ParcelsStatsShape = {
  total: number;
  delivered: number;
  inTransit: number;
  cancelled: number;
  monthly: { month: string; count: number }[];
};

const SenderDashboard: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const senderId = user?._id;

  const {
    data: stats,
    isLoading,
    isFetching,
    isError,
    error,
  } = useParcelsStatsQuery();

  const statsTyped = stats as ParcelsStatsShape | undefined;
  const statsLoading = isLoading || isFetching;

  const total = statsTyped?.total ?? 0;
  const delivered = statsTyped?.delivered ?? 0;
  const inTransit = statsTyped?.inTransit ?? 0;
  const cancelled = statsTyped?.cancelled ?? 0;

  if (isError) {
    console.error("Error loading parcel stats:", error);
  }

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
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                Sender Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto md:mx-0">
                Create new shipments, track their progress, and review delivery
                performance at a glance.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 gap-0.5">
              {statsLoading && !stats ? (
                <div className="animate-pulse text-slate-400 dark:text-slate-500">
                  Loading your shipment summary...
                </div>
              ) : (
                <>
                  <span className="font-medium">
                    Total parcels sent:{" "}
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

        {/* STATS CARDS – SAME STYLE AS ADMIN/RECEIVER */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
                {statsLoading ? "—" : total}
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
                {statsLoading ? "—" : delivered}
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
                {statsLoading ? "—" : inTransit}
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
                {statsLoading ? "—" : cancelled}
              </div>
            </div>
          </div>
        </section>

        {/* CHARTS – MATCH ADMIN LAYOUT */}
        <section
          data-driver-id="charts"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-stretch"
        >
          {/* Bar chart (2/3) */}
          <div className="lg:col-span-2 h-full bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-200">
              Monthly Shipments
            </h2>
            <ShipmentsBarChart
              data={statsTyped?.monthly ?? []}
              loading={statsLoading}
              height={320}
            />
          </div>

          {/* Pie chart (1/3) */}
          <div className="h-full bg-white dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <StatusPieChart
              stats={statsTyped}
              loading={statsLoading}
              title="Status Distribution"
              height={320}
            />
          </div>
        </section>

        {/* CREATE PARCEL */}
        <section
          data-driver-id="create-parcel"
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
                Create New Parcel
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mt-1">
                Fill in the receiver details, parcel information, and value to
                generate a new tracking ID for your shipment.
              </p>
            </div>
          </div>
          <CreateParcelForm />
        </section>

        {/* INFO HINT */}
        <section
          data-driver-id="parcel-search"
          className="bg-slate-50 dark:bg-slate-800 p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            After creating a parcel, use the filters and search in the table
            below to quickly find specific shipments by tracking ID, status, or
            receiver.
          </p>
        </section>

        {/* PARCEL TABLE */}
        <section
          data-driver-id="parcel-table"
          className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">
                Your Parcels
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                Manage all parcels you&apos;ve created. Track delivery progress,
                view full details, and keep an eye on problem shipments.
              </p>
            </div>
          </div>

          <ParcelTable senderId={senderId ?? undefined} initialLimit={10} />
        </section>

        <DashboardTour autostart={true} />
      </div>
    </div>
  );
};

export default SenderDashboard;
