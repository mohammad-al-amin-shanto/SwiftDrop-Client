import React, { useEffect, useRef } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

type UserRole = "admin" | "sender" | "receiver";

const getTourKey = (role: UserRole) => `swiftdrop_tour_seen_${role}`;

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

declare global {
  interface Window {
    startSwiftDropTour?: () => void;
  }
}

type DriverInstance = ReturnType<typeof driver>;

const adminSteps: DriverStep[] = [
  {
    element: '[data-driver-id="hero"]',
    popover: {
      title: "Admin Overview",
      description: "Monitor parcels, users, and system health here.",
    },
  },
  {
    element: '[data-driver-id="users-table"]',
    popover: {
      title: "Users Management",
      description: "Block, unblock, and review user roles.",
    },
  },
  {
    element: '[data-driver-id="charts"]',
    popover: {
      title: "Analytics",
      description: "Visual breakdown of parcel activity.",
    },
  },
];

const senderSteps: DriverStep[] = [
  {
    element: '[data-driver-id="hero"]',
    popover: {
      title: "Sender Dashboard",
      description: "Your shipment control center.",
    },
  },
  {
    element: '[data-driver-id="create-parcel"]',
    popover: {
      title: "Create Parcel",
      description: "Start a new delivery request here.",
    },
  },
  {
    element: '[data-driver-id="parcel-table"]',
    popover: {
      title: "Your Parcels",
      description: "Track and manage your shipments.",
    },
  },
];

const receiverSteps: DriverStep[] = [
  {
    element: '[data-driver-id="hero"]',
    popover: {
      title: "Receiver Dashboard",
      description: "Track incoming parcels and deliveries.",
    },
  },
  {
    element: '[data-driver-id="parcel-table"]',
    popover: {
      title: "Incoming Parcels",
      description: "Confirm delivery when parcels arrive.",
    },
  },
];

export const DashboardTour: React.FC<{
  autostart?: boolean;
  role: "admin" | "sender" | "receiver";
}> = ({ autostart = true, role }) => {
  const driverRef = useRef<DriverInstance | null>(null);

  useEffect(() => {
    if (driverRef.current) return;

    const stepsByRole =
      role === "admin"
        ? adminSteps
        : role === "sender"
        ? senderSteps
        : receiverSteps;

    const options = {
      animate: true,
      showProgress: true,
      closeBtnText: "Close",
      doneBtnText: "Done",
      overlayClickNext: false,
      keyboardControl: true,
      steps: stepsByRole,
    };

    // driver is a factory function, not a constructor
    const inst = driver(options);
    driverRef.current = inst;

    if (autostart) {
      const seen = localStorage.getItem(getTourKey(role));
      if (!seen) {
        setTimeout(() => {
          try {
            inst.drive();
            localStorage.setItem(getTourKey(role), "1");
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
  }, [autostart, role]);

  // expose programmatic start for testing
  useEffect(() => {
    window.startSwiftDropTour = () => {
      const inst = driverRef.current;
      if (!inst) return;
      try {
        inst.drive();
        localStorage.setItem(getTourKey(role), "1");
      } catch (e) {
        console.warn("startSwiftDropTour failed", e);
      }
    };
    return () => {
      delete window.startSwiftDropTour;
    };
  }, [role]);

  return null;
};

export default DashboardTour;
