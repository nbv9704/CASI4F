// client/src/app/history/page.js
"use client";

import RequireAuth from "@/components/RequireAuth";
import { useState, useEffect, useMemo, useCallback, useTransition, useId } from "react";
import useApi from "../../hooks/useApi";
import { useUser } from "../../context/UserContext";
import LoadingState from "@/components/LoadingState";
import { useLocale } from "../../context/LocaleContext";
import {
  BarChart3,
  CalendarClock,
  Flame,
  Gamepad2,
  PiggyBank,
  Trophy,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const filtersAreEqual = (a, b) =>
  a.from === b.from && a.to === b.to && a.game === b.game && a.outcome === b.outcome;

const outcomeStyle = {
  win: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  lose: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  tie: "border-slate-500/40 bg-slate-500/10 text-slate-200",
};

function HistoryPage() {
  const { user } = useUser();
  const { get } = useApi();
    const { t, locale } = useLocale();

    const limit = 10;

    const defaultFilters = useMemo(() => {
      const today = new Date();
      const from = new Date();
      from.setDate(today.getDate() - 29);
      return {
        from: toDateInput(from),
        to: toDateInput(today),
        game: "all",
        outcome: "all",
      };
    }, []);

    const [history, setHistory] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [filters, setFilters] = useState(() => ({ ...defaultFilters }));
    const [draftFilters, setDraftFilters] = useState(() => ({ ...defaultFilters }));

    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [analyticsError, setAnalyticsError] = useState("");

    const [isApplyingFilters, startTransition] = useTransition();

    const numberFormatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);

    useEffect(() => {
      if (!user) {
        setHistory([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      let cancelled = false;
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.game && filters.game !== 'all') params.append('game', filters.game);
      if (filters.outcome && filters.outcome !== 'all') params.append('outcome', filters.outcome);

      get(`/user/${user.id}/history?${params.toString()}`)
        .then((res) => {
          if (cancelled) return;
          setHistory(res?.history || []);
          setTotal(res?.total || 0);
          setError("");
        })
        .catch((err) => {
          if (cancelled) return;
          const payloadMessage = err?.__payload?.message || err?.message || t('history.error.generic');
          setError(payloadMessage);
          setHistory([]);
          setTotal(0);
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [user, page, filters, get, limit, t]);

    useEffect(() => {
      if (!user) {
        setAnalytics(null);
        setAnalyticsLoading(false);
        setAnalyticsError("");
        return;
      }

      let cancelled = false;
      setAnalyticsLoading(true);
      setAnalyticsError("");

      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.game && filters.game !== 'all') params.append('game', filters.game);
      if (filters.outcome && filters.outcome !== 'all') params.append('outcome', filters.outcome);

      get(`/user/${user.id}/history/analytics?${params.toString()}`)
        .then((res) => {
          if (cancelled) return;
          setAnalytics(res || null);
          setAnalyticsError("");
        })
        .catch((err) => {
          if (cancelled) return;
          setAnalytics(null);
          setAnalyticsError(err?.__payload?.message || err?.message || t('history.error.analytics'));
        })
        .finally(() => {
          if (!cancelled) {
            setAnalyticsLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }, [user, filters, get, t]);

    const applyFilters = useCallback(() => {
      startTransition(() => {
        setFilters({ ...draftFilters });
        setPage(1);
      });
    }, [draftFilters]);

    const resetFilters = useCallback(() => {
      const template = { ...defaultFilters };
      startTransition(() => {
        setDraftFilters(template);
        setFilters(template);
        setPage(1);
      });
    }, [defaultFilters]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    const fallbackStats = useMemo(() => {
      if (!history || history.length === 0) {
        return {
          totals: { rounds: 0, totalBet: 0, totalPayout: 0, netProfit: 0, totalXp: 0, avgBet: 0 },
          outcomes: { win: 0, lose: 0, tie: 0 },
          streaks: { current: { type: null, length: 0 }, bestWin: 0, bestLose: 0 },
        };
      }

      let wins = 0;
      let losses = 0;
      let ties = 0;
      let totalBet = 0;
      let totalPayout = 0;
      let totalXp = 0;

      history.forEach((entry) => {
        if (!entry) return;
        totalBet += entry.betAmount || 0;
        totalPayout += entry.payout || 0;
        totalXp += entry.experienceGain || 0;
        switch (entry.outcome) {
          case 'win':
            wins += 1;
            break;
          case 'lose':
            losses += 1;
            break;
          case 'tie':
            ties += 1;
            break;
          default:
            break;
        }
      });

      const rounds = history.length;
      return {
        totals: {
          rounds,
          totalBet,
          totalPayout,
          netProfit: totalPayout - totalBet,
          totalXp,
          avgBet: rounds > 0 ? totalBet / rounds : 0,
        },
        outcomes: { win: wins, lose: losses, tie: ties },
        streaks: { current: { type: null, length: 0 }, bestWin: 0, bestLose: 0 },
      };
    }, [history]);

    const totals = analytics?.totals ?? fallbackStats.totals;
    const outcomeCounts = analytics?.outcomes ?? fallbackStats.outcomes;
    const gamesRaw = analytics?.games;
    const gamesBreakdown = useMemo(
      () => (Array.isArray(gamesRaw) ? gamesRaw : []),
      [gamesRaw]
    );
    const timelineRaw = analytics?.timeline;
    const timeline = useMemo(() => {
      if (!Array.isArray(timelineRaw)) return [];
      return [...timelineRaw].sort((a, b) => {
        const left = a?.date || "";
        const right = b?.date || "";
        return left.localeCompare(right);
      });
    }, [timelineRaw]);
    const streaks = analytics?.streaks ?? fallbackStats.streaks;

    const availableGames = useMemo(() => {
      const set = new Set(['all']);
      history.forEach((entry) => {
        if (entry?.game) set.add(entry.game);
      });
      gamesBreakdown.forEach((entry) => {
        if (entry?.game) set.add(entry.game);
      });
      return Array.from(set);
    }, [history, gamesBreakdown]);

    const formatCurrency = useCallback(
      (value) => numberFormatter.format(Math.round(Number.isFinite(value) ? value : 0)),
      [numberFormatter]
    );

    const formatPercent = useCallback((value) => `${(Number(value || 0) * 100).toFixed(1)}%`, []);

    const formatProfit = useCallback(
      (value) => {
        const amount = Number(value || 0);
        if (amount > 0) return `+${formatCurrency(amount)}`;
        if (amount < 0) return `-${formatCurrency(Math.abs(amount))}`;
        return formatCurrency(0);
      },
      [formatCurrency]
    );

    if (!user) {
      return (
        <div className="rounded-3xl bg-slate-900/80 p-10 text-center text-white">
          <p>{t('history.loginRequired')}</p>
        </div>
      );
    }

    if (loading && history.length === 0) {
      return <LoadingState message={t('loading.history')} />;
    }

    if (error) {
      return (
        <div className="rounded-3xl bg-rose-950/80 p-10 text-center text-rose-200">
          <p>{error}</p>
        </div>
      );
    }

    const totalRounds = totals.rounds || 0;
    const winRate = totalRounds > 0 ? outcomeCounts.win / totalRounds : 0;
    const cardClassName =
      "rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm";

    const statCards = [
      {
        icon: Trophy,
        label: t('history.stats.winRate'),
        value: formatPercent(winRate),
        tone: 'text-emerald-300',
      },
      {
        icon: PiggyBank,
        label: t('history.stats.netProfit'),
        value: `${formatProfit(totals.netProfit)} ${t('common.coins')}`,
        tone: totals.netProfit >= 0 ? 'text-emerald-300' : 'text-rose-300',
      },
      {
        icon: Flame,
        label: t('history.stats.totalXp'),
        value: `${formatCurrency(totals.totalXp)} XP`,
        tone: 'text-amber-300',
      },
    ];

    const filterDraftChanged = !filtersAreEqual(filters, draftFilters);
    const canReset = !filtersAreEqual(draftFilters, defaultFilters);

    return (
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.35),_transparent_55%)]" />
          <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-200">
                {t('history.header.accent')}
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{t('history.header.title')}</h1>
              <p className="mt-2 text-sm text-white/70">
                {t('history.header.subtitle', {
                  page,
                  total: totalPages,
                  count: total,
                })}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {statCards.map(({ icon: Icon, label, value, tone }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <Icon className={`h-8 w-8 ${tone}`} />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/70">{label}</p>
                    <p className="text-lg font-semibold" suppressHydrationWarning>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <HistoryFilters
          draft={draftFilters}
          onChange={(field, value) =>
            setDraftFilters((prev) => ({ ...prev, [field]: value }))
          }
          onApply={applyFilters}
          onReset={resetFilters}
          games={availableGames}
          isApplying={isApplyingFilters}
          canApply={filterDraftChanged}
          canReset={canReset}
          t={t}
        />

        <section className={`${cardClassName} space-y-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-300" />
                {t('history.analytics.heading')}
              </p>
              {analyticsLoading && (
                <p className="text-xs text-white/50">{t('history.analytics.loading')}</p>
              )}
              {analyticsError && (
                <p className="text-xs text-rose-300">{analyticsError}</p>
              )}
            </div>
            <span className="text-xs uppercase tracking-wide text-white/60">
              {t('history.analytics.rounds', { count: totals.rounds || 0 })}
            </span>
          </div>

          <TimelineChart data={timeline} formatProfit={formatProfit} t={t} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TrendStatCard
              icon={TrendingUp}
              label={t('history.analytics.currentStreak')}
              value={
                streaks?.current?.length
                  ? `${streaks.current.length} ${t('history.analytics.streakWins')}`
                  : t('history.analytics.noStreak')
              }
              tone="text-emerald-300"
            />
            <TrendStatCard
              icon={TrendingDown}
              label={t('history.analytics.longestWin')}
              value={`${streaks?.bestWin || 0} ${t('history.analytics.streakWins')}`}
              tone="text-indigo-300"
            />
            <TrendStatCard
              icon={TrendingDown}
              label={t('history.analytics.longestLose')}
              value={`${streaks?.bestLose || 0} ${t('history.analytics.streakLosses')}`}
              tone="text-rose-300"
            />
            <TrendStatCard
              icon={Gamepad2}
              label={t('history.analytics.totalRounds')}
              value={formatCurrency(totals.rounds)}
              tone="text-amber-300"
            />
          </div>

          <GameBreakdownList
            games={gamesBreakdown}
            formatCurrency={formatCurrency}
            formatProfit={formatProfit}
            formatPercent={formatPercent}
            t={t}
          />
        </section>

        {history.length === 0 ? (
          <div className={`${cardClassName} text-center text-white/70`}>
            <p>{t('history.empty')}</p>
          </div>
        ) : (
          <section className={`${cardClassName} space-y-4`}>
            {history.map((item) => {
              const profit = (item.payout || 0) - (item.betAmount || 0);
              const outcomeKey = `history.outcome.${item.outcome}`;
              const outcomeRaw = t(outcomeKey);
              const outcomeText = outcomeRaw.startsWith('history.outcome.')
                ? t('history.entry.unknown')
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
                        {t('history.entry.bet', {
                          amount: formatCurrency(item.betAmount),
                          unit: t('common.coins'),
                        })}
                      </h3>
                      <p className="text-sm text-white/60">
                        {t('history.entry.payout', {
                          amount: formatCurrency(item.payout),
                          unit: t('common.coins'),
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

                  <div className="mt-4 grid gap-4 text-sm text-white/60 sm:grid-cols-4">
                    <InfoBlock
                      label={t('history.entry.stakeLabel')}
                      value={`${formatCurrency(item.betAmount)} ${t('common.coins')}`}
                    />
                    <InfoBlock
                      label={t('history.entry.payoutLabel')}
                      value={`${formatCurrency(item.payout)} ${t('common.coins')}`}
                    />
                    <InfoBlock
                      label={t('history.entry.performance')}
                      value={`${formatProfit(profit)} ${t('common.coins')}`}
                      tone={profit >= 0 ? 'text-emerald-300' : 'text-rose-300'}
                    />
                    <InfoBlock
                      label={t('history.entry.xpGain')}
                      value={`${formatCurrency(item.experienceGain || 0)} XP`}
                      tone="text-amber-200"
                    />
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <div className={`${cardClassName} flex flex-col items-center justify-between gap-3 sm:flex-row`}>
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-blue-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('history.pagination.prev')}
          </button>
          <span className="text-sm font-medium text-white/70">
            {t('history.pagination.label', { page, total: totalPages })}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-blue-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('history.pagination.next')}
          </button>
        </div>
      </div>
    );
  }

function HistoryFilters({ draft, onChange, onApply, onReset, games, isApplying, canApply, canReset, t }) {
  return (
    <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-200">
        <BarChart3 className="h-5 w-5 text-indigo-300" />
        <span>{t('history.filters.heading')}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <FilterField
          label={t('history.filters.from')}
          type="date"
          value={draft.from}
          onChange={(value) => onChange('from', value)}
        />
        <FilterField
          label={t('history.filters.to')}
          type="date"
          value={draft.to}
          onChange={(value) => onChange('to', value)}
        />
        <FilterSelect
          label={t('history.filters.game')}
          value={draft.game}
          onChange={(value) => onChange('game', value)}
          options={games.map((game) => ({ value: game, label: game === 'all' ? t('history.filters.allGames') : game }))}
        />
        <FilterSelect
          label={t('history.filters.outcome')}
          value={draft.outcome}
          onChange={(value) => onChange('outcome', value)}
          options={[
            { value: 'all', label: t('history.filters.outcomes.all') },
            { value: 'win', label: t('history.filters.outcomes.win') },
            { value: 'lose', label: t('history.filters.outcomes.lose') },
            { value: 'tie', label: t('history.filters.outcomes.tie') },
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onApply}
          disabled={!canApply || isApplying}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-500/40"
        >
          {isApplying ? t('history.filters.applying') : t('history.filters.apply')}
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={!canReset || isApplying}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t('history.filters.reset')}
        </button>
      </div>
    </section>
  );
}

function FilterField({ label, type, value, onChange }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-white/80">
      <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      <input
        type={type}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-400 focus:bg-white/10"
      />
    </label>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="flex flex-col gap-2 text-sm text-white/80">
      <span className="text-xs uppercase tracking-wide text-white/50">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-400 focus:bg-white/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TimelineChart({ data, formatProfit, t }) {
  const gradientId = useId();

  if (!data || data.length === 0) {
    return <p className="text-sm text-white/60">{t('history.analytics.timelineEmpty')}</p>;
  }

  const profits = data.map((item) => Number(item?.netProfit) || 0);
  const max = Math.max(...profits, 0);
  const min = Math.min(...profits, 0);
  const range = max - min || 1;

  const points = data.map((item, index) => {
    const netProfit = Number(item?.netProfit) || 0;
    const x = data.length === 1 ? 50 : (index / (data.length - 1)) * 100;
    const y = 100 - ((netProfit - min) / range) * 100;
    return { x, y, item: { ...item, netProfit } };
  });

  const zeroYUnclamped = 100 - ((0 - min) / range) * 100;
  const zeroY = Math.min(100, Math.max(0, zeroYUnclamped));

  return (
    <div className="h-48 w-full rounded-2xl border border-white/10 bg-white/5 p-4">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(129, 140, 248, 0.9)" />
            <stop offset="100%" stopColor="rgba(129, 140, 248, 0.1)" />
          </linearGradient>
        </defs>

        {min < 0 && max > 0 && (
          <line
            x1="0"
            y1={zeroY}
            x2="100"
            y2={zeroY}
            stroke="rgba(255,255,255,0.2)"
            strokeDasharray="3 3"
            strokeWidth="0.5"
          />
        )}

        <polyline
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' ')}
        />

        {points.map((point, index) => (
          <circle
            key={point.item.date || index}
            cx={point.x}
            cy={point.y}
            r={1.5}
            fill="rgba(129, 140, 248, 0.9)"
          >
            <title>
              {`${point.item.date}: ${formatProfit(point.item.netProfit)} | ${t('history.analytics.xp', {
                value: point.item.totalXp || 0,
              })}`}
            </title>
          </circle>
        ))}
      </svg>
    </div>
  );
}

function TrendStatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <Icon className={`h-6 w-6 ${tone}`} />
      <div>
        <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
        <p className="text-base font-semibold text-white" suppressHydrationWarning>
          {value}
        </p>
      </div>
    </div>
  );
}

function GameBreakdownList({ games, formatCurrency, formatProfit, formatPercent, t }) {
  if (!games || games.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-white/60">
        {t('history.analytics.gamesEmpty')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-gray-200 flex items-center gap-2">
        <Gamepad2 className="h-4 w-4 text-indigo-300" />
        {t('history.analytics.gamesHeading')}
      </p>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {games.slice(0, 6).map((game) => (
          <div key={game.game} className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{game.game}</p>
                <p className="text-xs text-white/50">
                  {t('history.analytics.rounds', { count: game.rounds || 0 })}
                </p>
              </div>
              <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-200">
                {formatPercent(game.winRate || 0)}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-white/60">
              <span>
                {t('history.analytics.betTotal', {
                  amount: formatCurrency(game.totalBet || 0),
                  unit: t('common.coins'),
                })}
              </span>
              <span>
                {t('history.analytics.profitTotal', {
                  amount: `${formatProfit(game.netProfit)} ${t('common.coins')}`,
                })}
              </span>
              <span>
                {t('history.analytics.xpTotal', { value: formatCurrency(game.totalXp || 0) })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoBlock({ label, value, tone }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className={`font-semibold text-white ${tone || ''}`} suppressHydrationWarning>
        {value}
      </p>
    </div>
  );
}

function toDateInput(date) {
  // Use local timezone instead of UTC to avoid date shifting
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default RequireAuth(HistoryPage);
