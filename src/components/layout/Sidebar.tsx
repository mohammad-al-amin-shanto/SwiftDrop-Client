import React from "react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";

type Props = {
  open?: boolean;
  onClose?: () => void;
};

const Sidebar: React.FC<Props> = ({ open = true, onClose }) => {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role ?? "guest";
  const isAuth = Boolean(user);

  const activeClass =
    "block py-2 px-3 rounded bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-white";
  const baseLinkClass =
    "block py-2 px-3 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200";

  /** -------------------------------
   *  PUBLIC (LOGGED OUT) MENU
   *--------------------------------*/
  const publicItems: Array<{ to: string; label: string }> = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/features", label: "Features" },
  ];

  /** -------------------------------
   *  LOGGED-IN / ROLE-BASED MENU
   *--------------------------------*/
  const authedItems: Array<{ to: string; label: string }> = [];

  if (role === "sender") {
    authedItems.push({ to: "/dashboard/sender", label: "Sender Dashboard" });
  } else if (role === "receiver") {
    authedItems.push({
      to: "/dashboard/receiver",
      label: "Receiver Dashboard",
    });
  } else if (role === "admin") {
    authedItems.push({ to: "/dashboard/admin", label: "Admin Dashboard" });
  }

  // Universal for all logged-in users
  if (isAuth) {
    authedItems.push({ to: "/dashboard/tracking", label: "Track Parcels" });
  }

  const itemsToRender = isAuth ? authedItems : publicItems;

  return (
    <aside
      aria-hidden={!open}
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 ${
        open ? "block" : "hidden"
      } w-64`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-gray-500 dark:text-slate-400">
            Welcome
          </div>
          <div className="font-semibold text-slate-800 dark:text-slate-100">
            {user?.name ?? "Guest"}
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="ml-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {itemsToRender.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? activeClass : baseLinkClass
            }
          >
            {it.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 text-xs text-gray-500 dark:text-slate-500">
        © SwiftDrop
      </div>
    </aside>
  );
};

export default Sidebar;
