// src/components/ui/DashboardTour.tsx
import React, { useEffect, useRef } from "react";
import Driver from "driver.js";

const TOUR_KEY = "swiftdrop_tour_seen";

// Define steps using data-driver-id selectors
const steps = [
  {
    element: '[data-driver-id="hero"]',
    popover: {
      title: "Welcome to SwiftDrop",
      description: "Quick actions and important notices live here.",
    },
  },
  {
    element: '[data-driver-id="create-parcel"]',
    popover: {
      title: "Create Parcel",
      description: "Fill this form to create a delivery request.",
    },
  },
  {
    element: '[data-driver-id="parcel-search"]',
    popover: {
      title: "Search Parcels",
      description: "Filter and search your parcels quickly here.",
    },
  },
  {
    element: '[data-driver-id="parcel-table"]',
    popover: {
      title: "Parcel Table",
      description: "View, cancel, or confirm parcels here (based on role).",
    },
  },
  {
    element: '[data-driver-id="charts"]',
    popover: {
      title: "Charts",
      description: "Visual summary of shipments and statuses.",
    },
  },
];

export const DashboardTour: React.FC<{ autostart?: boolean }> = ({
  autostart = true,
}) => {
  const driverRef = useRef<InstanceType<typeof Driver> | null>(null);

  useEffect(() => {
    // Avoid multiple instances
    if (driverRef.current) return;
    const driver = new Driver({
      animate: true,
      showProgress: true,
      closeBtnText: "Close",
      doneBtnText: "Done",
      overlayClickNext: false,
      keyboardControl: true,
    });

    driver.defineSteps(steps);
    driverRef.current = driver;

    // Autostart once if not seen
    if (autostart) {
      const seen = localStorage.getItem(TOUR_KEY);
      if (!seen) {
        // slight delay to allow UI to mount
        setTimeout(() => {
          try {
            driver.start();
          } catch (e) {
            console.warn("Driver start failed", e);
          }
        }, 600);
      }
    }

    // cleanup
    return () => {
      try {
        driver.reset();
      } catch (e) {}
      driverRef.current = null;
    };
  }, [autostart]);

  // expose programmatic start/reset via window for quick testing (optional)
  useEffect(() => {
    (window as any).startSwiftDropTour = () => {
      const driver = driverRef.current;
      if (!driver) return;
      driver.start();
      localStorage.setItem(TOUR_KEY, "1");
    };
    return () => {
      delete (window as any).startSwiftDropTour;
    };
  }, []);

  return null;
};

export default DashboardTour;
