// client/src/app/admin/page.js
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import useApi from "@/hooks/useApi";
import LoadingState from "@/components/LoadingState";
import { useLocale } from "@/context/LocaleContext";
import {
  Users,
  Activity,
  DollarSign,
  TrendingUp,
  Database,
  Gamepad2,
  FileText,
  Shield,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { t, locale } = useLocale();
  const { get } = useApi();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState("");

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale || "en-US", {
        maximumFractionDigits: 0,
      }),
    [locale]
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale || "en-US", {
        dateStyle: "medium",
      }),
    [locale]
  );

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await get("/admin/dashboard");
      setMetrics(data);
    } catch (err) {
      setError(err.message || t("admin.error.description"));
    } finally {
      setLoading(false);
    }
  }, [get, t]);

  useEffect(() => {
    // Check admin access
    if (user && user.role !== "admin") {
      router.push("/");
      return;
    }

    if (user) {
      void loadDashboard();
    }
  }, [user, router, loadDashboard]);

  if (!user) {
    return <LoadingState message={t("admin.loading")} />;
  }

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-16 w-16 text-red-400" />
          <h1 className="mt-4 text-2xl font-bold text-white">{t("admin.accessDenied.title")}</h1>
          <p className="mt-2 text-gray-400">{t("admin.accessDenied.description")}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingState message={t("admin.loading")} />;
  }

  if (error) {
    const errorMessage = error || t("admin.error.description");
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-red-400" />
          <h1 className="mt-4 text-2xl font-bold text-white">{t("admin.error.title")}</h1>
          <p className="mt-2 text-gray-400">{errorMessage}</p>
          <button
            onClick={loadDashboard}
            className="mt-4 rounded-xl bg-blue-500 px-6 py-2 font-semibold text-white hover:bg-blue-600"
          >
            {t("admin.error.retry")}
          </button>
        </div>
      </div>
    );
  }

  const stats = metrics?.stats || {};
  const newUsersCount = stats.newUsersToday || 0;

  const statCards = [
    {
      icon: <Users className="h-6 w-6" />,
      label: t("admin.stats.totalUsers.label"),
      value: stats.totalUsers || 0,
      subtitle: t("admin.stats.totalUsers.subtitle", { count: newUsersCount }),
      color: "blue",
    },
    {
      icon: <Activity className="h-6 w-6" />,
      label: t("admin.stats.activeRooms.label"),
      value: stats.activeGames || 0,
      subtitle: t("admin.stats.activeRooms.subtitle"),
      color: "green",
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      label: t("admin.stats.totalBalance.label"),
      value: numberFormatter.format(stats.totalBalance || 0),
      subtitle: t("admin.stats.totalBalance.subtitle"),
      color: "yellow",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      label: t("admin.stats.transactions.label"),
      value: stats.transactions24h || 0,
      subtitle: t("admin.stats.transactions.subtitle"),
      color: "purple",
    },
  ];

  const managementCards = [
    {
      icon: <Users className="h-8 w-8" />,
      title: t("admin.management.user.title"),
      description: t("admin.management.user.description"),
      href: "/admin/users",
      color: "blue",
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: t("admin.management.metrics.title"),
      description: t("admin.management.metrics.description"),
      href: "/admin/metrics",
      color: "green",
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: t("admin.management.transactions.title"),
      description: t("admin.management.transactions.description"),
      href: "/admin/transactions",
      color: "yellow",
    },
    {
      icon: <Gamepad2 className="h-8 w-8" />,
      title: t("admin.management.games.title"),
      description: t("admin.management.games.description"),
      href: "/admin/games",
      color: "purple",
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: t("admin.management.reports.title"),
      description: t("admin.management.reports.description"),
      href: "/admin/reports",
      color: "pink",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">{t("admin.header.title")}</h1>
          <p className="mt-2 text-gray-400">{t("admin.header.subtitle")}</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <StatCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              subtitle={card.subtitle}
              color={card.color}
            />
          ))}
        </div>

        {/* Management Sections */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {managementCards.map((card) => (
            <ManagementCard
              key={card.href}
              icon={card.icon}
              title={card.title}
              description={card.description}
              href={card.href}
              color={card.color}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Recent Users */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <Users className="h-5 w-5" />
              {t("admin.recentUsers.title")}
            </h3>
            {metrics?.recentUsers?.length ? (
              <div className="space-y-3">
                {metrics.recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="text-xs text-white/60">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">
                        {numberFormatter.format(user.balance || 0)} {t("common.coins")}
                      </p>
                      <p className="text-xs text-white/60">
                        {t("admin.recentUsers.joined", {
                          date: dateFormatter.format(new Date(user.createdAt || Date.now())),
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">{t("admin.recentUsers.empty")}</p>
            )}
          </div>

          {/* Top Balances */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-white">
              <DollarSign className="h-5 w-5" />
              {t("admin.topBalances.title")}
            </h3>
            {metrics?.topBalances?.length ? (
              <div className="space-y-3">
                {metrics.topBalances.map((user, idx) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 font-bold text-white">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.username}</p>
                        <p className="text-xs text-white/60">
                          {t("admin.topBalances.level", { level: user.level || 1 })}
                        </p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-yellow-400">
                      {numberFormatter.format(user.balance || 0)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">{t("admin.topBalances.empty")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, color }) {
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
      <div className="flex items-center justify-between">
        <div className="text-white/80">{icon}</div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-white/60">{label}</p>
        <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-white/40">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function ManagementCard({ icon, title, description, href, color }) {
  const router = useRouter();

  const colorClasses = {
    blue: "from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-400/50",
    green: "from-green-500/10 to-green-600/10 border-green-500/20 hover:border-green-400/50",
    yellow: "from-yellow-500/10 to-yellow-600/10 border-yellow-500/20 hover:border-yellow-400/50",
    purple: "from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:border-purple-400/50",
    pink: "from-pink-500/10 to-pink-600/10 border-pink-500/20 hover:border-pink-400/50",
    indigo: "from-indigo-500/10 to-indigo-600/10 border-indigo-500/20 hover:border-indigo-400/50",
  };

  return (
    <button
      onClick={() => router.push(href)}
      className={`rounded-2xl border bg-gradient-to-br p-6 text-left transition hover:scale-105 ${colorClasses[color]}`}
    >
      <div className="text-white/80">{icon}</div>
      <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-gray-400">{description}</p>
    </button>
  );
}
