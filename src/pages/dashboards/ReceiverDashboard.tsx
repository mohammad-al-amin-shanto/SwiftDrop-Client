import React, { useMemo } from "react";
import { FaBoxOpen, FaTruck, FaCheckCircle, FaHistory } from "react-icons/fa";

import ParcelTable from "../../components/parcels/ParcelTable";
import {
  useParcelsStatsQuery,
  useListParcelsQuery,
} from "../../api/parcelsApi";
import { useAppSelector } from "../../app/hooks";
import StatusPieChart from "../../components/charts/StatusPieChart";

/* ================= TYPES ================= */

type ParcelStatus =
  | "pending"
  | "collected"
  | "dispatched"
  | "in_transit"
  | "delivered"
  | "cancelled";

type Parcel = {
  _id: string;
  trackingId: string;
  status: ParcelStatus;
  createdAt: string;
  updatedAt: string;
};

type ParcelsStatsShape = {
  total: number;
  delivered: number;
  inTransit: number;
  cancelled: number;
};

type PaginatedResponse<T> = {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

/* ================= COMPONENT ================= */

const ReceiverDashboard: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const receiverId = user?._id;

  /* ---------- Stats ---------- */
  const { data: stats, isLoading: statsLoading } = useParcelsStatsQuery();
  const statsTyped = stats as ParcelsStatsShape | undefined;

  const total = statsTyped?.total ?? 0;
  const delivered = statsTyped?.delivered ?? 0;
  const inTransit = statsTyped?.inTransit ?? 0;
  const awaitingConfirmation = delivered;

  /* ---------- Receiver Parcels ---------- */
  const { data: parcelsResponse } = useListParcelsQuery({
    receiverId,
    page: 1,
    limit: 50,
  });

  const parcels = useMemo(
    () =>
      (parcelsResponse as PaginatedResponse<Parcel> | undefined)?.items ?? [],
    [parcelsResponse]
  );

  /* ---------- Recent Delivery History ---------- */
  const recentDeliveries = useMemo(
    () =>
      parcels
        .filter((p) => p.status === "delivered")
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5),
    [parcels]
  );

  return (
    <div className="px-4 py-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* ================= HEADER ================= */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Receiver Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            View incoming parcels, confirm delivery, and review delivery
            history.
          </p>
        </section>

        {/* ================= STATS ================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FaBoxOpen />}
            label="Incoming Parcels"
            value={statsLoading ? 0 : total}
          />
          <StatCard
            icon={<FaTruck />}
            label="In Transit"
            value={statsLoading ? 0 : inTransit}
          />
          <StatCard
            icon={<FaCheckCircle />}
            label="Awaiting Confirmation"
            value={statsLoading ? 0 : awaitingConfirmation}
          />
          <StatCard
            icon={<FaHistory />}
            label="Delivered"
            value={statsLoading ? 0 : delivered}
          />
        </section>

        {/* ================= DELIVERY HISTORY ================= */}
        <section className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold mb-3">
            <FaHistory className="text-sky-600" /> Recent Deliveries
          </h2>

          {recentDeliveries.length === 0 ? (
            <p className="text-sm text-slate-500">
              No deliveries completed yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentDeliveries.map((p) => (
                <li
                  key={p._id}
                  className="flex justify-between items-center px-3 py-2 rounded-lg
                             hover:bg-slate-100 dark:hover:bg-slate-700/40 transition"
                >
                  <span className="text-sm">
                    <span className="font-semibold">{p.trackingId}</span>{" "}
                    delivered successfully
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ================= PARCEL LIST ================= */}
        <section className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">My Parcels</h2>
          <p className="text-xs text-slate-500 mb-3">
            View incoming parcels and confirm delivery once received.
          </p>

          {/* 
            IMPORTANT:
            ParcelTable already controls what actions are available
            based on role + status. Receiver does NOT edit status here.
          */}
          <ParcelTable initialLimit={10} />
        </section>

        {/* ================= STATUS DISTRIBUTION ================= */}
        <section className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm">
          <StatusPieChart
            stats={statsTyped}
            loading={statsLoading}
            title="My Parcel Status Distribution"
            height={320}
          />
        </section>
      </div>
    </div>
  );
};

export default ReceiverDashboard;

/* ================= UI ================= */

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-3">
    <div className="text-xl text-sky-600">{icon}</div>
    <div>
      <div className="text-xs text-slate-500 uppercase">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  </div>
);
