import { useRef, useState, useLayoutEffect } from "react";
import type { ReactNode, FC } from "react";

type AutoSizeChartContainerProps = {
  height: number;
  className?: string;
  children: (size: { width: number; height: number }) => ReactNode;
  title?: string;
  loading?: boolean;
  showCardShell?: boolean;
};

const AutoSizeChartContainer: FC<AutoSizeChartContainerProps> = ({
  height,
  className = "",
  children,
  title,
  loading = false,
  showCardShell = true,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number>(0);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const nextWidth = entry.contentRect.width;
      if (nextWidth > 0) {
        setWidth(nextWidth);
      }
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const inner = (() => {
    if (loading && !width) {
      return (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-sm text-slate-500">Loading chart…</span>
        </div>
      );
    }

    if (!width) {
      // Avoid rendering Recharts until we have a real width
      return (
        <div className="flex flex-1 items-center justify-center">
          <span className="text-xs text-slate-400">
            Preparing chart layout…
          </span>
        </div>
      );
    }

    return children({ width, height: height - (title ? 40 : 16) });
  })();

  if (!showCardShell) {
    return (
      <div
        ref={ref}
        className={`w-full min-w-0 ${className}`}
        style={{ height }}
      >
        {inner}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`w-full min-w-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 md:p-5 flex flex-col gap-3 ${className}`}
      style={{ height }}
    >
      {title && (
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {title}
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0">{inner}</div>
    </div>
  );
};

export default AutoSizeChartContainer;
