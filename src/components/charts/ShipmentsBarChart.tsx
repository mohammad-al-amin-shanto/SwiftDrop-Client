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
 * - Ensure the wrapper has an explicit height so ResponsiveContainer can measure.
 * - ResponsiveContainer uses width="100%" height="100%" so it fills the wrapper.
 */
const ShipmentsBarChart: React.FC<Props> = ({ data = [], loading = false }) => {
  const hasData = Array.isArray(data) && data.length > 0;

  if (loading) {
    return (
      <div
        className="w-full"
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
        className="w-full"
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
    // explicit height so ResponsiveContainer can calculate sizes
    <div style={{ width: "100%", height: 280 }}>
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
