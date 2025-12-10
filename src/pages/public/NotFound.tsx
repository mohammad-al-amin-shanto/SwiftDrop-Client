import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { selectIsAuthenticated } from "../../features/auth/authSelectors";

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const isAuth = useAppSelector(selectIsAuthenticated);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoDashboard = () => {
    if (isAuth) {
      navigate("/dashboard/sender"); // router will redirect to correct dashboard anyway
    } else {
      navigate("/auth/login");
    }
  };

  const handleTrackParcel = () => {
    // If you ever add a public /tracking route, change this to "/tracking"
    navigate("/dashboard/tracking");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 px-4">
      <div className="max-w-xl w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800 mb-4">
          <span className="text-xs font-semibold tracking-wide">
            SwiftDrop · Routing issue
          </span>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md px-6 py-8 sm:px-8 sm:py-10">
          {/* 404 visual */}
          <div className="relative inline-block mb-6">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-sky-50 dark:bg-sky-900/50 flex items-center justify-center shadow-inner border border-sky-100/70 dark:border-sky-800/70">
              <span className="text-3xl sm:text-4xl">📦</span>
            </div>
            <div className="absolute -bottom-2 -right-3 px-2 py-0.5 rounded-full text-[11px] bg-sky-600 text-white shadow-sm">
              404
            </div>
          </div>

          {/* Text */}
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">
            This route got misplaced.
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-5">
            We couldn’t find the page you’re looking for. It may have been
            moved, renamed, or never existed. Let’s get you back on track.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 mb-4">
            <button
              type="button"
              onClick={handleGoHome}
              className="inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-sm font-semibold
                         bg-sky-600 hover:bg-sky-700 text-white
                         shadow-sm shadow-sky-500/30
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-50
                         dark:focus:ring-offset-slate-900"
            >
              ⬅ Back to Home
            </button>

            <button
              type="button"
              onClick={handleGoDashboard}
              className="inline-flex justify-center items-center px-4 py-2.5 rounded-lg text-sm font-semibold
                         border border-slate-200 dark:border-slate-700
                         bg-white dark:bg-slate-900
                         text-slate-700 dark:text-slate-100
                         hover:bg-slate-50 dark:hover:bg-slate-800
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-50
                         dark:focus:ring-offset-slate-900"
            >
              {isAuth ? "Go to Dashboard" : "Go to Login"}
            </button>
          </div>

          {/* Secondary link row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-xs sm:text-[13px] text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={handleTrackParcel}
              className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline"
            >
              <span>Track a parcel instead</span>
              <span>↗</span>
            </button>
            <span className="hidden sm:inline text-slate-400">·</span>
            <span className="text-[11px] sm:text-xs">
              If you think this is a mistake, try refreshing or checking the URL
              again.
            </span>
          </div>
        </div>

        {/* Tiny footer hint */}
        <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500">
          SwiftDrop keeps your parcels on the right path — even if the URL
          isn&apos;t.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
