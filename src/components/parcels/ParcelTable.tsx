// src/components/parcels/ParcelTable.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  useListParcelsQuery,
  useCancelParcelMutation,
  useUpdateParcelStatusMutation,
} from "../../api/parcelsApi";
import ParcelRow from "./ParcelRow";
import StatusTimeline from "./StatusTimeline";
import type { Parcel, User } from "../../types";
import { toast } from "react-toastify";

/** Local debounce hook (must start with "use" to satisfy hooks lint) */
function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Safe error message extractor (no `any`) */
function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, unknown>;
    const data = obj["data"];
    if (typeof data === "object" && data !== null) {
      const msg = (data as Record<string, unknown>)["message"];
      if (typeof msg === "string" && msg.trim()) return msg;
    }
    const message = obj["message"];
    if (typeof message === "string" && message.trim()) return message;
  }
  return "An error occurred";
}

/** Helpers to read person fields (User or string) */
function getPersonName(p: User | string | undefined) {
  if (!p) return "-";
  return typeof p === "string" ? p : p.name ?? "-";
}
function getPersonPhone(p: User | string | undefined) {
  if (!p) return "-";
  if (typeof p === "string") return "-";
  const obj = p as unknown as Record<string, unknown>;
  const phone = obj["phone"];
  return typeof phone === "string" ? phone : "-";
}
function getPersonAddress(p: User | string | undefined) {
  if (!p) return "-";
  if (typeof p === "string") return "-";
  const obj = p as unknown as Record<string, unknown>;
  const addr = obj["address"];
  return typeof addr === "string" ? addr : "-";
}

type Props = {
  initialPage?: number;
  initialLimit?: number;
  senderId?: string;
  receiverId?: string;
  showConfirmAll?: boolean;
};

export const ParcelTable: React.FC<Props> = ({
  initialPage = 1,
  initialLimit = 10,
  senderId,
  receiverId,
  showConfirmAll = false,
}) => {
  const [page, setPage] = useState<number>(initialPage);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">(
    "30d"
  );

  const debouncedSearch = useDebounce<string>(search, 400);

  const params = useMemo(() => {
    const p: Record<string, unknown> = { page, limit };
    if (debouncedSearch) p.search = debouncedSearch;
    if (status) p.status = status;
    if (senderId) p.senderId = senderId;
    if (receiverId) p.receiverId = receiverId;
    if (dateRange && dateRange !== "all") p.dateRange = dateRange;
    return p;
  }, [page, limit, debouncedSearch, status, dateRange, senderId, receiverId]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useListParcelsQuery(params);

  const [cancelParcel, { isLoading: isCancelling }] = useCancelParcelMutation();
  const [updateStatus] = useUpdateParcelStatusMutation();

  // show a one-time toast for load error
  useEffect(() => {
    if (isError) {
      const msg = getErrorMessage(error);
      console.debug("List parcels error:", error);
      toast.error(`Failed to load parcels: ${msg}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  // keep cancelling state used (avoids unused var warning)
  useEffect(() => {
    if (isCancelling) console.debug("A cancel operation is in progress...");
  }, [isCancelling]);

  const total = data?.total ?? 0;
  const parcels = data?.data ?? [];

  const handleView = (p: Parcel) => {
    // dispatch a typed CustomEvent
    window.dispatchEvent(new CustomEvent<Parcel>("parcel:view", { detail: p }));
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this parcel? This action cannot be undone.")) return;
    try {
      await cancelParcel({ id }).unwrap();
      toast.success("Parcel cancelled");
      refetch();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleConfirm = async (id: string) => {
    if (!confirm("Confirm delivery of this parcel?")) return;
    try {
      await updateStatus({
        id,
        status: "delivered",
        note: "Confirmed via UI",
      }).unwrap();
      toast.success("Parcel confirmed delivered");
      refetch();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by tracking, receiver, phone..."
            className="input"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="collected">Collected</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In transit</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => {
              setDateRange(e.target.value as "7d" | "30d" | "90d" | "all");
              setPage(1);
            }}
            className="input"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">Show</div>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="input w-20"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <button
            onClick={() => refetch()}
            className="btn-outline"
            disabled={isFetching}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="px-3 py-2">Tracking</th>
              <th className="px-3 py-2">Receiver</th>
              <th className="px-3 py-2">Weight</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Value</th>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading || isFetching ? (
              Array.from({ length: limit }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 rounded w-36" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 rounded w-12" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 rounded w-16" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 rounded w-28" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-red-500">
                  Error loading parcels: {getErrorMessage(error)}
                </td>
              </tr>
            ) : parcels.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-sm text-gray-500"
                >
                  No parcels found.
                </td>
              </tr>
            ) : (
              parcels.map((p) => (
                <ParcelRow
                  key={p._id}
                  parcel={p}
                  onView={handleView}
                  onCancel={handleCancel}
                  onConfirm={handleConfirm}
                  showConfirm={showConfirmAll}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing <strong>{parcels.length}</strong> of <strong>{total}</strong>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="btn-outline px-3 py-1"
          >
            « First
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-outline px-3 py-1"
          >
            ‹ Prev
          </button>
          <div className="px-3 py-1 rounded bg-slate-100 text-sm">
            Page {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-outline px-3 py-1"
          >
            Next ›
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="btn-outline px-3 py-1"
          >
            Last »
          </button>
        </div>
      </div>

      <ParcelViewModal />
    </div>
  );
};

export default ParcelTable;

/* Modal component listens for 'parcel:view' events and shows the parcel details. */
function ParcelViewModal() {
  const [open, setOpen] = useState(false);
  const [parcel, setParcel] = useState<Parcel | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<Parcel>;
      setParcel(ce.detail);
      setOpen(true);
    };
    window.addEventListener("parcel:view", handler);
    return () => window.removeEventListener("parcel:view", handler);
  }, []);

  if (!open || !parcel) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-11/12 md:w-3/4 p-6 shadow">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Parcel {parcel.trackingId}</h3>
          <button onClick={() => setOpen(false)} className="text-gray-500">
            Close
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Receiver</div>
            <div className="font-medium">
              {getPersonName(parcel.receiver)} —{" "}
              {getPersonPhone(parcel.receiver)}
            </div>
            <div className="text-sm mt-2">
              {getPersonAddress(parcel.receiver)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Sender</div>
            <div className="font-medium">
              {getPersonName(parcel.sender)} — {getPersonPhone(parcel.sender)}
            </div>
            <div className="text-sm mt-2">
              {getPersonAddress(parcel.sender)}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-2">Status Timeline</h4>
          <StatusTimeline parcel={parcel} />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className="btn-outline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
