import React, { useState } from "react";
import { useTrackByTrackingIdQuery } from "../../api/parcelsApi";
import StatusTimeline from "../../components/parcels/StatusTimeline";
import ParcelDetails from "../../components/parcels/ParcelDetails";
import Button from "../../components/common/Button";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

const TrackingPage: React.FC = () => {
  const [trackingId, setTrackingId] = useState("");
  const [submittedId, setSubmittedId] = useState("");

  const {
    data: parcel,
    isFetching,
    isError,
    error,
  } = useTrackByTrackingIdQuery(
    { trackingId: submittedId },
    { skip: !submittedId }
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = trackingId.trim();
    if (!trimmed) return;
    setSubmittedId(trimmed);
  };

  const disableSearch = !trackingId.trim() || isFetching;

  // ---- Error helpers  ----
  const isFetchError = (err: unknown): err is FetchBaseQueryError =>
    typeof err === "object" && err !== null && "status" in err;

  const isSerializedError = (err: unknown): err is SerializedError =>
    typeof err === "object" && err !== null && "message" in err;

  const getErrorMessage = (err: unknown): string => {
    if (!err) return "Error finding parcel. Please check the tracking ID.";

    if (isFetchError(err)) {
      const data = err.data;
      if (data && typeof data === "object" && "message" in data) {
        const maybeMsg = (data as { message?: unknown }).message;
        if (typeof maybeMsg === "string") return maybeMsg;
      }
      return "We couldn’t find a parcel with that tracking ID.";
    }

    if (isSerializedError(err) && typeof err.message === "string") {
      return err.message;
    }

    return "We couldn’t find a parcel with that tracking ID.";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">
          Track your parcel
        </h1>
        <p className="mt-1 text-sm md:text-base text-slate-500 dark:text-slate-400">
          Enter your tracking ID to see live status, timestamps, and history of
          your shipment.
        </p>
      </header>

      {/* Search card */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        {/* Form */}
        <form
          onSubmit={onSearch}
          className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
        >
          <div className="relative flex-1">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">
              🔍
            </span>
            <input
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter tracking ID, e.g. SD-20251209-AB1234"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm md:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={disableSearch}
            className="whitespace-nowrap px-5"
          >
            {isFetching ? "Searching…" : "Track Parcel"}
          </Button>
        </form>

        {/* Helper / last searched */}
        <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs md:text-sm">
          <p className="text-slate-500 dark:text-slate-400">
            Tip: You can find the tracking ID in your booking confirmation
            (looks like{" "}
            <span className="font-mono text-slate-600 dark:text-slate-300">
              SD-YYYYMMDD-XXXXXX
            </span>
            ).
          </p>
          {submittedId && (
            <p className="text-slate-500 dark:text-slate-400">
              Last searched:{" "}
              <span className="font-mono text-[11px] md:text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {submittedId}
              </span>
            </p>
          )}
        </div>

        {/* Result / states */}
        <div className="mt-5 border-t border-slate-100 dark:border-slate-700 pt-4">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Fetching parcel details…
              </p>
            </div>
          ) : isError && submittedId ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-500 mb-1">
                {getErrorMessage(error)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Make sure the tracking ID is correct and try again.
              </p>
            </div>
          ) : !submittedId ? (
            <div className="py-4 text-sm text-slate-500 dark:text-slate-400">
              Enter a tracking ID above. When found, you’ll see parcel details
              and a full status timeline here.
            </div>
          ) : !parcel ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-300">
                No parcel found for{" "}
                <span className="font-mono">{submittedId}</span>.
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Check for typos or missing characters in the ID.
              </p>
            </div>
          ) : (
            // ✅ Parcel found: details + timeline
            <div className="space-y-5">
              <ParcelDetails parcel={parcel} />
              <div className="mt-2">
                <h2 className="text-sm md:text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">
                  Status timeline
                </h2>
                <StatusTimeline parcel={parcel} />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default TrackingPage;
