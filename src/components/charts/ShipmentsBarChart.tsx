// src/components/charts/ShipmentsBarChart.tsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type MonthPoint = { month: string; count: number };

type Props = {
  data?: MonthPoint[] | null;
  loading?: boolean;
  height?: number;
  title?: string;
};

const ShipmentsBarChart: React.FC<Props> = ({
  data = [],
  loading = false,
  height = 280,
  title = "Shipments over time",
}) => {
  const hasData = Array.isArray(data) && data.length > 0;

  // 🔄 Loading state – keep your existing card look
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

  // ✅ Normal render with ResponsiveContainer
  return (
    <div
      className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 md:p-5 flex flex-col gap-3"
      style={{ height }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-slate-700">{title}</div>
        <span className="text-xs text-slate-400">Monthly</span>
      </div>

      {/* This area stretches to fill the remaining height */}
      <div className="flex-1 min-h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="Shipments" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ShipmentsBarChart;
