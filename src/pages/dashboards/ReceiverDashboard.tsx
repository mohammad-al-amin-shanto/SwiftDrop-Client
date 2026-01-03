import React, { useMemo } from "react";
import { FaBoxOpen, FaTruck, FaCheckCircle, FaClock } from "react-icons/fa";

import ParcelTable from "../../components/parcels/ParcelTable";
import { useListParcelsQuery } from "../../api/parcelsApi";
import { useAppSelector } from "../../app/hooks";
import { useGetReceiverDashboardQuery } from "../../api/dashboardApi";
import { DashboardTour } from "./../../components/ui/DashboardTour";

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
  updatedAt: string;
};

type ReceiverDashboardStats = {
  totalExpected: number;
  inTransit: number;
  delivered: number;
  awaitingConfirmation: number;
  arrivingToday: number;
};

type PaginatedResponse<T> = {
  items: T[];
};

/* ================= COMPONENT ================= */

const ReceiverDashboard: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);

  /* ---------- Receiver Stats (SERVER TRUSTED) ---------- */
  const { data: statsResponse, isLoading: statsLoading } =
    useGetReceiverDashboardQuery();

  const stats = statsResponse?.data as ReceiverDashboardStats | undefined;

  /* ---------- Receiver Parcels ---------- */
  const { data: parcelsResponse } = useListParcelsQuery({
    page: 1,
    limit: 50,
  });

  const parcels = useMemo(
    () =>
      (parcelsResponse as PaginatedResponse<Parcel> | undefined)?.items ?? [],
    [parcelsResponse]
  );

  /* ---------- Recent Delivered Parcels ---------- */
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
        <section
          data-driver-id="hero"
          className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm"
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome{user?.name ? `, ${user.name}` : ""} 👋
          </h1>
          <p className="text-sm text-slate-500">
            Track your incoming parcels and take action when required.
          </p>
        </section>

        {/* ================= STATS ================= */}
        <section
          data-driver-id="stats"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <StatCard
            icon={<FaBoxOpen />}
            label="Expected Parcels"
            value={statsLoading ? 0 : stats?.totalExpected ?? 0}
          />

          <StatCard
            icon={<FaTruck />}
            label="In Transit"
            value={statsLoading ? 0 : stats?.inTransit ?? 0}
          />

          <StatCard
            icon={<FaCheckCircle />}
            label="Delivered"
            value={statsLoading ? 0 : stats?.delivered ?? 0}
          />

          <StatCard
            icon={<FaClock />}
            label="Arriving Today"
            value={statsLoading ? 0 : stats?.arrivingToday ?? 0}
          />

          <StatCard
            icon={<FaCheckCircle />}
            label="Action Required"
            value={statsLoading ? 0 : stats?.awaitingConfirmation ?? 0}
            highlight={(stats?.awaitingConfirmation ?? 0) > 0}
          />
        </section>

        {/* ================= RECENT ACTIVITY ================= */}
        <section
          data-driver-id="parcel-table"
          className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm"
        >
          <h2 className="font-semibold mb-3">Recent Deliveries</h2>

          {recentDeliveries.length === 0 ? (
            <p className="text-sm text-slate-500">
              No completed deliveries yet.
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
                    delivered
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
            View all incoming parcels and confirm delivery when received.
          </p>

          <ParcelTable initialLimit={10} />
        </section>
        {/* ✅ RECEIVER DASHBOARD TOUR */}
        <DashboardTour role="receiver" autostart />
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
  highlight?: boolean;
};

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  highlight = false,
}) => (
  <div
    className={`p-4 rounded-xl shadow-sm flex items-center gap-3
      ${
        highlight
          ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-400"
          : "bg-white dark:bg-slate-800"
      }`}
  >
    <div className={`text-xl ${highlight ? "text-amber-500" : "text-sky-600"}`}>
      {icon}
    </div>
    <div>
      <div className="text-xs text-slate-500 uppercase">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  </div>
);
