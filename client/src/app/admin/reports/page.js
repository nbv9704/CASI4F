// client/src/app/admin/reports/page.js
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import useApi from "@/hooks/useApi";
import LoadingState from "@/components/LoadingState";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Gamepad2,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";

export default function AdminReportsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get(`/admin/reports?range=${timeRange}`);
      setReports(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setLoading(false);
    }
  }, [get, timeRange]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
      return;
    }

    if (user) {
      loadReports();
    }
  }, [user, router, loadReports]);

  const exportReport = (reportType) => {
    const timestamp = new Date().toISOString();
    const filename = `${reportType}_report_${timestamp}.json`;
    const data = JSON.stringify(reports, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user || user.role !== "admin") return null;

  if (loading) {
    return <LoadingState message="Loading reports..." />;
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
              <h1 className="text-4xl font-bold text-white">System Reports</h1>
              <p className="mt-2 text-gray-400">
                Advanced analytics and reporting tools
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={loadReports}
                className="rounded-xl bg-blue-500 p-3 text-white hover:bg-blue-600"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => exportReport("full")}
                className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-3 font-semibold text-white hover:bg-green-600"
              >
                <Download className="h-5 w-5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <ReportCard
            icon={<Users className="h-6 w-6" />}
            label="Total Users"
            value={reports?.overview?.totalUsers || 0}
            change={reports?.overview?.userGrowth}
            color="blue"
          />
          <ReportCard
            icon={<Gamepad2 className="h-6 w-6" />}
            label="Games Played"
            value={reports?.overview?.gamesPlayed || 0}
            change={reports?.overview?.gamesGrowth}
            color="green"
          />
          <ReportCard
            icon={<DollarSign className="h-6 w-6" />}
            label="Total Volume"
            value={`${(reports?.overview?.totalVolume || 0).toLocaleString()}`}
            change={reports?.overview?.volumeGrowth}
            color="yellow"
          />
          <ReportCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Active Rate"
            value={`${reports?.overview?.activeRate || 0}%`}
            change={reports?.overview?.activeRateChange}
            color="purple"
          />
        </div>

        {/* Reports Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* User Activity Report */}
          <ReportSection
            title="User Activity"
            icon={<Users className="h-5 w-5" />}
            data={reports?.userActivity}
          >
            <div className="space-y-3">
              <StatRow label="New Registrations" value={reports?.userActivity?.newUsers || 0} />
              <StatRow label="Daily Active Users" value={reports?.userActivity?.dau || 0} />
              <StatRow label="Monthly Active Users" value={reports?.userActivity?.mau || 0} />
              <StatRow label="Avg Session Duration" value={`${reports?.userActivity?.avgSession || 0}m`} />
              <StatRow label="Retention Rate" value={`${reports?.userActivity?.retention || 0}%`} />
            </div>
          </ReportSection>

          {/* Game Performance */}
          <ReportSection
            title="Game Performance"
            icon={<Gamepad2 className="h-5 w-5" />}
            data={reports?.gamePerformance}
          >
            <div className="space-y-3">
              {(reports?.gamePerformance?.topGames || []).map((game) => (
                <div
                  key={game.name}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <span className="font-medium text-white">{game.name}</span>
                  <span className="text-white/60">{game.plays} plays</span>
                </div>
              ))}
            </div>
          </ReportSection>

          {/* Revenue Report */}
          <ReportSection
            title="Revenue & Transactions"
            icon={<DollarSign className="h-5 w-5" />}
            data={reports?.revenue}
          >
            <div className="space-y-3">
              <StatRow label="Total Bets" value={(reports?.revenue?.totalBets || 0).toLocaleString()} />
              <StatRow label="Total Wins" value={(reports?.revenue?.totalWins || 0).toLocaleString()} />
              <StatRow label="House Edge" value={`${reports?.revenue?.houseEdge || 0}%`} />
              <StatRow label="Transactions" value={reports?.revenue?.txCount || 0} />
              <StatRow label="Avg Bet Size" value={(reports?.revenue?.avgBet || 0).toLocaleString()} />
            </div>
          </ReportSection>

          {/* System Health */}
          <ReportSection
            title="System Health"
            icon={<BarChart3 className="h-5 w-5" />}
            data={reports?.systemHealth}
          >
            <div className="space-y-3">
              <StatRow label="Uptime" value={`${reports?.systemHealth?.uptime || 0}%`} />
              <StatRow label="API Response Time" value={`${reports?.systemHealth?.apiLatency || 0}ms`} />
              <StatRow label="Error Rate" value={`${reports?.systemHealth?.errorRate || 0}%`} />
              <StatRow label="Active Connections" value={reports?.systemHealth?.activeConnections || 0} />
              <StatRow label="DB Query Time" value={`${reports?.systemHealth?.dbLatency || 0}ms`} />
            </div>
          </ReportSection>
        </div>

        {/* Detailed Tables */}
        <div className="mt-8 space-y-6">
          {/* Top Players */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <TrendingUp className="h-5 w-5" />
              Top Players by Volume
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white/80">
                      Username
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-white/80">
                      Games Played
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-white/80">
                      Total Wagered
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-white/80">
                      Net Profit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(reports?.topPlayers || []).map((player, idx) => (
                    <tr key={player.username} className="border-b border-white/5">
                      <td className="px-4 py-3 text-white">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-white">
                        {player.username}
                      </td>
                      <td className="px-4 py-3 text-right text-white/80">
                        {player.gamesPlayed}
                      </td>
                      <td className="px-4 py-3 text-right text-white/80">
                        {player.totalWagered.toLocaleString()}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          player.netProfit >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {player.netProfit >= 0 ? "+" : ""}
                        {player.netProfit.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ icon, label, value, change, color }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-6 ${colorClasses[color]}`}
    >
      <div className="text-white/80">{icon}</div>
      <div className="mt-4">
        <p className="text-sm font-medium text-white/60">{label}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        {change !== undefined && (
          <p
            className={`mt-1 text-xs ${
              change >= 0 ? "text-green-400" : "text-red-400"
            }`}
          >
            {change >= 0 ? "+" : ""}
            {change}% from previous period
          </p>
        )}
      </div>
    </div>
  );
}

function ReportSection({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
      <span className="text-sm text-white/80">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
