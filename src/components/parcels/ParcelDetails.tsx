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

type PersonLike = {
  name?: string;
  phone?: string;
  address?: string;
  [k: string]: unknown;
};

type ParcelWithExtras = Parcel & {
  logs?: { status?: string }[];
  statusLogs?: { status?: string }[];
  sender?: User | PersonLike | string;
  senderId?: User | PersonLike | string;
  receiver?: User | PersonLike | string;
  receiverId?: User | PersonLike | string;
  cost?: number;
  price?: number;
  note?: string;
  currentHandler?: PersonLike;
};

/** helpers to read person-like fields that may be `string | User | PersonLike | undefined` */
function personName(p: User | string | PersonLike | undefined) {
  if (!p) return "-";
  if (typeof p === "string") return p;
  const obj = p as PersonLike;
  return obj.name ?? "-";
}
function personPhone(p: User | string | PersonLike | undefined) {
  if (!p) return "-";
  if (typeof p === "string") return "-";
  const obj = p as PersonLike;
  return typeof obj.phone === "string" ? obj.phone : "-";
}
function personAddress(p: User | string | PersonLike | undefined) {
  if (!p) return "-";
  if (typeof p === "string") return "-";
  const obj = p as PersonLike;
  return typeof obj.address === "string" ? obj.address : "-";
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

  // Single extended view of parcel without using `any`
  const extended = parcel as ParcelWithExtras;

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

  // logs may be `logs` (old) or `statusLogs` (new)
  const logs: { status?: string }[] =
    extended.logs ?? extended.statusLogs ?? [];

  const latestStatus =
    Array.isArray(logs) && logs.length > 0
      ? logs[logs.length - 1]?.status ?? parcel.status
      : parcel.status;

  // sender/receiver may be either object or string depending on your API
  const sender: User | string | PersonLike | undefined =
    extended.sender ?? extended.senderId;
  const receiver: User | string | PersonLike | undefined =
    extended.receiver ?? extended.receiverId;

  // weight/value — backend uses `price`, older types might use `cost`
  const weightDisplay =
    typeof parcel.weight === "number" ? `${parcel.weight} kg` : "-";

  const rawCost: number | undefined =
    typeof extended.cost === "number"
      ? extended.cost
      : typeof extended.price === "number"
      ? extended.price
      : undefined;

  const costDisplay = typeof rawCost === "number" ? `৳ ${rawCost}` : "-";

  // optional fields coming from backend but not typed on Parcel
  const note = extended.note ?? parcelField<string>(parcel, "note");
  const currentHandler =
    extended.currentHandler ??
    parcelField<PersonLike | undefined>(parcel, "currentHandler");

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
            {currentHandler && typeof currentHandler === "object"
              ? (currentHandler.name as string | undefined) ?? "-"
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
