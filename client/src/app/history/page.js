// client/src/app/history/page.js
"use client";

import RequireAuth from "@/components/RequireAuth";
import { useState, useEffect, useMemo } from "react";
import useApi from "../../hooks/useApi";
import { useUser } from "../../context/UserContext";
import Loading from "../../components/Loading";
import { useLocale } from "../../context/LocaleContext";
import { CalendarClock, Gamepad2, PiggyBank, Trophy } from "lucide-react";

function HistoryPage() {
  const { user } = useUser();
  const { get } = useApi();
  const { t, locale } = useLocale();

  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 10;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    get(`/user/${user.id}/history?page=${page}&limit=${limit}`)
      .then((res) => {
        setHistory(res.history || []);
        setTotal(res.total || 0);
        setError("");
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message);
        setHistory([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const stats = useMemo(() => {
    let wins = 0;
    let totalBet = 0;
    let totalPayout = 0;

    history.forEach((item) => {
      if (item.outcome === "win") wins += 1;
      totalBet += item.betAmount || 0;
      totalPayout += item.payout || 0;
    });

    return { wins, totalBet, totalPayout };
  }, [history]);

  if (!user) {
    return (
      <div className="rounded-3xl bg-slate-900/80 p-10 text-center text-white">
        <p>{t("history.loginRequired")}</p>
      </div>
    );
  }

  if (loading) {
    return <Loading text={t("loading.history")} />;
  }

  if (error) {
    return (
      <div className="rounded-3xl bg-rose-950/80 p-10 text-center text-rose-200">
        <p>{error}</p>
      </div>
    );
  }

  const formatCurrency = (value) =>
    typeof value === "number" ? value.toLocaleString(locale) : value || "0";

  const formatProfit = (value) => {
    if (value > 0) return `+${formatCurrency(value)}`;
    if (value < 0) return `-${formatCurrency(Math.abs(value))}`;
    return "0";
  };

  const outcomeStyle = {
    win: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    lose: "border-rose-500/40 bg-rose-500/10 text-rose-200",
    tie: "border-slate-500/40 bg-slate-500/10 text-slate-200",
  };

  const cardClassName =
    "rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm";
  const statCardClassName =
    "flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)]" />
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-200">
              {t("history.header.accent")}
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              {t("history.header.title")}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              {t("history.header.subtitle", {
                page,
                total: totalPages,
                count: total,
              })}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className={statCardClassName}>
              <Trophy className="h-8 w-8 text-emerald-300" />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  {t("history.stats.wins")}
                </p>
                <p className="text-lg font-semibold">{stats.wins}</p>
              </div>
            </div>
            <div className={statCardClassName}>
              <Gamepad2 className="h-8 w-8 text-indigo-300" />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  {t("history.stats.bets")}
                </p>
                <p className="text-lg font-semibold" suppressHydrationWarning>
                  {formatCurrency(stats.totalBet)}
                </p>
              </div>
            </div>
            <div className={statCardClassName}>
              <PiggyBank className="h-8 w-8 text-amber-300" />
              <div>
                <p className="text-xs uppercase tracking-wide text-white/70">
                  {t("history.stats.payout")}
                </p>
                <p className="text-lg font-semibold" suppressHydrationWarning>
                  {formatCurrency(stats.totalPayout)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {history.length === 0 ? (
        <div className={`${cardClassName} text-center text-white/70`}>
          <p>{t("history.empty")}</p>
        </div>
      ) : (
        <section className={`${cardClassName} space-y-4`}>
          {history.map((item) => {
            const profit = (item.payout || 0) - (item.betAmount || 0);
            const outcomeKey = `history.outcome.${item.outcome}`;
            const outcomeRaw = t(outcomeKey);
            const outcomeText = outcomeRaw.startsWith("history.outcome.")
              ? t("history.entry.unknown")
              : outcomeRaw;

            return (
              <article
                key={item._id || `${item.game}-${item.createdAt}`}
                className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:border-blue-400/40 hover:bg-white/10"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
                      <Gamepad2 className="h-4 w-4" />
                      <span>{item.game}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {t("history.entry.bet", {
                        amount: formatCurrency(item.betAmount),
                        unit: t("common.coins"),
                      })}
                    </h3>
                    <p className="text-sm text-white/60">
                      {t("history.entry.payout", {
                        amount: formatCurrency(item.payout),
                        unit: t("common.coins"),
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 text-sm md:items-end">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-semibold ${
                        outcomeStyle[item.outcome] || outcomeStyle.tie
                      }`}
                    >
                      {outcomeText}
                    </span>
                    <div className="flex items-center gap-2 text-white/60">
                      <CalendarClock className="h-4 w-4 text-indigo-200" />
                      <span>
                        {new Date(item.createdAt).toLocaleString(locale, {
                          hour12: false,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 text-sm text-white/60 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      {t("history.entry.stakeLabel")}
                    </p>
                    <p suppressHydrationWarning>
                      {formatCurrency(item.betAmount)} {t("common.coins")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      {t("history.entry.payoutLabel")}
                    </p>
                    <p suppressHydrationWarning>
                      {formatCurrency(item.payout)} {t("common.coins")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/40">
                      {t("history.entry.performance")}
                    </p>
                    <p
                      className={`font-semibold ${profit >= 0 ? "text-emerald-300" : "text-rose-300"}`}
                      suppressHydrationWarning
                    >
                      {formatProfit(profit)} {t("common.coins")}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <div
        className={`${cardClassName} flex flex-col items-center justify-between gap-3 sm:flex-row`}
      >
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-blue-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("history.pagination.prev")}
        </button>
        <span className="text-sm font-medium text-white/70">
          {t("history.pagination.label", { page, total: totalPages })}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-blue-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {t("history.pagination.next")}
        </button>
      </div>
    </div>
  );
}

export default RequireAuth(HistoryPage);
