// client/src/app/admin/users/page.js
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import useApi from "@/hooks/useApi";
import LoadingState from "@/components/LoadingState";
import {
  ArrowLeft,
  Search,
  Edit2,
  Trash2,
  Shield,
  DollarSign,
  TrendingUp,
  Ban,
  CheckCircle,
  Users as UsersIcon,
} from "lucide-react";

export default function UserManagementPage() {
  const router = useRouter();
  const { user } = useUser();
  const { get, post, patch, del } = useApi();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ balance: 0, level: 1, role: "user" });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get("/admin/users");
      setUsers(data.users || []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load users:", err);
      setLoading(false);
    }
  }, [get]);

  const filteredUsersMemo = useMemo(() => {
    let filtered = users;

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [roleFilter, search, users]);

  useEffect(() => {
    setFilteredUsers(filteredUsersMemo);
  }, [filteredUsersMemo]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
      return;
    }

    if (user) {
      loadUsers();
    }
  }, [user, router, loadUsers]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      balance: user.balance,
      level: user.level || 1,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      await patch(`/admin/users/${selectedUser._id}`, editForm);
      setShowEditModal(false);
      loadUsers();
    } catch (err) {
      console.error("Failed to update user:", err);
      alert(err.message || "Failed to update user");
    }
  };

  const handleDelete = async (userId, username) => {
    if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;

    try {
      await del(`/admin/users/${userId}`);
      loadUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert(err.message || "Failed to delete user");
    }
  };

  if (!user || user.role !== "admin") return null;

  if (loading) {
    return <LoadingState message="Loading users..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin")}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-white">User Management</h1>
          <p className="mt-2 text-gray-400">
            Manage users, roles, and permissions ({filteredUsers.length} users)
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="jadmin">JAdmin</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-white">{u.username}</p>
                        <p className="text-sm text-white/60">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-yellow-400">
                        {u.balance?.toLocaleString() || 0}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{u.level || 1}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          u.role === "admin"
                            ? "bg-red-500/20 text-red-400"
                            : u.role === "jadmin"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white/60">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="rounded-lg bg-blue-500/20 p-2 text-blue-400 hover:bg-blue-500/30"
                          title="Edit user"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id, u.username)}
                          className="rounded-lg bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              No users found
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Edit User: {selectedUser.username}
            </h2>

            <div className="space-y-4">
              {/* Balance */}
              <div>
                <label className="mb-1 block text-sm font-medium text-white/80">
                  Balance
                </label>
                <input
                  type="number"
                  value={editForm.balance}
                  onChange={(e) =>
                    setEditForm({ ...editForm, balance: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Level */}
              <div>
                <label className="mb-1 block text-sm font-medium text-white/80">
                  Level
                </label>
                <input
                  type="number"
                  min="1"
                  value={editForm.level}
                  onChange={(e) =>
                    setEditForm({ ...editForm, level: Number(e.target.value) })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Role */}
              <div>
                <label className="mb-1 block text-sm font-medium text-white/80">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({ ...editForm, role: e.target.value })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="jadmin">JAdmin</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveEdit}
                className="flex-1 rounded-xl bg-blue-500 py-3 font-semibold text-white hover:bg-blue-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-white hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
