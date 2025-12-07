// src/components/charts/StatusPieChart.tsx
import React, { useRef, useState, useLayoutEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Stats = {
  total?: number;
  delivered?: number;
  inTransit?: number;
  cancelled?: number;
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
  const pending = Math.max(0, total - (delivered + inTransit + cancelled));

  const data = [
    { name: "Delivered", value: delivered },
    { name: "In Transit", value: inTransit },
    { name: "Pending", value: pending },
    { name: "Cancelled", value: cancelled },
  ];

  const hasData = data.some((d) => d.value > 0);

  // measure container like the bar chart
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
        {total > 0 && (
          <span className="text-xs text-slate-400">
            Total: {total.toLocaleString()}
          </span>
        )}
      </div>

      <div ref={containerRef} className="flex-1 min-h-0">
        {!ready ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-slate-400">
              Preparing chart layout…
            </span>
          </div>
        ) : (
          <PieChart width={size.width} height={size.height}>
            <Pie
              dataKey="value"
              data={data}
              innerRadius={Math.min(size.width, size.height) * 0.25}
              outerRadius={Math.min(size.width, size.height) * 0.4}
              label
            >
              {data.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={32} />
          </PieChart>
        )}
      </div>
    </div>
  );
};

export default StatusPieChart;
