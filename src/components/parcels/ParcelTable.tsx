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

/** A small flexible shape for person-like payloads we may receive */
type PersonLike = {
  name?: string;
  phone?: string;
  address?: string;
  [k: string]: unknown;
};

/** Local debounce hook */
function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Error extractor */
function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, unknown>;
    const data = obj["data"] as Record<string, unknown> | undefined;
    if (data && typeof data.message === "string") return data.message;
    if (typeof obj.message === "string") return obj.message;
  }
  return "An error occurred";
}

/** Safe accessors that work if sender/receiver is User, PersonLike or a string */
function getPersonName(p: User | string | PersonLike | undefined) {
  if (!p) return "-";
  if (typeof p === "string") return p;
  const person = p as PersonLike;
  return person.name ?? "-";
}

function getPersonPhone(p: User | string | PersonLike | undefined) {
  if (!p || typeof p === "string") return "-";
  const person = p as PersonLike;
  return typeof person.phone === "string" ? person.phone : "-";
}

function getPersonAddress(p: User | string | PersonLike | undefined) {
  if (!p || typeof p === "string") return "-";
  const person = p as PersonLike;
  return typeof person.address === "string" ? person.address : "-";
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

  const [cancelParcel] = useCancelParcelMutation();
  const [updateStatus] = useUpdateParcelStatusMutation();

  // show a one-time toast for load error
  useEffect(() => {
    if (isError) {
      const msg = getErrorMessage(error);
      console.debug("List parcels error:", error);
      toast.error(`Failed to load parcels: ${msg}`);
    }
  }, [isError, error]);

  const total = data?.total ?? 0;
  const parcels = data?.data ?? [];

  const handleView = (p: Parcel) => {
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
      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="parcel-search" className="sr-only">
            Search parcels
          </label>
          <input
            id="parcel-search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by tracking, receiver, phone..."
            className="w-48 md:w-60 text-sm md:text-base border rounded px-3 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Search parcels"
          />

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-sm md:text-base border rounded px-2 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            aria-label="Filter by status"
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
            className="text-sm md:text-base border rounded px-2 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            aria-label="Filter by date range"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500 dark:text-slate-300">Show</div>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="text-sm border rounded px-2 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white w-20"
            aria-label="Items per page"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            aria-disabled={isFetching}
            className="
    inline-flex items-center px-3 py-2 rounded text-sm
    border border-slate-300 dark:border-slate-600
    bg-white dark:bg-slate-700
    text-slate-800 dark:text-slate-100
    hover:bg-slate-50 dark:hover:bg-slate-600
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1
  "
          >
            Refresh
          </button>
        </div>
      </div>

      {/* TABLE for md+ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="text-xs text-slate-600 dark:text-slate-300">
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
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-24" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-36" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-12" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-20" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-16" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-20" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-28" />
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
                  className="p-6 text-center text-sm text-slate-500"
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

      {/* CARD LIST for small screens */}
      <div className="md:hidden space-y-3">
        {isLoading || isFetching ? (
          Array.from({ length: Math.max(3, Math.min(limit, 6)) }).map(
            (_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded p-3"
              >
                <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded w-40 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-28 mb-1" />
                <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-32" />
              </div>
            )
          )
        ) : isError ? (
          <div className="p-4 text-red-500">Error loading parcels.</div>
        ) : parcels.length === 0 ? (
          <div className="p-4 text-sm text-slate-500">No parcels found.</div>
        ) : (
          parcels.map((p) => (
            <article
              key={p._id}
              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded p-3"
              aria-labelledby={`parcel-${p._id}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3
                    id={`parcel-${p._id}`}
                    className="font-medium text-sm md:text-base text-slate-800 dark:text-white"
                  >
                    {p.trackingId}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-300">
                    {getPersonName(p.receiver)} • {getPersonPhone(p.receiver)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {getPersonAddress(p.receiver)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium">
                    {p.weight ?? "-"} kg
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {p.status ?? "-"}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => handleView(p)}
                  className="inline-flex items-center px-3 py-1 rounded text-sm border bg-transparent hover:bg-slate-50 dark:hover:bg-slate-600"
                  aria-label={`View parcel ${p.trackingId}`}
                >
                  View
                </button>

                <button
                  onClick={() => handleCancel(p._id)}
                  className="inline-flex items-center px-3 py-1 rounded text-sm border bg-transparent hover:bg-red-50 text-red-600 dark:text-red-400"
                  aria-label={`Cancel parcel ${p.trackingId}`}
                >
                  Cancel
                </button>

                {showConfirmAll && (
                  <button
                    onClick={() => handleConfirm(p._id)}
                    className="inline-flex items-center px-3 py-1 rounded text-sm border bg-green-600 text-white disabled:opacity-60"
                    aria-label={`Confirm parcel ${p.trackingId}`}
                  >
                    Confirm
                  </button>
                )}

                <button
                  onClick={() =>
                    window.open(
                      `/parcels/${p._id}`,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="inline-flex items-center px-3 py-1 rounded text-sm border bg-transparent"
                >
                  Open
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Footer / Pagination */}
      <div className="mt-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="text-sm text-slate-600 dark:text-slate-300">
          Showing <strong>{parcels.length}</strong> of <strong>{total}</strong>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            aria-disabled={page === 1}
            className="
      inline-flex items-center px-3 py-1 rounded text-sm
      border border-slate-300 dark:border-slate-600
      bg-white dark:bg-slate-700
      text-slate-800 dark:text-slate-100
      hover:bg-slate-50 dark:hover:bg-slate-600
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1
    "
          >
            « First
          </button>

          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-disabled={page === 1}
            className="
      inline-flex items-center px-3 py-1 rounded text-sm
      border border-slate-300 dark:border-slate-600
      bg-white dark:bg-slate-700
      text-slate-800 dark:text-slate-100
      hover:bg-slate-50 dark:hover:bg-slate-600
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1
    "
          >
            ‹ Prev
          </button>

          <div className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-sm text-slate-800 dark:text-slate-100">
            Page {page} / {totalPages}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-disabled={page === totalPages}
            className="
      inline-flex items-center px-3 py-1 rounded text-sm
      border border-slate-300 dark:border-slate-600
      bg-white dark:bg-slate-700
      text-slate-800 dark:text-slate-100
      hover:bg-slate-50 dark:hover:bg-slate-600
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1
    "
          >
            Next ›
          </button>

          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            aria-disabled={page === totalPages}
            className="
      inline-flex items-center px-3 py-1 rounded text-sm
      border border-slate-300 dark:border-slate-600
      bg-white dark:bg-slate-700
      text-slate-800 dark:text-slate-100
      hover:bg-slate-50 dark:hover:bg-slate-600
      disabled:opacity-50 disabled:cursor-not-allowed
      focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-1
    "
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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="parcel-modal-title"
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-3xl p-6 shadow-lg">
        <div className="flex justify-between items-start">
          <h3 id="parcel-modal-title" className="text-xl font-semibold">
            Parcel {parcel.trackingId}
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-slate-300"
            aria-label="Close parcel details"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-500">Receiver</div>
            <div className="font-medium">
              {getPersonName(parcel.receiver)} —{" "}
              {getPersonPhone(parcel.receiver)}
            </div>
            <div className="text-sm mt-2 text-slate-600">
              {getPersonAddress(parcel.receiver)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Sender</div>
            <div className="font-medium">
              {getPersonName(parcel.sender)} — {getPersonPhone(parcel.sender)}
            </div>
            <div className="text-sm mt-2 text-slate-600">
              {getPersonAddress(parcel.sender)}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium mb-2">Status Timeline</h4>
          <StatusTimeline parcel={parcel} />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => setOpen(false)}
            className="inline-flex items-center px-4 py-2 border rounded text-sm bg-transparent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
