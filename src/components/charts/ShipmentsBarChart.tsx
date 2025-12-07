import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type MonthPoint = { month: string; count: number };
type Props = { data?: MonthPoint[] | null; loading?: boolean };

/**
 * ShipmentsBarChart
 * - Root wrapper has explicit height + w-full + min-w-0
 *   so ResponsiveContainer always gets a valid size.
 */
const ShipmentsBarChart: React.FC<Props> = ({ data = [], loading = false }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  if (loading) {
    return (
      <div
        className="w-full min-w-0"
        style={{
          height: 280,
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
          height: 280,
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
        height: 280,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="count" name="Shipments" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ShipmentsBarChart;
