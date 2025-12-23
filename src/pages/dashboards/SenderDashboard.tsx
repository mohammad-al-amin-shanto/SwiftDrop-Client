import React, { useRef } from "react";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaTruck,
  FaTimesCircle,
  FaClipboardList,
  FaEye,
  FaBan,
  FaExclamationTriangle,
  FaHistory,
} from "react-icons/fa";

import CreateParcelForm from "../../components/parcels/CreateParcelForm";
import ParcelTable from "../../components/parcels/ParcelTable";
import { useAppSelector } from "../../app/hooks";
import {
  useParcelsStatsQuery,
  useListParcelsQuery,
} from "../../api/parcelsApi";
import ShipmentsBarChart from "../../components/charts/ShipmentsBarChart";
import StatusPieChart from "../../components/charts/StatusPieChart";
import DashboardTour from "../../components/ui/DashboardTour";

/* ================= TYPES (MATCH BACKEND EXACTLY) ================= */

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
  isBlocked: boolean;
};

type ParcelsStatsShape = {
  total: number;
  delivered: number;
  inTransit: number;
  cancelled: number;
  monthly: { month: string; count: number }[];
};

type PaginatedListResponse<T> = {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

/* ================= HELPERS ================= */

const hoursBetween = (from: string) =>
  (Date.now() - new Date(from).getTime()) / 36e5;

const activityText = (p: Parcel): string => {
  switch (p.status) {
    case "pending":
      return "📦 Parcel created";
    case "collected":
    case "dispatched":
    case "in_transit":
      return "🚚 Parcel in transit";
    case "delivered":
      return "✅ Parcel delivered";
    case "cancelled":
      return "❌ Parcel cancelled";
  }
};

/* ================= COMPONENT ================= */

const SenderDashboard: React.FC = () => {
  const user = useAppSelector((s) => s.auth.user);
  const senderId = user?._id;

  const chartsRef = useRef<HTMLElement | null>(null);
  const createRef = useRef<HTMLElement | null>(null);
  const tableRef = useRef<HTMLElement | null>(null);

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* ---- Stats ---- */
  const { data: stats, isLoading, isFetching } = useParcelsStatsQuery();
  const statsTyped = stats as ParcelsStatsShape | undefined;
  const loading = isLoading || isFetching;

  /* ---- Parcels (CORRECTLY TYPED) ---- */
  const { data: parcelsResponse } = useListParcelsQuery({
    senderId,
    page: 1,
    limit: 50,
  }) as { data?: PaginatedListResponse<Parcel> };

  const parcels: Parcel[] = parcelsResponse?.items ?? [];

  /* ---- Recent Activity ---- */
  const recentActivity = [...parcels]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  /* ---- Attention Required ---- */
  const attentionRequired = parcels.filter((p) => {
    if (p.isBlocked) return true;
    if (p.status === "cancelled") return true;
    if (p.status === "pending" && hoursBetween(p.createdAt) > 48) return true;
    return false;
  });

  return (
    <div className="px-4 py-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm">
          <h1 className="text-3xl font-bold">Sender Dashboard</h1>
          <p className="text-sm text-slate-500">
            Create parcels, track deliveries, and manage shipment issues.
          </p>
        </section>

        {/* QUICK ACTIONS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            icon={<FaClipboardList />}
            label="Create Parcel"
            onClick={() => scrollTo(createRef)}
          />
          <ActionCard
            icon={<FaEye />}
            label="View Status Logs"
            onClick={() => scrollTo(tableRef)}
          />
          <ActionCard
            icon={<FaBan />}
            label="Cancel Parcel"
            onClick={() => scrollTo(tableRef)}
          />
          <ActionCard
            icon={<FaTruck />}
            label="Track Delivery"
            onClick={() => scrollTo(chartsRef)}
          />
        </section>

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<FaBoxOpen />}
            label="Total Parcels"
            value={statsTyped?.total ?? 0}
          />
          <StatCard
            icon={<FaCheckCircle />}
            label="Delivered"
            value={statsTyped?.delivered ?? 0}
          />
          <StatCard
            icon={<FaTruck />}
            label="In Transit"
            value={statsTyped?.inTransit ?? 0}
          />
          <StatCard
            icon={<FaTimesCircle />}
            label="Cancelled"
            value={statsTyped?.cancelled ?? 0}
          />
        </section>

        {/* ================= ATTENTION REQUIRED ================= */}
        <section className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold mb-3 text-amber-700 dark:text-amber-400">
            <FaExclamationTriangle />
            Attention Required
          </h2>

          {attentionRequired.length === 0 ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              No parcels need attention 🎉
            </p>
          ) : (
            <ul className="space-y-2">
              {attentionRequired.slice(0, 3).map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between gap-4
                     rounded-lg px-3 py-2
                     bg-white/70 dark:bg-slate-800/60
                     hover:bg-white dark:hover:bg-slate-700/50
                     transition"
                >
                  {/* LEFT: Parcel + Reason */}
                  <div className="flex flex-col">
                    <span className="text-sm">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {p.trackingId}
                      </span>{" "}
                      <span className="text-slate-700 dark:text-slate-300">
                        {p.status === "cancelled"
                          ? "was cancelled"
                          : p.isBlocked
                          ? "is blocked"
                          : p.status === "pending"
                          ? "has been pending too long"
                          : "needs review"}
                      </span>
                    </span>

                    <span className="text-xs text-amber-600 dark:text-amber-400 capitalize">
                      Status: {p.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* RIGHT: Age */}
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ================= RECENT ACTIVITY ================= */}
        <section className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm">
          <h2 className="flex items-center gap-2 font-semibold mb-3">
            <FaHistory className="text-sky-600" />
            Recent Activity
          </h2>

          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500">
              No recent parcel activity yet
            </p>
          ) : (
            <ul className="space-y-2">
              {recentActivity.map((p) => (
                <li
                  key={p._id}
                  className="flex items-center justify-between gap-4
                     rounded-lg px-3 py-2
                     hover:bg-slate-50 dark:hover:bg-slate-700/40
                     transition"
                >
                  {/* LEFT: Parcel + Activity */}
                  <div className="flex flex-col">
                    <span className="text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {p.trackingId}
                      </span>{" "}
                      <span className="text-slate-600 dark:text-slate-300">
                        {activityText(p)
                          .replace("📦", "")
                          .replace("🚚", "")
                          .replace("✅", "")
                          .replace("❌", "")
                          .trim()}
                      </span>
                    </span>

                    {/* status badge */}
                    <span className="text-xs text-slate-400 capitalize">
                      Status: {p.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* RIGHT: Date */}
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ANALYTICS */}
        <section
          ref={chartsRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
            <ShipmentsBarChart
              data={statsTyped?.monthly ?? []}
              loading={loading}
              height={300}
            />
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
            <StatusPieChart
              stats={statsTyped}
              loading={loading}
              height={300}
              title="Status Distribution"
            />
          </div>
        </section>

        {/* CREATE */}
        <section
          ref={createRef}
          className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm"
        >
          <CreateParcelForm />
        </section>

        {/* TABLE */}
        <section
          ref={tableRef}
          className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm"
        >
          <ParcelTable senderId={senderId} initialLimit={10} />
        </section>

        <DashboardTour autostart />
      </div>
    </div>
  );
};

export default SenderDashboard;

/* ================= UI ================= */

type ActionCardProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

const ActionCard: React.FC<ActionCardProps> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-3 hover:shadow-md transition"
  >
    <div className="text-xl text-sky-600">{icon}</div>
    <div className="text-sm font-medium">{label}</div>
  </button>
);

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
