// src/pages/dashboards/AdminDashboard.tsx
import React from "react";
import UsersTable from "../../components/admin/UsersTable";
import ParcelTable from "../../components/parcels/ParcelTable";
import { useParcelsStatsQuery } from "../../api/parcelsApi";
import ShipmentsBarChart from "../../components/charts/ShipmentsBarChart";
import StatusPieChart from "../../components/charts/StatusPieChart";

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading } = useParcelsStatsQuery();

  return (
    <div className="space-y-6 p-4">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white dark:bg-slate-800 p-4 rounded shadow">
          <h4 className="mb-3 font-medium">Parcels (Manage)</h4>
          <ParcelTable initialLimit={10} />
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <h4 className="mb-3 font-medium">Users (Manage)</h4>
          <UsersTable />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <h4 className="mb-3 font-medium">Monthly Shipments</h4>
          <ShipmentsBarChart data={stats?.monthly ?? []} loading={isLoading} />
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <h4 className="mb-3 font-medium">Status Distribution</h4>
          <StatusPieChart stats={stats} loading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
