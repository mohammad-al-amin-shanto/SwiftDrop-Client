// src/features/parcels/parcelsUtils.ts

import type { Parcel } from "./parcelsSlice";

// Convert internal status codes to human-readable form
export const formatParcelStatus = (status: string): string => {
  const mapping: Record<string, string> = {
    pending: "Pending",
    picked: "Picked Up",
    transit: "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return mapping[status] ?? "Unknown";
};

// Format date properly for showing in UI
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Generate sorted timeline steps for display
export const getStatusTimeline = (parcel: Parcel) => {
  const timeline = [
    {
      label: "Order Created",
      time: parcel.createdAt,
      active: true,
    },
    {
      label: "Picked Up",
      time: parcel.createdAt,
      active:
        parcel.status === "picked" ||
        parcel.status === "transit" ||
        parcel.status === "delivered",
    },
    {
      label: "In Transit",
      time: parcel.updatedAt,
      active: parcel.status === "transit" || parcel.status === "delivered",
    },
    {
      label: "Delivered",
      time: parcel.updatedAt,
      active: parcel.status === "delivered",
    },
  ];

  return timeline;
};
