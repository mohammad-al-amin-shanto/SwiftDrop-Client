import React from "react";
import type { Parcel, ParcelLog, User } from "../../types";
import { format } from "date-fns";

type Props = {
  parcel: Parcel;
};

type ParcelWithLogs = Parcel & {
  logs?: ParcelLog[];
  statusLogs?: ParcelLog[];
};

function isUser(x: unknown): x is Partial<User> {
  return typeof x === "object" && x !== null && "name" in (x as object);
}

// Optional: map status → color badge
function statusColor(statusRaw?: string): string {
  const s = (statusRaw ?? "").toLowerCase();

  if (s === "created" || s === "pending") return "bg-slate-100 text-slate-700";
  if (s === "collected") return "bg-amber-100 text-amber-800";
  if (s === "dispatched" || s === "in_transit" || s === "intransit")
    return "bg-blue-100 text-blue-800";
  if (s === "delivered") return "bg-emerald-100 text-emerald-800";
  if (s === "cancelled" || s === "canceled") return "bg-red-100 text-red-800";

  return "bg-slate-100 text-slate-700";
}

export const StatusTimeline: React.FC<Props> = ({ parcel }) => {
  const extended = parcel as ParcelWithLogs;

  // ✅ Prefer `logs` if exists, otherwise use `statusLogs`
  const rawLogs = (extended.logs ?? extended.statusLogs ?? []) as ParcelLog[];

  // Safety: ensure it's actually an array
  const logs = Array.isArray(rawLogs) ? rawLogs : [];

  if (!logs.length) {
    return (
      <div className="text-sm text-gray-500 dark:text-slate-400">
        No status updates yet.
      </div>
    );
  }

  // Sort oldest → newest, then reverse for newest first
  const sorted = [...logs].sort((a, b) => {
    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return ta - tb;
  });

  const reversed = sorted.reverse();

  return (
    <div className="relative pl-3">
      {/* Vertical line */}
      <div className="absolute left-1 top-1 bottom-1 w-px bg-slate-200 dark:bg-slate-700" />

      <ul className="space-y-3">
        {reversed.map((log, idx) => {
          const ts = log.timestamp
            ? (() => {
                try {
                  return format(new Date(log.timestamp), "dd MMM yyyy, HH:mm");
                } catch {
                  return String(log.timestamp);
                }
              })()
            : "-";

          const updatedByLabel =
            log.updatedBy && isUser(log.updatedBy)
              ? log.updatedBy.name ?? String(log.updatedBy)
              : typeof log.updatedBy === "string"
              ? log.updatedBy
              : null;

          const isLatest = idx === 0;

          return (
            <li
              key={log._id ?? `${log.status}-${log.timestamp}-${idx}`}
              className="flex items-start gap-3"
            >
              {/* Dot */}
              <div className="relative mt-1.5">
                <div
                  className={`w-3 h-3 rounded-full border-2 ${
                    isLatest
                      ? "bg-sky-500 border-sky-500"
                      : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600"
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(
                      log.status
                    )}`}
                  >
                    {log.status}
                  </span>
                  {isLatest && (
                    <span className="text-[10px] uppercase tracking-wide text-sky-600 dark:text-sky-400 font-semibold">
                      Latest
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {ts}
                </div>

                {log.note && (
                  <div className="text-sm mt-1 text-slate-700 dark:text-slate-200">
                    {log.note}
                  </div>
                )}

                {updatedByLabel && (
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                    Updated by: {updatedByLabel}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StatusTimeline;
