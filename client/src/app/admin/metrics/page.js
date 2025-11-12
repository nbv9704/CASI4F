// client/src/app/admin/metrics/page.js
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import useApi from "@/hooks/useApi";
import LoadingState from "@/components/LoadingState";
import {
  Activity,
  ArrowLeft,
  Cpu,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Users,
  Gamepad2,
  DollarSign,
  AlertTriangle,
  Clock,
} from "lucide-react";

export default function SystemMetricsPage() {
  const router = useRouter();
  const { user } = useUser();
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [pvpHealth, setPvpHealth] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadMetrics = useCallback(async () => {
    try {
      const [metricsData, pvpData] = await Promise.all([
        get("/admin/metrics"),
        get("/admin/pvp/health"),
      ]);
      setMetrics(metricsData);
      setPvpHealth(pvpData);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load metrics:", err);
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/");
      return;
    }

    if (user) {
      loadMetrics();
    }
  }, [user, router, loadMetrics]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadMetrics();
    }, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, [autoRefresh, loadMetrics]);

  // PVP Health computed values
  const lastSweepText = useMemo(() => {
    const ts = pvpHealth?.cron?.lastSweepAt;
    const iso = pvpHealth?.cron?.lastSweepIso;
    if (!ts) return "-";
    try {
      const d = iso ? new Date(iso) : new Date(ts);
      const agoSec = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
      return `${agoSec}s ago`;
    } catch {
      return String(ts);
    }
  }, [pvpHealth?.cron?.lastSweepAt, pvpHealth?.cron?.lastSweepIso]);

  const nextSweepText = useMemo(() => {
    const ts = pvpHealth?.cron?.nextSweepAt;
    const iso = pvpHealth?.cron?.nextSweepIso;
    if (!ts) return "-";
    try {
      const d = iso ? new Date(iso) : new Date(ts);
      const inSec = Math.max(0, Math.round((d.getTime() - Date.now()) / 1000));
      return `in ${inSec}s`;
    } catch {
      return String(ts);
    }
  }, [pvpHealth?.cron?.nextSweepAt, pvpHealth?.cron?.nextSweepIso]);

  if (!user || user.role !== "admin") return null;

  if (loading) {
    return <LoadingState message="Loading system metrics..." />;
  }

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/admin")}
              className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Dashboard
            </button>
            <h1 className="text-4xl font-bold text-white">System Metrics</h1>
            <p className="mt-2 text-gray-400">Real-time server monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`rounded-xl px-4 py-2 font-semibold ${
                autoRefresh
                  ? "bg-green-500 text-white"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              Auto-refresh: {autoRefresh ? "ON" : "OFF"}
            </button>
            <button
              onClick={loadMetrics}
              className="rounded-xl bg-blue-500 p-2 text-white hover:bg-blue-600"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* System Info */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<Server className="h-6 w-6" />}
            label="Uptime"
            value={formatUptime(metrics?.system?.uptimeSec || 0)}
            color="blue"
          />
          <MetricCard
            icon={<Cpu className="h-6 w-6" />}
            label="Node Version"
            value={metrics?.system?.nodeVersion || "N/A"}
            color="green"
          />
          <MetricCard
            icon={<HardDrive className="h-6 w-6" />}
            label="Memory (RSS)"
            value={formatBytes(metrics?.system?.memoryUsage?.rss)}
            color="yellow"
          />
          <MetricCard
            icon={<Database className="h-6 w-6" />}
            label="Heap Used"
            value={formatBytes(metrics?.system?.memoryUsage?.heapUsed)}
            color="purple"
          />
        </div>

        {/* Users */}
        <Section title="Users" icon={<Users className="h-6 w-6" />}>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatBox label="Total Users" value={metrics?.users?.total || 0} />
            <StatBox label="New (24h)" value={metrics?.users?.new24h || 0} />
            <StatBox label="New (7d)" value={metrics?.users?.new7d || 0} />
          </div>
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-semibold text-white/60">By Role</h4>
            <div className="grid gap-2 sm:grid-cols-3">
              {Object.entries(metrics?.users?.byRole || {}).map(([role, count]) => (
                <div
                  key={role}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <p className="text-xs text-white/60">{role}</p>
                  <p className="text-xl font-bold text-white">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Games */}
        <Section title="Games" icon={<Gamepad2 className="h-6 w-6" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatBox label="Total Played" value={metrics?.games?.total || 0} />
            <StatBox label="Played (24h)" value={metrics?.games?.played24h || 0} />
          </div>
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-semibold text-white/60">
              Top Games (24h)
            </h4>
            <div className="space-y-2">
              {(metrics?.games?.byGame24h || []).slice(0, 5).map((game) => (
                <div
                  key={game._id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <span className="font-medium text-white">{game._id}</span>
                  <span className="text-white/60">{game.count} plays</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Transactions */}
        <Section title="Transactions" icon={<DollarSign className="h-6 w-6" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatBox label="Total" value={metrics?.transactions?.total || 0} />
            <StatBox label="Count (24h)" value={metrics?.transactions?.count24h || 0} />
          </div>
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-semibold text-white/60">
              By Type (24h)
            </h4>
            <div className="grid gap-2 sm:grid-cols-3">
              {(metrics?.transactions?.byType24h || []).map((tx) => (
                <div
                  key={tx._id}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <p className="text-xs text-white/60">{tx._id}</p>
                  <p className="text-lg font-bold text-white">{tx.count}</p>
                  <p className="text-xs text-white/40">
                    {tx.total.toLocaleString()} coins
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* PVP */}
        <Section title="PVP Rooms" icon={<Activity className="h-6 w-6" />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatBox label="Total Rooms" value={metrics?.pvp?.total || 0} />
            <StatBox label="Active" value={metrics?.pvp?.active || 0} />
          </div>
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-semibold text-white/60">By Status</h4>
            <div className="grid gap-2 sm:grid-cols-4">
              {Object.entries(metrics?.pvp?.byStatus || {}).map(([status, count]) => (
                <div
                  key={status}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <p className="text-xs text-white/60">{status}</p>
                  <p className="text-xl font-bold text-white">{count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* PVP Health Details (merged from old page) */}
          {pvpHealth && (
            <div className="mt-6 space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-white/60">
                <Clock className="h-4 w-4" />
                Cleanup Cron Status
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/60">Sweep Interval</p>
                  <p className="text-lg font-bold text-white">
                    {(pvpHealth.cron?.sweepIntervalMs || 0) / 1000}s
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/60">Last Sweep</p>
                  <p className="text-lg font-bold text-white">{lastSweepText}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs text-white/60">Next Sweep</p>
                  <p className="text-lg font-bold text-white">{nextSweepText}</p>
                </div>
              </div>

              {/* Stale Detection */}
              {pvpHealth.stale && (pvpHealth.stale.coinflip > 0 || pvpHealth.stale.dice > 0) && (
                <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="h-5 w-5" />
                    <h4 className="font-semibold">Stale Pending Rooms Detected</h4>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-white/60">
                        Coinflip (revealAt passed)
                      </p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {pvpHealth.stale.coinflip}
                      </p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-white/60">
                        Dice (advanceAt passed)
                      </p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {pvpHealth.stale.dice}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    green: "from-green-500/20 to-green-600/20 border-green-500/30",
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-500/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-6 ${colorClasses[color]}`}>
      <div className="text-white/80">{icon}</div>
      <div className="mt-4">
        <p className="text-sm font-medium text-white/60">{label}</p>
        <p className="mt-1 text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="text-white/80">{icon}</div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
}
