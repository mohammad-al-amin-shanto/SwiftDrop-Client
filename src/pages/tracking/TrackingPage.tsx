// src/pages/tracking/TrackingPage.tsx
import React, { useState } from "react";
import { useTrackByTrackingIdQuery } from "../../api/parcelsApi";
import StatusTimeline from "../../components/parcels/StatusTimeline";
import ParcelDetails from "../../components/parcels/ParcelDetails";

const TrackingPage: React.FC = () => {
  const [trackingId, setTrackingId] = useState("");
  const [submittedId, setSubmittedId] = useState("");
  const {
    data: parcel,
    isFetching,
    isError,
  } = useTrackByTrackingIdQuery(
    { trackingId: submittedId },
    { skip: !submittedId }
  );

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedId(trackingId.trim());
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Track Your Parcel</h2>

      <form onSubmit={onSearch} className="flex gap-2 mb-6">
        <input
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Enter tracking ID"
          className="input flex-1"
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      <div className="bg-white dark:bg-slate-800 rounded shadow p-4">
        {isFetching ? (
          <div className="text-center py-6">Searching...</div>
        ) : isError ? (
          <div className="text-center text-red-500 py-6">
            Error finding parcel. Check the tracking ID.
          </div>
        ) : !parcel ? (
          <div className="text-center text-gray-500 py-6">
            Enter a tracking ID to see parcel details.
          </div>
        ) : (
          <>
            <ParcelDetails parcel={parcel} />
            <div className="mt-4">
              <h4 className="font-medium mb-2">Status Timeline</h4>
              <StatusTimeline parcel={parcel} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
