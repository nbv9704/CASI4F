"use client";

import { useEffect, useMemo, useState } from "react";
import { Flame, Trophy, Users, Wallet } from "lucide-react";
import LoadingState from "@/components/LoadingState";

import { useLocale } from "@/context/LocaleContext";
import useApi from "@/hooks/useApi";

const DEFAULT_SUMMARY = Object.freeze({
  playersTracked: 0,
  totalProfit: 0,
  bestWinStreak: 0,
});

export default function RankingsPage() {
  const { t, locale } = useLocale();
  const api = useApi();

  const [period, setPeriod] = useState("daily");
  const [summary, setSummary] = useState(() => ({ ...DEFAULT_SUMMARY }));
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale],
  );

  const coinsLabel = t("common.coins");
  const streakSuffix = t("home.rankings.streakSuffix");

  const periodOptions = useMemo(
    () => [
      { id: "daily", label: t("home.rankings.periods.daily") },
      { id: "weekly", label: t("home.rankings.periods.weekly") },
      { id: "monthly", label: t("home.rankings.periods.monthly") },
    ],
    [t],
  );

  useEffect(() => {
    let active = true;

    setIsLoading(true);
    setError(null);
    setSummary(() => ({ ...DEFAULT_SUMMARY }));
    setRankings([]);

    api
      .get(`/rankings?period=${period}`)
      .then((response) => {
        if (!active) return;

        const nextSummary = {
          playersTracked: response?.summary?.playersTracked ?? 0,
          totalProfit: response?.summary?.totalProfit ?? 0,
          bestWinStreak: response?.summary?.bestWinStreak ?? 0,
        };
        const nextRankings = Array.isArray(response?.rankings)
          ? response.rankings
          : [];

        setSummary(nextSummary);
        setRankings(nextRankings);
      })
      .catch((err) => {
        if (!active) return;
        const payloadMessage = err?.__payload?.message;
        setError(payloadMessage || t("home.rankings.error"));
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [api, period, t]);

  const summaryCards = useMemo(() => {
    const playersValue = formatter.format(summary.playersTracked ?? 0);
    const totalProfitValue = summary.totalProfit ?? 0;
    const profitPrefix =
      totalProfitValue > 0 ? "+" : totalProfitValue < 0 ? "-" : "";
    const profitNumber = formatter.format(Math.abs(totalProfitValue));
    const streakValue = formatter.format(summary.bestWinStreak ?? 0);

    return [
      {
        id: "players",
        label: t("home.rankings.summary.players"),
        value: playersValue,
        icon: Users,
        gradient: "from-indigo-500 via-indigo-500 to-sky-500",
      },
      {
        id: "profit",
        label: t("home.rankings.summary.profit"),
        value: `${profitPrefix}${profitNumber} ${coinsLabel}`,
        icon: Wallet,
        gradient: "from-emerald-500 via-teal-500 to-lime-500",
      },
      {
        id: "streak",
        label: t("home.rankings.summary.bestStreak"),
        value: `${streakValue} ${streakSuffix}`,
        icon: Flame,
        gradient: "from-amber-500 via-orange-500 to-rose-500",
      },
    ];
  }, [coinsLabel, formatter, streakSuffix, summary, t]);

  const currentPeriodLabel =
    periodOptions.find((option) => option.id === period)?.label ?? period;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-12 text-slate-100 lg:px-8">
      <section className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-8 shadow-lg shadow-black/20">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-start">
            <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
              <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
              {t("home.rankings.accent")}
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-white lg:text-4xl">
              {t("home.rankings.title")}
            </h1>
            <p className="mt-3 text-sm text-slate-300 lg:text-base">
              {t("home.rankings.subtitle")}
            </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {t("home.rankings.showing", { period: currentPeriodLabel })}
            </span>
            <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 p-1">
              {periodOptions.map((option) => {
                const isActive = period === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPeriod(option.id)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                      isActive
                        ? "bg-indigo-500/30 text-white shadow-inner"
                        : "text-slate-300 hover:text-white"
                    }`}
                    aria-pressed={isActive}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
          {error ? (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map(({ id, label, value, icon: Icon, gradient }) => {
          const showPlaceholder = isLoading || Boolean(error);

          return (
            <div
              key={id}
              className={`group relative flex flex-col gap-6 overflow-hidden rounded-3xl border border-transparent bg-gradient-to-br ${gradient} p-6 text-white shadow-lg shadow-black/20 transition ${
                showPlaceholder ? "" : "hover:-translate-y-1 hover:shadow-xl"
              }`}
            >
              <div
                className={`absolute inset-0 ${
                  showPlaceholder
                    ? "bg-slate-950/35"
                    : "bg-slate-950/25 transition-opacity group-hover:bg-slate-950/20"
                }`}
                aria-hidden="true"
              />
              <Icon
                className={`relative h-8 w-8 text-white/90 drop-shadow ${
                  showPlaceholder ? "" : "transition group-hover:scale-105"
                }`}
                aria-hidden="true"
              />
              <div className="relative space-y-2">
                <p className="text-sm font-medium text-white/80">{label}</p>
                <p className="text-2xl font-semibold text-white">
                  {showPlaceholder ? "—" : value}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70 shadow-lg shadow-black/20">
        <div className="grid grid-cols-[80px_1fr_140px_140px_160px] gap-4 border-b border-slate-800/80 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 sm:text-sm">
          <span>{t("home.rankings.table.rank")}</span>
          <span>{t("home.rankings.table.player")}</span>
          <span>{t("home.rankings.table.games")}</span>
          <span>{t("home.rankings.table.streak")}</span>
          <span>{t("home.rankings.table.profit")}</span>
        </div>
        {isLoading ? (
          <LoadingState
            message={t("home.rankings.loading")}
            fullscreen={false}
            className="py-10"
          />
        ) : error ? (
          <div className="px-6 py-10 text-sm text-rose-200">
            {error}
          </div>
        ) : rankings.length === 0 ? (
          <div className="px-6 py-10 text-sm text-slate-400">
            {t("home.rankings.empty")}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/70">
            {rankings.map((row, index) => {
              const profit = row?.profit ?? 0;
              const profitSign =
                profit > 0 ? "+" : profit < 0 ? "-" : "";
              const profitValue = formatter.format(Math.abs(profit));
              const profitText = profitSign
                ? `${profitSign}${profitValue}`
                : profitValue;
              const profitClass =
                profit >= 0 ? "text-emerald-300" : "text-rose-300";

              return (
                <div
                  key={`${row.userId || row.name}-${index}`}
                  className="grid grid-cols-[80px_1fr_140px_140px_160px] items-center gap-4 px-6 py-4 text-sm text-slate-200 sm:text-base"
                >
                  <span className="font-semibold text-white/90">
                    #{index + 1}
                  </span>
                  <span className="font-medium text-white">
                    {row?.name || t("history.entry.unknown")}
                  </span>
                  <span className="text-slate-300">
                    {formatter.format(row?.games ?? 0)}
                  </span>
                  <span className="text-slate-300">
                    {formatter.format(row?.streak ?? 0)} {streakSuffix}
                  </span>
                  <span className={`font-semibold ${profitClass}`}>
                    {profitText} {coinsLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
