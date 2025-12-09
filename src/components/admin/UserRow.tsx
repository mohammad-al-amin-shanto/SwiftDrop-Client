// src/components/admin/UserRow.tsx
import React, { useState } from "react";
import type { User, Role } from "../../types";
import {
  useBlockUserMutation,
  useUpdateUserMutation,
} from "../../api/usersApi";
import { toast } from "react-toastify";

/** small helper to safely extract messages from unknown errors */
function extractErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, unknown>;
    const data = obj["data"];
    if (typeof data === "object" && data !== null) {
      const msg = (data as Record<string, unknown>)["message"];
      if (typeof msg === "string" && msg.trim()) return msg;
    }
    const message = obj["message"];
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Action failed";
}

type Props = {
  user: User;
  onUpdated?: () => void;
};

export const UserRow: React.FC<Props> = ({ user, onUpdated }) => {
  const [blockUser] = useBlockUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [loading, setLoading] = useState(false);

  const toggleBlock = async () => {
    const action = user.isBlocked ? "Unblock" : "Block";
    if (!confirm(`${action} user ${user.name}?`)) return;

    setLoading(true);
    try {
      await blockUser({ id: user._id, block: !user.isBlocked }).unwrap();
      toast.success(`${action}ed ${user.name}`);
      onUpdated?.();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (role: Role) => {
    if (role === user.role) return;
    setLoading(true);
    try {
      await updateUser({ id: user._id, body: { role } }).unwrap();
      toast.success(`Role updated to ${role}`);
      onUpdated?.();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Prefer shortId for display; fall back to last 6 chars of _id
  const displayId =
    (user as User & { shortId?: string }).shortId ||
    (user._id ? `…${user._id.slice(-6)}` : "—");

  const isBlocked = !!user.isBlocked;

  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
      {/* ID (shortId) */}
      <td className="px-3 py-2 text-xs">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-200">
          {displayId}
        </span>
      </td>

      {/* Name */}
      <td className="px-3 py-2 text-sm">
        <div className="font-medium text-slate-900 dark:text-slate-50">
          {user.name}
        </div>
      </td>

      {/* Email */}
      <td className="px-3 py-2 text-sm">
        <div className="text-xs md:text-sm text-slate-600 dark:text-slate-300 truncate max-w-[260px]">
          {user.email}
        </div>
      </td>

      {/* Role */}
      <td className="px-3 py-2 text-sm">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 capitalize">
          {user.role}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-2 text-sm">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
            isBlocked
              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          }`}
        >
          {isBlocked ? "Blocked" : "Active"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-3 py-2 text-sm">
        <div className="flex items-center justify-end gap-2">
          {/* Role select */}
          <select
            value={user.role}
            onChange={(e) => changeRole(e.target.value as Role)}
            disabled={loading}
            className="text-xs md:text-sm border border-slate-300 dark:border-slate-600 rounded-md px-2 py-1 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
          >
            <option value="sender">Sender</option>
            <option value="receiver">Receiver</option>
            <option value="admin">Admin</option>
          </select>

          {/* Block / Unblock button */}
          <button
            onClick={toggleBlock}
            disabled={loading}
            className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors
              ${
                isBlocked
                  ? "border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
                  : "border-rose-600 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30"
              }
              disabled:opacity-60 disabled:cursor-not-allowed
            `}
            aria-pressed={isBlocked}
          >
            {isBlocked ? "Unblock" : "Block"}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
