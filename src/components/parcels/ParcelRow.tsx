import React from "react";
import type { Parcel, User } from "../../types";
import { format } from "date-fns";
import { useAppSelector } from "../../app/hooks";

type Props = {
  parcel: Parcel;
  onView: (p: Parcel) => void;
  onCancel: (id: string) => void;
  onConfirm: (parcel: Parcel) => void;

  canConfirm?: boolean;
  canCancel?: boolean;

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
  canConfirm,
  canCancel,
  showConfirm = false,
}) => {
  const role = useAppSelector((s) => s.auth.user?.role);

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

  const canCancelFinal =
    canCancel ??
    !["dispatched", "delivered", "cancelled", "in_transit"].includes(
      statusLower
    );

  const canConfirmFinal =
    canConfirm ?? !["delivered", "cancelled"].includes(statusLower);

  const confirmLabel = (() => {
    if (!canConfirmFinal) return "Confirm";

    switch (role) {
      case "sender":
        return "Advance";
      case "receiver":
        return "Confirm Received";
      case "admin":
        return "Update Status";
      default:
        return "Confirm";
    }
  })();

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
      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
      : statusLower === "cancelled"
      ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
      : statusLower.includes("transit") || statusLower === "dispatched"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
      : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100";

  const showConfirmButton = showConfirm || !!onConfirm;

  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 last:border-0">
      {/* Tracking */}
      <td className="px-2.5 py-2 text-sm text-slate-900 dark:text-slate-50 break-all">
        {parcel.trackingId}
      </td>

      {/* Receiver */}
      <td className="px-2.5 py-2 text-sm">
        <div className="font-medium text-slate-900 dark:text-slate-50">
          {receiverName}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {receiverPhone}
        </div>
      </td>

      {/* Weight – keep it compact & no wrap */}
      <td className="px-2 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-nowrap">
        {weightDisplay}
      </td>

      {/* Status – slimmer pill */}
      <td className="px-2 py-2 text-xs sm:text-sm whitespace-nowrap">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor}`}
        >
          {latestStatus}
        </span>
      </td>

      {/* Value */}
      <td className="px-2 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-nowrap">
        {costDisplay}
      </td>

      {/* Created */}
      <td className="px-2 py-2 text-xs sm:text-sm text-slate-800 dark:text-slate-100 whitespace-nowrap">
        {createdAtDisplay}
      </td>

      {/* Actions – single row, compact, no wrap */}
      <td className="px-2 py-2 text-xs sm:text-sm align-top">
        <div className="flex justify-end gap-1.5 whitespace-nowrap">
          {/* VIEW BUTTON - always enabled */}
          <button
            type="button"
            onClick={() => onView(parcel)}
            className="inline-flex items-center px-2.5 py-1.5 rounded text-[11px] font-semibold
      bg-sky-600 hover:bg-sky-700
      dark:bg-sky-500 dark:hover:bg-sky-600
      text-white"
          >
            View
          </button>

          {/* CONFIRM BUTTON - stays visible, disabled when not allowed */}
          {showConfirmButton && (
            <button
              type="button"
              onClick={() => {
                if (canConfirmFinal) onConfirm(parcel);
              }}
              disabled={!canConfirmFinal}
              aria-disabled={!canConfirmFinal}
              className={`inline-flex items-center px-2.5 py-1.5 rounded text-[11px] font-semibold border
        ${
          canConfirmFinal
            ? "bg-green-600 hover:bg-green-700 text-white border-transparent"
            : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500"
        }`}
            >
              {confirmLabel}
            </button>
          )}

          {/* CANCEL BUTTON - stays visible, disabled when not allowed */}
          <button
            type="button"
            onClick={() => {
              if (canCancelFinal) onCancel(parcel._id);
            }}
            disabled={!canCancelFinal}
            aria-disabled={!canCancelFinal}
            className={`inline-flex items-center px-2.5 py-1.5 rounded text-[11px] font-semibold border
      ${
        canCancelFinal
          ? "bg-red-600 hover:bg-red-700 text-white border-transparent"
          : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500"
      }`}
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ParcelRow;
