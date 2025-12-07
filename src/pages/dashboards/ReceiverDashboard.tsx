// src/pages/dashboards/ReceiverDashboard.tsx
import React from "react";
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

  const pending = Math.max(0, total - (delivered + inTransit));

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-xl">
          <div className="text-xs text-gray-500">Incoming</div>
          <div className="text-xl font-semibold">
            {total ? total.toString() : "—"}
          </div>
        </div>
        <div className="card shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-xl">
          <div className="text-xs text-gray-500">Delivered</div>
          <div className="text-xl font-semibold">
            {delivered ? delivered.toString() : "—"}
          </div>
        </div>
        <div className="card shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-xl">
          <div className="text-xs text-gray-500">In Transit</div>
          <div className="text-xl font-semibold">
            {inTransit ? inTransit.toString() : "—"}
          </div>
        </div>
        <div className="card shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-xl">
          <div className="text-xs text-gray-500">Pending</div>
          <div className="text-xl font-semibold">
            {pending ? pending.toString() : "—"}
          </div>
        </div>
      </div>

      {/* Table + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h4 className="mb-3 font-medium">Incoming Parcels</h4>
          <ParcelTable senderId={undefined} initialLimit={10} />
        </div>

        <div>
          <StatusPieChart
            stats={stats as ParcelsStatsShape | undefined}
            loading={statsLoading}
            title="Status Distribution"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <h4 className="mb-3 font-medium">Confirm Delivery</h4>
        <p className="text-sm text-gray-500">
          Use the parcel table action &quot;View&quot; then confirm delivery
          from the details page.
        </p>
      </div>
    </div>
  );
};

export default ReceiverDashboard;
