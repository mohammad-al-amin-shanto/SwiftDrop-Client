// src/components/layout/Sidebar.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { roles } from "../../constants/roles";

type Props = {
  open?: boolean;
  onClose?: () => void;
};

export const Sidebar: React.FC<Props> = ({ open = true, onClose }) => {
  const user = useAppSelector((s) => s.auth.user);

  const items = [
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
      className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 ${
        open ? "block" : "hidden"
      } w-64`}
    >
      <div className="mb-6">
        <div className="text-sm text-gray-500">Welcome</div>
        <div className="font-semibold">{user?.name ?? "Guest"}</div>
      </div>

      <nav className="space-y-2">
        {items.map((it) => {
          const ok = !it.roles || it.roles.includes(user?.role ?? "guest");
          if (!ok) return null;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="block py-2 px-3 rounded hover:bg-slate-100"
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
