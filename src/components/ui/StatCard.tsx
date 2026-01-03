import React from "react";

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value?: number;
  highlight?: boolean;
};

const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  highlight = false,
}) => {
  const isLoading = value === undefined;

  return (
    <div
      className={`p-4 rounded-xl shadow-sm flex items-center gap-3
        ${
          highlight
            ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-400"
            : "bg-white dark:bg-slate-800"
        }`}
    >
      <div
        className={`text-xl shrink-0 ${
          highlight ? "text-amber-500" : "text-sky-600"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div className="text-xs text-slate-500 uppercase truncate">{label}</div>

        <div className="text-2xl font-semibold transition-opacity duration-300">
          {isLoading ? (
            <span className="inline-block w-10 h-6 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          ) : (
            value
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
