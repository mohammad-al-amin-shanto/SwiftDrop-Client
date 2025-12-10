// src/components/ui/RouteChangeLoader.tsx
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

const RouteChangeLoader: React.FC = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState("0%");
  const progressRef = useRef<number | null>(null);

  const startProgress = () => {
    let value = 0;

    const animate = () => {
      // Ease the progress so it slows near the end
      value += Math.random() * 15;
      if (value < 90) {
        setWidth(`${value}%`);
        progressRef.current = requestAnimationFrame(animate);
      }
    };

    progressRef.current = requestAnimationFrame(animate);
  };

  const finishProgress = () => {
    setWidth("100%");
    setTimeout(() => {
      setVisible(false);
      setWidth("0%");
    }, 300);
  };

  useEffect(() => {
    setVisible(true);
    startProgress();

    return () => {
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
    };
  }, [location.pathname]);

  useEffect(() => {
    // Finish after slight delay (backend calls + lazy load)
    const finish = setTimeout(() => finishProgress(), 500);

    return () => clearTimeout(finish);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-9999 pointer-events-none">
      <div
        className="h-1 bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 animate-[swiftTrail_1.2s_ease-in-out_infinite] shadow-md shadow-sky-200 dark:shadow-sky-900 transition-all duration-200 ease-out rounded-b"
        style={{ width }}
      />
    </div>
  );
};

export default RouteChangeLoader;
