// src/components/admin/UsersTable.tsx
import React, { useState } from "react";
import { useListUsersQuery } from "../../api/usersApi";
import UserRow from "./UserRow";

export const UsersTable: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [blocked, setBlocked] = useState<"all" | "blocked" | "active">("all");

  const params = {
    page,
    limit,
    search,
    role: role || undefined,
    // server expects boolean for blocked filter, so convert: undefined | true | false
    blocked: blocked === "all" ? undefined : blocked === "blocked",
  };

  const { data, isLoading, isError, refetch } = useListUsersQuery(params);

  return (
    <div className="bg-white dark:bg-slate-800 rounded shadow p-4">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search users..."
            className="input"
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="input"
          >
            <option value="">All roles</option>
            <option value="sender">Sender</option>
            <option value="receiver">Receiver</option>
            <option value="admin">Admin</option>
          </select>

          {/* fixed: explicit union cast instead of `any` */}
          <select
            value={blocked}
            onChange={(e) => {
              setBlocked(e.target.value as "all" | "blocked" | "active");
              setPage(1);
            }}
            className="input"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">Show</div>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="input w-20"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-xs text-gray-500">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-red-500">
                  Error loading users
                </td>
              </tr>
            ) : data?.data?.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-6 text-center text-sm text-gray-500"
                >
                  No users found
                </td>
              </tr>
            ) : (
              data!.data.map((u) => (
                <UserRow key={u._id} user={u} onUpdated={() => refetch()} />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {data?.data?.length ?? 0} of {data?.total ?? 0}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="btn-outline"
          >
            First
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-outline"
          >
            Prev
          </button>
          <div className="px-3 py-1 rounded bg-slate-100 text-sm">
            Page {page}
          </div>
          <button onClick={() => setPage((p) => p + 1)} className="btn-outline">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
