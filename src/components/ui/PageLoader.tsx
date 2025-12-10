// src/components/ui/PageLoader.tsx
import React from "react";

const PageLoader: React.FC = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-slate-900/90 animate-fadeIn">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative">
          {/* Outer ring */}
          <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700" />

          {/* Inner animated ring */}
          <div
            className="absolute top-0 left-0 h-12 w-12 
                          rounded-full border-4 border-transparent
                          border-t-sky-500 border-r-sky-400 
                          dark:border-t-sky-400 dark:border-r-sky-300
                          animate-spin"
          />
        </div>

        {/* Subtitle */}
        <span className="text-sm font-medium text-slate-600 dark:text-slate-300 tracking-wide">
          Getting things ready…
        </span>

        {/* Subtle UI line */}
        <div className="h-1 w-24 bg-sky-500/20 rounded-full animate-pulse" />
      </div>
    </div>
  );
};

export default PageLoader;
