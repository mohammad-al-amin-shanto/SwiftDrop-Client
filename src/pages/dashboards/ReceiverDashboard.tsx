// src/pages/dashboards/ReceiverDashboard.tsx
import React from "react";
import ParcelTable from "../../components/parcels/ParcelTable";
import { useParcelsStatsQuery } from "../../api/parcelsApi";
// import the chart module safely (works whether it exports default or a named export)
import * as StatusPieChartModule from "../../components/charts/StatusPieChart";

type ParcelsStatsShape = {
  total: number;
  delivered: number;
  inTransit: number;
  cancelled: number;
  monthly: { month: string; count: number }[];
};

type ParcelsStats = ParcelsStatsShape | undefined;

type StatusPieChartType = React.FC<{ stats?: ParcelsStats; loading: boolean }>;

const StatusPieChart: StatusPieChartType =
  (
    StatusPieChartModule as unknown as {
      default?: StatusPieChartType;
      StatusPieChart?: StatusPieChartType;
    }
  ).default ??
  (
    StatusPieChartModule as unknown as {
      default?: StatusPieChartType;
      StatusPieChart?: StatusPieChartType;
    }
  ).StatusPieChart ??
  (({ loading }) => (
    <div className="text-sm text-gray-500">
      {loading ? "Loading..." : "No chart available"}
    </div>
  ));

const ReceiverDashboard: React.FC = () => {
  // call endpoint (your parcelsApi appears to expose a stats endpoint without args)
  const { data: stats, isLoading: statsLoading } = useParcelsStatsQuery();

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-xs text-gray-500">Incoming</div>
          <div className="text-xl font-semibold">—</div>
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
          <div className="text-xs text-gray-500">Pending</div>
          <div className="text-xl font-semibold">{stats?.total ?? "—"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white dark:bg-slate-800 p-4 rounded shadow">
          <h4 className="mb-3 font-medium">Incoming Parcels</h4>
          <ParcelTable senderId={undefined} initialLimit={10} />
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <h4 className="mb-3 font-medium">Status Distribution</h4>
          <StatusPieChart stats={stats} loading={statsLoading} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
        <h4 className="mb-3 font-medium">Confirm Delivery</h4>
        <p className="text-sm text-gray-500">
          Use the parcel table action 'View' then confirm delivery from details.
          (You can build a direct confirm flow if desired.)
        </p>
      </div>
    </div>
  );
};

export default ReceiverDashboard;
