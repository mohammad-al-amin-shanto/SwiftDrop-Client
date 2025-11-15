// src/components/parcels/ParcelRow.tsx
import React from "react";
import type { Parcel, User } from "../../types";
import { format } from "date-fns";

type Props = {
  parcel: Parcel;
  onView: (p: Parcel) => void;
  onCancel: (id: string) => void;
  onConfirm?: (id: string) => void;
  showConfirm?: boolean;
};

/** runtime narrow check for a receiver-like object */
function isReceiverObject(x: unknown): x is Partial<User> {
  return (
    typeof x === "object" &&
    x !== null &&
    ("name" in (x as object) || "phone" in (x as object))
  );
}

export const ParcelRow: React.FC<Props> = ({
  parcel,
  onView,
  onCancel,
  onConfirm,
  showConfirm = false,
}) => {
  // prefer last log entry (if logs exist) else fallback to status
  const latestStatus =
    Array.isArray(parcel.logs) && parcel.logs.length > 0
      ? parcel.logs[parcel.logs.length - 1].status ?? parcel.status
      : parcel.status;

  const canCancel =
    parcel.status !== "dispatched" &&
    parcel.status !== "delivered" &&
    parcel.status !== "cancelled";

  const canConfirm =
    parcel.status !== "delivered" && parcel.status !== "cancelled";

  // handle receiver which may be string or object
  const receiverName =
    typeof parcel.receiver === "string"
      ? parcel.receiver
      : isReceiverObject(parcel.receiver)
      ? parcel.receiver.name ?? "-"
      : "-";

  const receiverPhone =
    typeof parcel.receiver === "string"
      ? "-"
      : isReceiverObject(parcel.receiver)
      ? parcel.receiver.phone ?? "-"
      : "-";

  const weightDisplay =
    typeof parcel.weight === "number" ? `${parcel.weight} kg` : "-";
  const costDisplay =
    typeof parcel.cost === "number" ? `৳ ${parcel.cost}` : "-";

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
      /* ignore */
    }
    return "-";
  })();

  return (
    <tr className="border-b">
      <td className="px-3 py-2 text-sm">{parcel.trackingId}</td>

      <td className="px-3 py-2 text-sm">
        <div className="font-medium">{receiverName}</div>
        <div className="text-xs text-gray-500">{receiverPhone}</div>
      </td>

      <td className="px-3 py-2 text-sm">{weightDisplay}</td>

      <td className="px-3 py-2 text-sm">{latestStatus}</td>

      <td className="px-3 py-2 text-sm">{costDisplay}</td>

      <td className="px-3 py-2 text-sm">{createdAtDisplay}</td>

      <td className="px-3 py-2 text-sm">
        <div className="flex gap-2">
          <button
            onClick={() => onView(parcel)}
            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-sm"
          >
            View
          </button>

          {canConfirm && (showConfirm || !!onConfirm) ? (
            <button
              onClick={() => onConfirm?.(parcel._id)}
              className="px-2 py-1 rounded bg-green-500 text-white text-sm hover:bg-green-600"
            >
              Confirm
            </button>
          ) : null}

          {canCancel ? (
            <button
              onClick={() => onCancel(parcel._id)}
              className="px-2 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
};

export default ParcelRow;
