import React, { useState } from "react";
import { useAppSelector } from "../../app/hooks";
import type { User, Role } from "../../types";
import {
  useBlockUserMutation,
  useUpdateUserMutation,
} from "../../api/usersApi";
import { toast } from "react-toastify";

type Props = {
  user: User;
  isBlocked: boolean;
  onUpdated?: () => void;
};

const MobileUserActions: React.FC<Props> = ({ user, isBlocked, onUpdated }) => {
  const currentUser = useAppSelector((s) => s.auth.user);
  const isAdmin = currentUser?.role === "admin";
  const isSelf = currentUser?._id === user._id;

  const [blockUser] = useBlockUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [loading, setLoading] = useState(false);

  if (!isAdmin || isSelf) return null;

  const toggleBlock = async () => {
    if (!confirm(`${isBlocked ? "Unblock" : "Block"} ${user.name}?`)) return;

    setLoading(true);
    try {
      await blockUser({
        id: user._id,
        block: !isBlocked,
      }).unwrap();

      toast.success(`${isBlocked ? "Unblocked" : "Blocked"} ${user.name}`);
      onUpdated?.();
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-end pt-2 border-t border-slate-200 dark:border-slate-700">
      <select
        value={user.role}
        onChange={(e) => changeRole(e.target.value as Role)}
        disabled={loading}
        className="text-xs border rounded px-2 py-1 
bg-white dark:bg-slate-800 
text-slate-800 dark:text-slate-100"
      >
        <option value="sender">Sender</option>
        <option value="receiver">Receiver</option>
        <option value="admin">Admin</option>
      </select>

      <button
        onClick={toggleBlock}
        disabled={loading}
        className={`px-2 py-1 rounded text-xs font-medium text-white ${
          isBlocked
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-rose-600 hover:bg-rose-700"
        }`}
      >
        {isBlocked ? "Unblock" : "Block"}
      </button>
    </div>
  );
};

export default MobileUserActions;
