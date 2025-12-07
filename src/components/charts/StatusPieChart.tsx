import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Stats = {
  total?: number;
  delivered?: number;
  inTransit?: number;
  cancelled?: number;
};

type Props = { stats?: Stats | null; loading?: boolean };

const COLORS = ["#34D399", "#60A5FA", "#F59E0B", "#EF4444"];

/**
 * StatusPieChart
 * - Root wrapper has explicit height + w-full + min-w-0
 *   so ResponsiveContainer always gets a valid size.
 */
const StatusPieChart: React.FC<Props> = ({ stats = null, loading = false }) => {
  const total = stats?.total ?? 0;
  const delivered = stats?.delivered ?? 0;
  const inTransit = stats?.inTransit ?? 0;
  const cancelled = stats?.cancelled ?? 0;
  const pending = Math.max(0, total - (delivered + inTransit + cancelled));

  const data = [
    { name: "Delivered", value: delivered },
    { name: "In Transit", value: inTransit },
    { name: "Pending", value: pending },
    { name: "Cancelled", value: cancelled },
  ];

  const hasData = data.some((d) => d.value > 0);

  if (loading) {
    return (
      <div
        className="w-full min-w-0"
        style={{
          height: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        role="status"
        aria-live="polite"
      >
        <span className="text-sm text-slate-500">Loading chart…</span>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div
        className="w-full min-w-0"
        style={{
          height: 240,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span className="text-sm text-slate-500">No chart data available</span>
      </div>
    );
  }

  return (
    <div
      className="w-full min-w-0"
      style={{
        height: 240,
      }}
    >
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
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusPieChart;
