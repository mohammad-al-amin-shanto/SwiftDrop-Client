// src/components/parcels/ParcelRow.tsx
import React from "react";
import type { Parcel, User } from "../../types";
import { format } from "date-fns";

type Props = {
  parcel: Parcel;
  onView: (p: Parcel) => void;
  // NOTE: onConfirm now gets the entire parcel, not just the id
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

  const latestStatus =
    Array.isArray(logs) && logs.length > 0
      ? logs[logs.length - 1]?.status ?? parcel.status
      : parcel.status;

  const canCancel =
    parcel.status !== "dispatched" &&
    parcel.status !== "delivered" &&
    parcel.status !== "cancelled";

  const canConfirm =
    parcel.status !== "delivered" && parcel.status !== "cancelled";

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
          {/* VIEW BUTTON - solid + visible */}
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

          {canConfirm && (showConfirm || !!onConfirm) ? (
            <button
              onClick={() => onConfirm?.(parcel)}
              className="inline-flex items-center px-3 py-1 rounded text-sm font-medium
                bg-green-600 hover:bg-green-700
                text-white
                border border-transparent"
            >
              Confirm
            </button>
          ) : null}

          {canCancel ? (
            <button
              onClick={() => onCancel(parcel._id)}
              className="inline-flex items-center px-3 py-1 rounded text-sm font-medium
                bg-red-600 hover:bg-red-700
                text-white
                border border-transparent"
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
