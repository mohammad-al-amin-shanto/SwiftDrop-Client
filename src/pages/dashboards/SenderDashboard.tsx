// src/pages/dashboards/SenderDashboard.tsx
import React from "react";
import CreateParcelForm from "../../components/parcels/CreateParcelForm";
import ParcelTable from "../../components/parcels/ParcelTable";
import { useAppSelector } from "../../app/hooks";
import { useParcelsStatsQuery } from "../../api/parcelsApi";
import ShipmentsBarChart from "../../components/charts/ShipmentsBarChart";
import StatusPieChart from "../../components/charts/StatusPieChart";
import DashboardTour from "../../components/ui/DashboardTour";

const SenderDashboard: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const senderId = user?._id;

  const { data: stats, isLoading: statsLoading } = useParcelsStatsQuery();

  return (
    <div className="space-y-8 p-4 md:p-6">
      {/* Header */}
      <div
        data-driver-id="hero"
        className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Sender Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Overview of your shipments at a glance
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-xl hover:shadow-md transition">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Total Parcels
          </div>
          <div className="text-2xl font-semibold text-slate-900 dark:text-white mt-1">
            {stats?.total ?? "—"}
          </div>
        </div>

        <div className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-xl hover:shadow-md transition">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Delivered
          </div>
          <div className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
            {stats?.delivered ?? "—"}
          </div>
        </div>

        <div className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-xl hover:shadow-md transition">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            In Transit
          </div>
          <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1">
            {stats?.inTransit ?? "—"}
          </div>
        </div>

        <div className="shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-xl hover:shadow-md transition">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Cancelled
          </div>
          <div className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">
            {stats?.cancelled ?? "—"}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div
        data-driver-id="charts"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-stretch"
      >
        <div className="lg:col-span-2 h-full">
          <ShipmentsBarChart
            data={stats?.monthly ?? []}
            loading={statsLoading}
            title="Monthly Shipments"
            height={320}
          />
        </div>

        <div className="h-full">
          <StatusPieChart
            stats={stats}
            loading={statsLoading}
            title="Status Distribution"
            height={320}
          />
        </div>
      </div>

      {/* Create Parcel */}
      <div
        data-driver-id="create-parcel"
        className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Create New Parcel
        </h3>
        <CreateParcelForm />
      </div>

      {/* Info hint */}
      <div
        data-driver-id="parcel-search"
        className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Search and filter your parcels using the controls in the table below.
        </p>
      </div>

      {/* Parcel table */}
      <div
        data-driver-id="parcel-table"
        className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
          Your Parcels
        </h3>
        <ParcelTable senderId={senderId} initialLimit={10} />
      </div>

      <DashboardTour autostart={true} />
    </div>
  );
};

export default SenderDashboard;
