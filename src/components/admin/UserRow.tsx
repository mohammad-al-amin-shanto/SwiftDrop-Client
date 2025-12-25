import React, { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import type { User, Role } from "../../types";
import {
  useBlockUserMutation,
  useUpdateUserMutation,
} from "../../api/usersApi";
import { toast } from "react-toastify";

/* ================= UTIL ================= */

function extractErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;

  if (typeof err === "object" && err !== null) {
    const obj = err as Record<string, unknown>;
    const data = obj["data"];

    if (typeof data === "object" && data !== null) {
      const msg = (data as Record<string, unknown>)["message"];
      if (typeof msg === "string") return msg;
    }

    if (typeof obj["message"] === "string") return obj["message"];
  }

  return "Action failed";
}

/* ================= TYPES ================= */

type Props = {
  user: User;
  onUpdated?: () => void;
};

/* ================= COMPONENT ================= */

const UserRow: React.FC<Props> = ({ user, onUpdated }) => {
  const currentUser = useAppSelector((s) => s.auth.user);

  const [blockUser] = useBlockUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [loading, setLoading] = useState(false);

  /* ================= PERMISSIONS ================= */

  const isAdmin = currentUser?.role === "admin";
  const isSelf = currentUser?._id === user._id;

  const canManageUsers = isAdmin;
  const canChangeRole = isAdmin && !isSelf;
  const canBlockUser = isAdmin && !isSelf;

  const isBlocked = !!user.isBlocked;

  /* ================= ACTIONS ================= */

  const toggleBlock = async () => {
    if (!canBlockUser) return;

    const action = isBlocked ? "Unblock" : "Block";
    if (!confirm(`${action} user ${user.name}?`)) return;

    setLoading(true);
    try {
      await blockUser({ id: user._id, block: !isBlocked }).unwrap();
      toast.success(`${action}ed ${user.name}`);
      onUpdated?.();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (role: Role) => {
    if (!canChangeRole || role === user.role) return;

    setLoading(true);
    try {
      await updateUser({ id: user._id, body: { role } }).unwrap();
      toast.success(`Role updated to ${role}`);
      onUpdated?.();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  const displayId =
    (user as User & { shortId?: string }).shortId ||
    (user._id ? `…${user._id.slice(-6)}` : "—");

  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition">
      {/* ID */}
      <td className="px-3 py-2 text-xs">
        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono">
          {displayId}
        </span>
      </td>

      {/* Name */}
      <td className="px-3 py-2 font-medium">{user.name}</td>

      {/* Email */}
      <td className="px-3 py-2 text-sm truncate max-w-[260px]">{user.email}</td>

      {/* Role */}
      <td className="px-3 py-2">
        <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-800 capitalize">
          {user.role}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-2">
        <span
          className={`px-2 py-0.5 rounded-full text-xs ${
            isBlocked
              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          }`}
        >
          {isBlocked ? "Blocked" : "Active"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-3 py-2">
        <div className="flex justify-end gap-2">
          {/* Role change */}
          {canManageUsers ? (
            <select
              value={user.role}
              onChange={(e) => changeRole(e.target.value as Role)}
              disabled={!canChangeRole || loading}
              className="text-xs border rounded px-2 py-1 disabled:opacity-50"
            >
              <option value="sender">Sender</option>
              <option value="receiver">Receiver</option>
              <option value="admin">Admin</option>
            </select>
          ) : (
            <span className="text-xs text-slate-400 italic">No access</span>
          )}

          {/* Block button */}
          {canManageUsers && (
            <button
              onClick={toggleBlock}
              disabled={!canBlockUser || loading}
              className={`px-3 py-1.5 text-xs font-semibold border rounded
                ${
                  isBlocked
                    ? "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    : "border-rose-600 text-rose-700 hover:bg-rose-50"
                }
                disabled:opacity-50
              `}
            >
              {isBlocked ? "Unblock" : "Block"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default UserRow;
