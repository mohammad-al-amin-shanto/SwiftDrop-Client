// src/components/layout/Sidebar.tsx
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

  // helper: when logged in use dashboard equivalent, otherwise public path
  const linkTo = (publicPath: string, dashboardPath: string) =>
    isAuth ? dashboardPath : publicPath;

  const activeClass =
    "block py-2 px-3 rounded bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-white";

  const items: Array<{ to: string; label: string; roles: string[] }> = [
    { to: "/dashboard/sender", label: "Sender Dashboard", roles: ["sender"] },
    {
      to: "/dashboard/receiver",
      label: "Receiver Dashboard",
      roles: ["receiver"],
    },
    { to: "/dashboard/admin", label: "Admin Dashboard", roles: ["admin"] },
    {
      to: linkTo("/tracking", "/dashboard/tracking"),
      label: "Track Parcel",
      roles: ["sender", "receiver", "admin", "guest"],
    },
    {
      to: linkTo("/features", "/dashboard/features"),
      label: "Features",
      roles: ["guest", "sender", "receiver", "admin"],
    },
  ];

  return (
    <aside
      aria-hidden={!open}
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 ${
        open ? "block" : "hidden"
      } w-64`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-sm text-gray-500">Welcome</div>
          <div className="font-semibold">{user?.name ?? "Guest"}</div>
        </div>

        {onClose ? (
          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="ml-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
            title="Close"
          >
            ✕
          </button>
        ) : null}
      </div>

      <nav className="space-y-2">
        {items.map((it) => {
          const allowed = it.roles.includes(role) || it.roles.includes("guest");
          if (!allowed) return null;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive
                  ? activeClass
                  : "block py-2 px-3 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              }
            >
              {it.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-6 text-xs text-gray-500">© SwiftDrop</div>
    </aside>
  );
};

export default Sidebar;
