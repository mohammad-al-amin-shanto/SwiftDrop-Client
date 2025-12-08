// src/components/charts/StatusPieChart.tsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Stats = {
  total?: number;
  delivered?: number;
  inTransit?: number;
  cancelled?: number;
  // Optional from backend; we'll still compute fallback if missing
  pending?: number;
};

type Props = {
  stats?: Stats | null;
  loading?: boolean;
  height?: number;
  title?: string;
};

const COLORS = ["#34D399", "#60A5FA", "#F59E0B", "#EF4444"];

const StatusPieChart: React.FC<Props> = ({
  stats = null,
  loading = false,
  height = 280,
  title = "Status Distribution",
}) => {
  const total = stats?.total ?? 0;
  const delivered = stats?.delivered ?? 0;
  const inTransit = stats?.inTransit ?? 0;
  const cancelled = stats?.cancelled ?? 0;

  // Prefer backend `pending` if it exists, otherwise derive it
  const pendingFromBackend =
    typeof stats?.pending === "number" ? stats.pending : undefined;

  const pending =
    pendingFromBackend !== undefined
      ? pendingFromBackend
      : Math.max(0, total - (delivered + inTransit + cancelled));

  const data = [
    { name: "Delivered", value: delivered },
    { name: "In Transit", value: inTransit },
    { name: "Pending", value: pending },
    { name: "Cancelled", value: cancelled },
  ];

  const hasData = data.some((d) => d.value > 0);

  // ⏳ Loading state with your card styles
  if (loading) {
    return (
      <div
        className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 md:p-5 flex flex-col gap-3"
        style={{ height }}
        role="status"
        aria-live="polite"
      >
        <div className="text-sm font-medium text-slate-700">{title}</div>
        <div className="flex flex-1 items-center justify-center">
          <span className="text-sm text-slate-500">Loading chart…</span>
        </div>
      </div>
    );
  }

  // 🚫 No data
  if (!hasData) {
    return (
      <div
        className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 md:p-5 flex flex-col gap-3"
        style={{ height }}
      >
        <div className="text-sm font-medium text-slate-700">{title}</div>
        <div className="flex flex-1 items-center justify-center">
          <span className="text-sm text-slate-500">
            No chart data available
          </span>
        </div>
      </div>
    );
  }

  // ✅ Normal render using ResponsiveContainer (no ResizeObserver)
  return (
    <div
      className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 md:p-5 flex flex-col gap-3"
      style={{ height }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-slate-700">{title}</div>
        {total > 0 && (
          <span className="text-xs text-slate-400">
            Total: {total.toLocaleString()}
          </span>
        )}
      </div>

      {/* Chart area fills remaining height */}
      <div className="flex-1 min-h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              innerRadius={40}
              outerRadius={80}
              label
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={32} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatusPieChart;
