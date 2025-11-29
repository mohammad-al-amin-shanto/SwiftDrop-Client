// src/components/ui/DashboardTour.tsx
import React, { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_KEY = "swiftdrop_tour_seen";

/** Mirror the shape from .d.ts so TS can infer step types nicely */
type DriverPopover = {
  title?: string;
  description?: string;
  position?: "top" | "left" | "right" | "bottom" | "auto";
  open?: boolean;
};

type DriverStep = {
  element?: string | HTMLElement;
  popover?: DriverPopover;
  stageBackground?: string;
  onNext?: () => void;
  onPrevious?: () => void;
  onClick?: () => void;
  closeOnClickOutside?: boolean;
};

const steps: DriverStep[] = [
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

declare global {
  interface Window {
    startSwiftDropTour?: () => void;
  }
}

type DriverInstance = ReturnType<typeof driver>;

export const DashboardTour: React.FC<{ autostart?: boolean }> = ({
  autostart = true,
}) => {
  const driverRef = useRef<DriverInstance | null>(null);

  useEffect(() => {
    if (driverRef.current) return;

    const options = {
      animate: true,
      showProgress: true,
      closeBtnText: "Close",
      doneBtnText: "Done",
      overlayClickNext: false,
      keyboardControl: true,
      steps,
    };

    // driver is a factory function, not a constructor
    const inst = driver(options);
    driverRef.current = inst;

    if (autostart) {
      const seen = localStorage.getItem(TOUR_KEY);
      if (!seen) {
        setTimeout(() => {
          try {
            inst.drive();
            localStorage.setItem(TOUR_KEY, "1");
          } catch (e) {
            console.warn("Driver drive failed", e);
          }
        }, 600);
      }
    }

    return () => {
      try {
        inst.destroy();
      } catch (e) {
        console.warn("Driver destroy failed", e);
      }
      driverRef.current = null;
    };
    // run on mount only
  }, [autostart]);

  // expose programmatic start for testing
  useEffect(() => {
    window.startSwiftDropTour = () => {
      const inst = driverRef.current;
      if (!inst) return;
      try {
        inst.drive();
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
