// src/components/layout/Sidebar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";

type Props = {
  open?: boolean;
  onClose?: () => void;
};

const Sidebar: React.FC<Props> = ({ open = true, onClose }) => {
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role ?? "guest";

  const items: Array<{ to: string; label: string; roles: string[] }> = [
    { to: "/dashboard/sender", label: "Sender Dashboard", roles: ["sender"] },
    {
      to: "/dashboard/receiver",
      label: "Receiver Dashboard",
      roles: ["receiver"],
    },
    { to: "/dashboard/admin", label: "Admin Dashboard", roles: ["admin"] },
    {
      to: "/tracking",
      label: "Track Parcel",
      roles: ["sender", "receiver", "admin"],
    },
    {
      to: "/features",
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

        {/* small close button so onClose is actually used (useful on mobile) */}
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
          const allowed = it.roles.includes(role);
          if (!allowed) return null;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="block py-2 px-3 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 text-xs text-gray-500">© SwiftDrop</div>
    </aside>
  );
};

export default Sidebar;
