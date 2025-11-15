// src/components/parcels/ParcelDetails.tsx
import React from "react";
import type { Parcel, User } from "../../types";
import { format } from "date-fns";
import {
  useUpdateParcelStatusMutation,
  useCancelParcelMutation,
} from "../../api/parcelsApi";
import { toast } from "react-toastify";

/** safe error extractor (no `any`) */
function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, unknown>;
    const data = obj["data"];
    if (typeof data === "object" && data !== null) {
      const msg = (data as Record<string, unknown>)["message"];
      if (typeof msg === "string") return msg;
    }
    const message = obj["message"];
    if (typeof message === "string") return message;
  }
  return "An error occurred";
}

/** helpers to read person-like fields that may be `string | User | undefined` */
function personName(p: User | string | undefined) {
  if (!p) return "-";
  return typeof p === "string" ? p : p.name ?? "-";
}
function personPhone(p: User | string | undefined) {
  if (!p) return "-";
  return typeof p === "string" ? "-" : p.phone ?? "-";
}
function personAddress(p: User | string | undefined) {
  if (!p) return "-";
  if (typeof p === "string") return "-";
  // address might be stored under different key; try `address` first
  const obj = p as unknown as Record<string, unknown>;
  const addr = obj["address"];
  return typeof addr === "string" ? addr : "-";
}

/** safely read arbitrary optional fields from parcel */
function parcelField<T = unknown>(parcel: Parcel, key: string): T | undefined {
  const p = parcel as unknown;
  if (typeof p === "object" && p !== null) {
    return (p as Record<string, unknown>)[key] as T | undefined;
  }
  return undefined;
}

type Props = {
  parcel: Parcel;
  showActions?: boolean;
};

const ParcelDetails: React.FC<Props> = ({ parcel, showActions = true }) => {
  const [updateStatus] = useUpdateParcelStatusMutation();
  const [cancelParcel] = useCancelParcelMutation();

  const confirmDelivery = async () => {
    if (!confirm("Mark this parcel as delivered?")) return;
    try {
      await updateStatus({
        id: parcel._id,
        status: "delivered",
        note: "Marked delivered via UI",
      }).unwrap();
      toast.success("Parcel marked as delivered");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this parcel?")) return;
    try {
      await cancelParcel({ id: parcel._id }).unwrap();
      toast.success("Parcel cancelled");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  // createdAt: guard before calling new Date(...)
  const createdAtDisplay = (() => {
    const raw = parcel.createdAt;
    if (!raw) return "-";
    try {
      // cast to unknown before instanceof Date to satisfy TS
      if (
        typeof raw === "string" ||
        typeof raw === "number" ||
        (raw as unknown) instanceof Date
      ) {
        return format(
          new Date(raw as string | number | Date),
          "dd MMM yyyy HH:mm"
        );
      }
      return "-";
    } catch {
      return "-";
    }
  })();

  // prefer logs last entry, fallback to status
  const latestStatus =
    Array.isArray(parcel.logs) && parcel.logs.length > 0
      ? (parcel.logs[parcel.logs.length - 1] as { status?: string }).status ??
        parcel.status
      : parcel.status;

  // sender/receiver may be either object or string depending on your API
  const sender = parcel.sender as User | string | undefined;
  const receiver = parcel.receiver as User | string | undefined;

  // weight/cost fields in your types are `weight` and `cost`
  const weightDisplay =
    typeof parcel.weight === "number" ? `${parcel.weight} kg` : "-";
  const costDisplay =
    typeof parcel.cost === "number" ? `৳ ${parcel.cost}` : "-";

  // optional fields coming from backend but not typed on Parcel
  const note = parcelField<string>(parcel, "note");
  const currentHandler = parcelField<Record<string, unknown>>(
    parcel,
    "currentHandler"
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <div className="text-xs text-gray-500">Tracking ID</div>
          <div className="font-medium">{parcel.trackingId}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Status</div>
          <div className="font-medium">{latestStatus}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Created</div>
          <div className="font-medium">{createdAtDisplay}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500">Sender</div>
          <div className="font-medium">
            {personName(sender)} — {personPhone(sender)}
          </div>
          <div className="text-sm mt-1">{personAddress(sender)}</div>
        </div>

        <div>
          <div className="text-xs text-gray-500">Receiver</div>
          <div className="font-medium">
            {personName(receiver)} — {personPhone(receiver)}
          </div>
          <div className="text-sm mt-1">{personAddress(receiver)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <div className="text-xs text-gray-500">Weight</div>
          <div className="font-medium">{weightDisplay}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Declared Value</div>
          <div className="font-medium">{costDisplay}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Current Handler</div>
          <div className="font-medium">
            {typeof currentHandler === "object" && currentHandler !== null
              ? (currentHandler["name"] as string | undefined) ?? "-"
              : "-"}
          </div>
        </div>
      </div>

      {note && (
        <div>
          <div className="text-xs text-gray-500">Note</div>
          <div className="text-sm">{note}</div>
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 justify-end">
          {parcel.status !== "delivered" && parcel.status !== "cancelled" && (
            <>
              <button onClick={confirmDelivery} className="btn-primary">
                Confirm Delivery
              </button>
              <button onClick={handleCancel} className="btn-outline">
                Cancel Parcel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ParcelDetails;
