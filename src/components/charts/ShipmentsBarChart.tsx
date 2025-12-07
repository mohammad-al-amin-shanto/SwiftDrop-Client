// src/components/charts/ShipmentsBarChart.tsx
import React, { useRef, useState, useLayoutEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

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

  // Measure the inner chart container so we can give BarChart real width/height
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    if (typeof ResizeObserver === "undefined") return;

    const el = containerRef.current;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        setSize({ width, height });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  const ready = size.width > 0 && size.height > 0;

  return (
    <div
      className="w-full min-w-0 rounded-2xl border border-slate-100 bg-white p-4 md:p-5 flex flex-col gap-3"
      style={{ height }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium text-slate-700">{title}</div>
        <span className="text-xs text-slate-400">Monthly</span>
      </div>

      <div ref={containerRef} className="flex-1 min-h-0">
        {!ready ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-slate-400">
              Preparing chart layout…
            </span>
          </div>
        ) : (
          <BarChart width={size.width} height={size.height} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="Shipments" />
          </BarChart>
        )}
      </div>
    </div>
  );
};

export default ShipmentsBarChart;
