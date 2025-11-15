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
  // get current user to pass senderId to parcel list (so sender sees only their parcels)
  const user = useAppSelector((s) => s.auth.user);
  const senderId = user?._id;

  // small stats for cards/charts
  const { data: stats, isLoading: statsLoading } = useParcelsStatsQuery();

  return (
    <div className="space-y-6 p-4">
      {/* Hero (tour target) */}
      <div data-driver-id="hero" className="tour-hero">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Sender Dashboard</h1>
            <p className="text-sm text-gray-500">Overview of your shipments</p>
          </div>
          <div>{/* optional quick actions could go here */}</div>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-xs text-gray-500">Total Parcels</div>
          <div className="text-xl font-semibold">{stats?.total ?? "—"}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Delivered</div>
          <div className="text-xl font-semibold">{stats?.delivered ?? "—"}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">In Transit</div>
          <div className="text-xl font-semibold">{stats?.inTransit ?? "—"}</div>
        </div>
        <div className="card">
          <div className="text-xs text-gray-500">Cancelled</div>
          <div className="text-xl font-semibold">{stats?.cancelled ?? "—"}</div>
        </div>
      </div>

      {/* Charts (tour target) */}
      <div
        data-driver-id="charts"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <div className="col-span-2 bg-white dark:bg-slate-800 p-4 rounded shadow">
          <h4 className="mb-3 font-medium">Monthly Shipments</h4>
          <ShipmentsBarChart
            data={stats?.monthly ?? []}
            loading={statsLoading}
          />
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <h4 className="mb-3 font-medium">Status Distribution</h4>
          <StatusPieChart stats={stats} loading={statsLoading} />
        </div>
      </div>

      {/* Create Parcel (tour target) */}
      <div
        data-driver-id="create-parcel"
        className="bg-white dark:bg-slate-800 p-4 rounded shadow"
      >
        <CreateParcelForm />
      </div>

      {/* Search area (tour target) */}
      <div data-driver-id="parcel-search" className="tour-parcel-search">
        <div className="mb-2">
          <p className="text-sm text-gray-500">
            Search and filter your parcels using the controls inside the table.
          </p>
        </div>
      </div>

      {/* Parcel list (tour target) */}
      <div data-driver-id="parcel-table">
        <h3 className="text-lg font-semibold mb-2">Your Parcels</h3>
        <ParcelTable senderId={senderId} initialLimit={10} />
      </div>

      {/* mount Dashboard tour (autostart when component mounts) */}
      <DashboardTour autostart={true} />
    </div>
  );
};

export default SenderDashboard;
