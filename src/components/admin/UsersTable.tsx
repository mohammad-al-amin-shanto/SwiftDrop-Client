// src/components/admin/UsersTable.tsx
import React, { useState, useMemo } from "react";
import { useListUsersQuery } from "../../api/usersApi";
import type { User } from "../../types";
import UserRow from "./UserRow";

/**
 * Normalize whatever the backend returns into:
 *   { users: User[], total, page, limit }
 *
 * Supports both:
 *  - { data: User[], total, page, limit }
 *  - { status, data: { data: User[], total, page, limit } }
 */
function normalizeUsersResponse(raw: unknown): {
  users: User[];
  total: number;
  page: number;
  limit: number;
} {
  const empty = { users: [], total: 0, page: 1, limit: 10 };

  if (!raw || typeof raw !== "object") return empty;

  type InnerShape = {
    data?: unknown;
    total?: unknown;
    page?: unknown;
    limit?: unknown;
  };

  const obj = raw as InnerShape & { status?: unknown; data?: unknown };

  // If shape is { status, data: { data, total, ... } }, unwrap one level
  let inner: InnerShape = obj;
  if (
    "status" in obj &&
    obj.data &&
    typeof obj.data === "object" &&
    obj.data !== null
  ) {
    const innerCandidate = obj.data as InnerShape;
    if (
      Array.isArray(innerCandidate.data) ||
      typeof innerCandidate.total === "number"
    ) {
      inner = innerCandidate;
    }
  }

  const dataField = inner.data;
  const users = Array.isArray(dataField) ? (dataField as User[]) : [];
  const total = typeof inner.total === "number" ? inner.total : users.length;
  const page = typeof inner.page === "number" ? inner.page : 1;
  const limit =
    typeof inner.limit === "number"
      ? inner.limit
      : users.length > 0
      ? users.length
      : 10;

  return { users, total, page, limit };
}

/** Nicer error extraction without `any` */
function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;

  if (typeof err === "object") {
    const obj = err as {
      data?: unknown;
      error?: unknown;
      message?: unknown;
    };

    if (obj.data && typeof obj.data === "object") {
      const dataObj = obj.data as { message?: unknown };
      if (typeof dataObj.message === "string") return dataObj.message;
    }

    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.message === "string") return obj.message;
  }

  return "Failed to load users.";
}

// Helper type for card view, without using `any`
type UserWithFlags = User & {
  blocked?: boolean;
  isBlocked?: boolean;
};

export const UsersTable: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [blocked, setBlocked] = useState<"all" | "blocked" | "active">("all");

  const params = useMemo(
    () => ({
      page,
      limit,
      search,
      role: role || undefined,
      blocked: blocked === "all" ? undefined : blocked === "blocked",
    }),
    [page, limit, search, role, blocked]
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useListUsersQuery(params);

  const { users, total } = normalizeUsersResponse(data as unknown);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const loading = isLoading || isFetching;
  const empty = !loading && !isError && users.length === 0;

  return (
    <div className="w-full text-sm text-slate-800 dark:text-slate-100">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search users..."
            className="w-48 md:w-60 text-sm border rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />

          {/* Role filter */}
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="text-sm border rounded-lg px-2 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All roles</option>
            <option value="sender">Sender</option>
            <option value="receiver">Receiver</option>
            <option value="admin">Admin</option>
          </select>

          {/* Blocked filter */}
          <select
            value={blocked}
            onChange={(e) =>
              setBlocked(e.target.value as "all" | "blocked" | "active")
            }
            className="text-sm border rounded-lg px-2 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Show
          </span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="text-sm border rounded-lg px-2 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white w-20"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* TABLE for md+ screens (no horizontal scroll expected) */}
      <div className="hidden md:block">
        <div className="rounded-lg bg-white/80 dark:bg-slate-900/60">
          <table className="w-full border-collapse table-fixed">
            <thead className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
              <tr className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: limit }).map((_, idx) => (
                  <tr
                    key={idx}
                    className="animate-pulse border-b border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-3 py-3">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-red-500 text-sm"
                  >
                    {getErrorMessage(error)}
                  </td>
                </tr>
              ) : empty ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-6 text-center text-sm text-slate-500 dark:text-slate-300"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <UserRow key={u._id} user={u} onUpdated={() => refetch()} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CARD LIST for small screens (no horizontal scroll, stacked) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array.from({ length: Math.max(3, Math.min(limit, 6)) }).map(
            (_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg p-3"
              >
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-3 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            )
          )
        ) : isError ? (
          <div className="p-4 text-center text-red-500 text-sm">
            {getErrorMessage(error)}
          </div>
        ) : empty ? (
          <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-300">
            No users found.
          </div>
        ) : (
          users.map((u) => {
            const extended = u as UserWithFlags;

            const name = extended.name ?? "Unnamed user";
            const email = extended.email ?? "No email";
            const role = (extended as Partial<User>).role ?? "—";
            const isBlocked =
              typeof extended.isBlocked === "boolean"
                ? extended.isBlocked
                : typeof extended.blocked === "boolean"
                ? extended.blocked
                : false;

            return (
              <article
                key={u._id}
                className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                      {name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-300 break-all">
                      {email}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      ID: {u._id}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-xs text-slate-500 dark:text-slate-300">
                      Role
                    </div>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                      {role}
                    </div>
                    <div className="mt-1 text-xs">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] ${
                          isBlocked
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        }`}
                      >
                        {isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Footer / pagination */}
      <div className="mt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-300">
        <div>
          Showing{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-100">
            {users.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-100">
            {total}
          </span>{" "}
          users
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs disabled:opacity-50"
          >
            « First
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs disabled:opacity-50"
          >
            ‹ Prev
          </button>
          <span className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-xs">
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs disabled:opacity-50"
          >
            Next ›
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs disabled:opacity-50"
          >
            Last »
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
