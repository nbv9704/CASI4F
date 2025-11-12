// client/src/app/admin/transactions/page.js
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import useApi from "@/hooks/useApi";
import LoadingState from "@/components/LoadingState";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Calendar,
} from "lucide-react";

export default function TransactionMonitoringPage() {
  const router = useRouter();
  const { user } = useUser();
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filteredTxs, setFilteredTxs] = useState([]);
  const [stats, setStats] = useState({});
  
  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get("/admin/transactions");
      setTransactions(data.transactions || []);
      setStats(data.stats || {});
      setLoading(false);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setLoading(false);
    }
  }, [get]);

  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === typeFilter);
    }

    // Date filter
    const now = Date.now();
    if (dateFilter === "today") {
      const startOfDay = new Date().setHours(0, 0, 0, 0);
      filtered = filtered.filter((tx) => new Date(tx.createdAt).getTime() >= startOfDay);
    } else if (dateFilter === "week") {
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter((tx) => new Date(tx.createdAt).getTime() >= weekAgo);
    } else if (dateFilter === "month") {
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter((tx) => new Date(tx.createdAt).getTime() >= monthAgo);
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.userId?.username?.toLowerCase().includes(searchLower) ||
          tx.userId?._id?.toLowerCase().includes(searchLower) ||
          tx.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "highest") {
      filtered.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    } else if (sortBy === "lowest") {
      filtered.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
    }

    setFilteredTxs(filtered);
  }, [dateFilter, search, sortBy, transactions, typeFilter]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
      return;
    }

    if (user) {
      loadTransactions();
    }
  }, [user, router, loadTransactions]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const exportToCSV = () => {
    const headers = ["Date", "User", "Type", "Amount", "Balance After", "Description"];
    const rows = filteredTxs.map((tx) => [
      new Date(tx.createdAt).toLocaleString(),
      tx.userId?.username || "Unknown",
      tx.type,
      tx.amount,
      tx.balanceAfter,
      tx.description || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user || user.role !== "admin") return null;

  if (loading) {
    return <LoadingState message="Loading transactions..." />;
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">Transaction Monitoring</h1>
              <p className="mt-2 text-gray-400">
                View and analyze all transactions ({filteredTxs.length} transactions)
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadTransactions}
                className="rounded-xl bg-blue-500 p-3 text-white hover:bg-blue-600"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600"
              >
                <Download className="h-5 w-5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            label="Total Volume"
            value={Math.abs(stats.totalVolume || 0).toLocaleString()}
            color="yellow"
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Total Credits"
            value={(stats.totalCredits || 0).toLocaleString()}
            color="green"
          />
          <StatCard
            icon={<TrendingDown className="h-6 w-6" />}
            label="Total Debits"
            value={(stats.totalDebits || 0).toLocaleString()}
            color="red"
          />
          <StatCard
            icon={<Calendar className="h-6 w-6" />}
            label="Today"
            value={(stats.today || 0).toLocaleString()}
            color="blue"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="game_win">Game Win</option>
            <option value="game_loss">Game Loss</option>
            <option value="daily_bonus">Daily Bonus</option>
            <option value="level_reward">Level Reward</option>
            <option value="admin_adjustment">Admin Adjustment</option>
            <option value="transfer">Transfer</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Type
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">
                    Balance After
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTxs.map((tx) => (
                  <tr
                    key={tx._id}
                    className="border-b border-white/5 transition hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm text-white/80">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-white/60">
                        {new Date(tx.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">
                        {tx.userId?.username || "Unknown"}
                      </p>
                      <p className="text-xs text-white/60">
                        {tx.userId?._id || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          tx.type.includes("win") || tx.type.includes("bonus") || tx.type.includes("reward")
                            ? "bg-green-500/20 text-green-400"
                            : tx.type.includes("loss")
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {tx.type.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p
                        className={`text-lg font-bold ${
                          tx.amount > 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {tx.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-semibold text-white">
                        {tx.balanceAfter?.toLocaleString() || "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white/80">
                        {tx.description || "-"}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTxs.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              No transactions found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
    red: "from-red-500/20 to-red-600/20 border-red-500/30",
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-6 ${colorClasses[color]}`}
    >
      <div className="text-white/80">{icon}</div>
      <div className="mt-4">
        <p className="text-sm font-medium text-white/60">{label}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
