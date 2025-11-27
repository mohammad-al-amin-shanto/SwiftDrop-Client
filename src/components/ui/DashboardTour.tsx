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
] as const;

/**
 * declare a typed extension on window for the test helper function
 */
declare global {
  interface Window {
    startSwiftDropTour?: () => void;
  }
}

export const DashboardTour: React.FC<{ autostart?: boolean }> = ({
  autostart = true,
}) => {
  const driverRef = useRef<InstanceType<typeof Driver> | null>(null);

  useEffect(() => {
    if (driverRef.current) return;

    const options = {
      animate: true,

      showProgress: true,
      closeBtnText: "Close",
      doneBtnText: "Done",
      overlayClickNext: false,
      keyboardControl: true,
    };

    const driver = new Driver(options);

    // Use Parameters<> to infer the expected type of defineSteps argument
    type DefineStepsParam = Parameters<
      InstanceType<typeof Driver>["defineSteps"]
    >[0];
    driver.defineSteps(steps as unknown as DefineStepsParam);

    driverRef.current = driver;

    if (autostart) {
      const seen = localStorage.getItem(TOUR_KEY);
      if (!seen) {
        setTimeout(() => {
          try {
            driver.start();
            localStorage.setItem(TOUR_KEY, "1");
          } catch (e) {
            console.warn("Driver start failed", e);
          }
        }, 600);
      }
    }

    return () => {
      try {
        driver.reset();
      } catch (e) {
        console.warn("Driver reset failed", e);
      }
      driverRef.current = null;
    };
    // run on mount only
  }, [autostart]);

  // expose programmatic start for testing
  useEffect(() => {
    window.startSwiftDropTour = () => {
      const driver = driverRef.current;
      if (!driver) return;
      try {
        driver.start();
        localStorage.setItem(TOUR_KEY, "1");
      } catch (e) {
        console.warn("startSwiftDropTour failed", e);
      }
    };
    return () => {
      delete window.startSwiftDropTour;
    };
  }, []);

  return null;
};

export default DashboardTour;
