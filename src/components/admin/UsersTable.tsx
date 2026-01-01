import React, { useState, useMemo } from "react";
import { useListUsersQuery } from "../../api/usersApi";
import type { User } from "../../types";
import UserRow from "./UserRow";

/* ================= UTILITIES ================= */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;

  if (isRecord(err)) {
    const obj = err as {
      data?: unknown;
      error?: unknown;
      message?: unknown;
    };

    if (obj.data && isRecord(obj.data)) {
      const dataObj = obj.data as { message?: unknown };
      if (typeof dataObj.message === "string") return dataObj.message;
    }

    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.message === "string") return obj.message;
  }

  return "Failed to load users.";
}

/* ================= TYPES ================= */

type UserWithFlags = User & {
  blocked?: boolean;
  isBlocked?: boolean;
  shortId?: string;
};

/* ================= COMPONENT ================= */

const UsersTable: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [blocked, setBlocked] = useState<"all" | "blocked" | "active">("all");

  /* ---------- Query params ---------- */
  const params = useMemo(
    () => ({
      page,
      limit,
      q: search || undefined,
      role: role || undefined,
      blocked:
        blocked === "all" ? undefined : blocked === "blocked" ? true : false,
    }),
    [page, limit, search, role, blocked]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useListUsersQuery(params);

  const users: User[] = data?.data ?? [];
  const total = data?.total ?? users.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const loading = isLoading || isFetching;
  const empty = !loading && !isError && users.length === 0;

  /* ================= RENDER ================= */

  return (
    <div className="w-full text-sm text-slate-800 dark:text-slate-100">
      {/* ================= CONTROLS ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email…"
            className="w-48 md:w-60 text-sm border rounded-lg px-3 py-2 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-sky-500"
          />

          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="text-sm border rounded-lg px-2 py-2 bg-white dark:bg-slate-800"
          >
            <option value="">All roles</option>
            <option value="sender">Sender</option>
            <option value="receiver">Receiver</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={blocked}
            onChange={(e) => {
              const value = e.target.value as "all" | "blocked" | "active";
              setBlocked(value);
              setPage(1);
            }}
            className="text-sm border rounded-lg px-2 py-2 bg-white dark:bg-slate-800"
          >
            <option value="all">All users</option>
            <option value="active">Active only</option>
            <option value="blocked">Blocked only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="text-sm border rounded-lg px-2 py-2 bg-white dark:bg-slate-800 w-20"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="px-3 py-2 rounded-lg border text-xs hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ================= TABLE (DESKTOP) ================= */}
      <div className="hidden md:block">
        <div className="rounded-lg overflow-hidden bg-white dark:bg-slate-900/60 border">
          <table className="w-full table-fixed">
            <thead className="bg-slate-100 dark:bg-slate-800 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left w-28">ID</th>
                <th className="px-3 py-2 text-left w-40">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left w-28">Role</th>
                <th className="px-3 py-2 text-left w-28">Status</th>
                <th className="px-3 py-2 text-right w-40">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: limit }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-t">
                    <td colSpan={6} className="px-3 py-3">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-red-500">
                    {getErrorMessage(error)}
                  </td>
                </tr>
              ) : empty ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <UserRow key={u._id} user={u} onUpdated={refetch} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-3">
        {users.map((u) => {
          const ext = u as UserWithFlags;
          const isBlocked =
            typeof ext.isBlocked === "boolean"
              ? ext.isBlocked
              : ext.blocked ?? false;

          return (
            <article
              key={u._id}
              className="border rounded-lg p-3 bg-white dark:bg-slate-900"
            >
              <div className="font-semibold">{u.name || "Unnamed user"}</div>
              <div className="text-xs text-slate-500 break-all">{u.email}</div>

              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                  {u.role}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    isBlocked
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isBlocked ? "Blocked" : "Active"}
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div>
          Showing <b>{users.length}</b> of <b>{total}</b> users
        </div>

        <div className="flex gap-2">
          <button onClick={() => setPage(1)} disabled={page === 1}>
            «
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ‹
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            ›
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
