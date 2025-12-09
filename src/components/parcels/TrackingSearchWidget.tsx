// src/components/parcels/TrackingSearchWidget.tsx
import React, { useState } from "react";
import { useTrackByTrackingIdQuery } from "../../api/parcelsApi";
import Button from "../common/Button";
import ParcelDetails from "./ParcelDetails";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

export const TrackingSearchWidget: React.FC = () => {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const {
    data: parcel,
    isFetching,
    isError,
    error,
  } = useTrackByTrackingIdQuery(
    { trackingId: submitted },
    { skip: !submitted }
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setSubmitted(trimmed);
  };

  const disableSearch = !query.trim() || isFetching;

  // Type guards
  const isFetchError = (err: unknown): err is FetchBaseQueryError =>
    typeof err === "object" && err !== null && "status" in err;

  const isSerializedError = (err: unknown): err is SerializedError =>
    typeof err === "object" && err !== null && "message" in err;

  // Small helper to show nicer error messages
  const getErrorMessage = (err: unknown): string => {
    if (!err) return "Error. Check tracking ID.";

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
    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Track your parcel
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter the tracking ID (e.g.{" "}
            <span className="font-mono text-slate-600 dark:text-slate-300">
              SD-20251209-AB1234
            </span>
            ) to see live status and history.
          </p>
        </div>

        {submitted && (
          <div className="hidden md:flex items-center text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200">
            Last searched:{" "}
            <span className="ml-1 font-mono text-[11px]">{submitted}</span>
          </div>
        )}
      </div>

      {/* Search form */}
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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

      {/* Content area */}
      <div className="mt-5 border-t border-slate-100 dark:border-slate-700 pt-4">
        {isFetching ? (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <div className="h-6 w-6 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-300">
              Looking up your parcel details…
            </p>
          </div>
        ) : isError && submitted ? (
          <div className="py-6 text-center">
            <p className="text-sm text-red-500 mb-1">
              {getErrorMessage(error)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please check the tracking ID and try again.
            </p>
          </div>
        ) : !submitted ? (
          <div className="py-4 text-sm text-slate-500 dark:text-slate-400">
            Start by entering a tracking ID above. You’ll see parcel details and
            status timeline here.
          </div>
        ) : !parcel ? (
          <div className="py-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-300">
              No parcel found for <span className="font-mono">{submitted}</span>
              .
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Make sure the ID is correct and includes all characters.
            </p>
          </div>
        ) : (
          <div className="mt-2">
            <ParcelDetails parcel={parcel} />
          </div>
        )}
      </div>
    </section>
  );
};

export default TrackingSearchWidget;
