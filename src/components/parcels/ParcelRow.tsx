// src/components/parcels/ParcelRow.tsx
import React from "react";
import type { Parcel, User } from "../../types";
import { format } from "date-fns";

type Props = {
  parcel: Parcel;
  onView: (p: Parcel) => void;
  onCancel: (id: string) => void;
  onConfirm?: (p: Parcel) => void;
  showConfirm?: boolean;
};

type PersonLike = {
  name?: string;
  phone?: string;
  [k: string]: unknown;
};

/** Parcel shape extended with possible extra backend fields */
type ParcelWithExtras = Parcel & {
  logs?: { status?: string }[];
  statusLogs?: { status?: string }[];
  cost?: number;
  price?: number;
  receiver?: User | PersonLike | string;
  receiverId?: User | PersonLike | string;
};

/** runtime narrow check for a receiver-like object */
function isReceiverObject(x: unknown): x is Partial<User> & PersonLike {
  return typeof x === "object" && x !== null && ("name" in x || "phone" in x);
}

export const ParcelRow: React.FC<Props> = ({
  parcel,
  onView,
  onCancel,
  onConfirm,
  showConfirm = false,
}) => {
  const extended = parcel as ParcelWithExtras;

  // logs may be `logs` (old) or `statusLogs` (new)
  const logs: { status?: string }[] =
    extended.logs ?? extended.statusLogs ?? [];

  // latest status: prefer the last log entry, fall back to parcel.status
  const latestStatusRaw =
    Array.isArray(logs) && logs.length > 0
      ? logs[logs.length - 1]?.status ?? parcel.status
      : parcel.status;

  const latestStatus = latestStatusRaw ?? "-";
  const statusLower = (latestStatusRaw ?? "").toLowerCase();

  const canCancel = ![
    "dispatched",
    "delivered",
    "cancelled",
    "in_transit",
    "intransit",
  ].includes(statusLower);

  const canConfirm = !["delivered", "cancelled"].includes(statusLower);

  // receiver may be at `receiver` or `receiverId`
  const rawReceiver = extended.receiver ?? extended.receiverId;

  const receiverName =
    typeof rawReceiver === "string"
      ? rawReceiver
      : isReceiverObject(rawReceiver)
      ? rawReceiver.name ?? "-"
      : "-";

  const receiverPhone =
    typeof rawReceiver === "string"
      ? "-"
      : isReceiverObject(rawReceiver)
      ? rawReceiver.phone ?? "-"
      : "-";

  // weight & value (cost or price)
  const weightDisplay =
    typeof parcel.weight === "number" ? `${parcel.weight} kg` : "-";

  const rawCost = extended.cost ?? extended.price;
  const costDisplay = typeof rawCost === "number" ? `৳ ${rawCost}` : "-";

  const createdAtDisplay = (() => {
    const raw = parcel.createdAt;
    if (!raw) return "-";
    try {
      if (
        typeof raw === "string" ||
        typeof raw === "number" ||
        (raw as unknown) instanceof Date
      ) {
        return format(new Date(raw as string | number | Date), "dd MMM yyyy");
      }
    } catch {
      // ignore invalid dates
    }
    return "-";
  })();

  const statusColor =
    statusLower === "delivered"
      ? "bg-green-100 text-green-700"
      : statusLower === "cancelled"
      ? "bg-red-100 text-red-700"
      : statusLower.includes("transit") || statusLower === "dispatched"
      ? "bg-blue-100 text-blue-700"
      : "bg-slate-100 text-slate-700";

  const showConfirmButton = showConfirm || !!onConfirm;

  return (
    <tr className="border-b">
      <td className="px-3 py-2 text-sm">{parcel.trackingId}</td>

      <td className="px-3 py-2 text-sm">
        <div className="font-medium">{receiverName}</div>
        <div className="text-xs text-gray-500">{receiverPhone}</div>
      </td>

      <td className="px-3 py-2 text-sm">{weightDisplay}</td>

      {/* Status */}
      <td className="px-3 py-2 text-sm">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
        >
          {latestStatus}
        </span>
      </td>

      <td className="px-3 py-2 text-sm">{costDisplay}</td>

      <td className="px-3 py-2 text-sm">{createdAtDisplay}</td>

      <td className="px-3 py-2 text-sm">
        <div className="flex gap-2">
          {/* VIEW BUTTON - always enabled */}
          <button
            onClick={() => onView(parcel)}
            className="inline-flex items-center px-3 py-1 rounded text-sm font-medium
              bg-sky-600 hover:bg-sky-700
              dark:bg-sky-500 dark:hover:bg-sky-600
              text-white dark:text-white
              border border-transparent"
          >
            View
          </button>

          {/* CONFIRM BUTTON - stays visible, disabled when not allowed */}
          {showConfirmButton && (
            <button
              onClick={() => {
                if (canConfirm) onConfirm?.(parcel);
              }}
              disabled={!canConfirm}
              aria-disabled={!canConfirm}
              className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium border
                ${
                  canConfirm
                    ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
                    : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
                }
              `}
            >
              Confirm
            </button>
          )}

          {/* CANCEL BUTTON - stays visible, disabled when not allowed */}
          <button
            onClick={() => {
              if (canCancel) onCancel(parcel._id);
            }}
            disabled={!canCancel}
            aria-disabled={!canCancel}
            className={`inline-flex items-center px-3 py-1 rounded text-sm font-medium border
              ${
                canCancel
                  ? "bg-red-600 hover:bg-red-700 text-white border-transparent"
                  : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
              }
            `}
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ParcelRow;
