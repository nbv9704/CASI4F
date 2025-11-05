"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Gamepad2,
  Gift,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

import { useLocale } from "@/context/LocaleContext";
import useApi from "@/hooks/useApi";

const AUTO_ROTATE_MS = 6000;

const CTA_CONFIG = [
  {
    id: "play",
    href: "/game",
    icon: Gamepad2,
    gradient: "from-indigo-500 via-indigo-500 to-sky-500",
  },
  {
    id: "rewards",
    href: "/rewards",
    icon: Gift,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
  },
  {
    id: "wallet",
    href: "/wallet",
    icon: ShieldCheck,
    gradient: "from-emerald-500 via-teal-500 to-lime-500",
  },
  {
    id: "invite",
    href: "/notifications",
    icon: Users,
    gradient: "from-pink-500 via-rose-500 to-purple-500",
  },
];

export default function HomePage() {
  const { t, locale } = useLocale();
  const api = useApi();

  const newsItems = useMemo(
    () => [
      {
        id: "tournaments",
        badge: t("home.news.items.tournaments.badge"),
        title: t("home.news.items.tournaments.title"),
        description: t("home.news.items.tournaments.description"),
        action: t("home.news.items.tournaments.action"),
        href: "/game/battle",
      },
      {
        id: "rewards",
        badge: t("home.news.items.rewards.badge"),
        title: t("home.news.items.rewards.title"),
        description: t("home.news.items.rewards.description"),
        action: t("home.news.items.rewards.action"),
        href: "/rewards",
      },
      {
        id: "security",
        badge: t("home.news.items.security.badge"),
        title: t("home.news.items.security.title"),
        description: t("home.news.items.security.description"),
        action: t("home.news.items.security.action"),
        href: "/settings",
      },
    ],
    [t],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isRankingsLoading, setIsRankingsLoading] = useState(true);
  const [rankingsError, setRankingsError] = useState(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [newsItems.length]);

  useEffect(() => {
    if (isPaused || newsItems.length <= 1) return undefined;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % newsItems.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [isPaused, newsItems.length]);

  const formatter = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale],
  );

  const coinsLabel = t("common.coins");
  const streakSuffix = t("home.rankings.streakSuffix");

  useEffect(() => {
    let active = true;

    setIsRankingsLoading(true);
    setRankingsError(null);
    setLeaderboard([]);

    api
      .get("/rankings?period=daily&limit=5")
      .then((response) => {
        if (!active) return;
        const rows = Array.isArray(response?.rankings)
          ? response.rankings
          : [];
        setLeaderboard(rows);
      })
      .catch((err) => {
        if (!active) return;
        const payloadMessage = err?.__payload?.message;
        setRankingsError(payloadMessage || t("home.rankings.error"));
      })
      .finally(() => {
        if (active) {
          setIsRankingsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [api, t]);

  const currentNews = newsItems[activeIndex] ?? newsItems[0];

  return (
  <main className="min-h-screen text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-24 pt-16 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[3fr_2fr]">
          <div
            className="relative overflow-hidden rounded-3xl bg-slate-950/80 shadow-lg shadow-black/20"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="relative flex flex-col gap-8 p-8 lg:p-12">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
                  {t("home.news.accent")}
                </span>
                <h1 className="mt-4 text-3xl font-semibold text-white lg:text-4xl">
                  {t("home.news.title")}
                </h1>
                <p className="mt-3 max-w-xl text-sm text-slate-300 lg:text-base">
                  {t("home.news.subtitle")}
                </p>
              </div>

              <article className="relative rounded-2xl border border-slate-800/70 bg-slate-950/70 p-6 shadow-inner shadow-black/10">
                <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-indigo-200">
                  {currentNews?.badge}
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  {currentNews?.title}
                </h2>
                <p className="mt-2 text-sm text-slate-300">
                  {currentNews?.description}
                </p>
                <Link
                  href={currentNews?.href ?? "/"}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/50 bg-indigo-500/10 px-5 py-2 text-sm font-semibold text-indigo-100 transition hover:border-indigo-400/60 hover:bg-indigo-500/15"
                >
                  {currentNews?.action}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>

              <div className="flex flex-wrap gap-3">
                {newsItems.map((item, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex min-w-[180px] flex-1 flex-col rounded-2xl border px-4 py-3 text-left transition ${
                        isActive
                          ? "border-indigo-500/60 bg-indigo-500/15 text-white"
                          : "border-slate-800/70 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-[0.25em]">
                        {item.badge}
                      </span>
                      <span className="mt-2 text-sm font-medium text-white/90 line-clamp-2">
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  {t("home.news.viewAll")}
                </span>
                <div className="flex gap-2">
                  {newsItems.map((item, index) => (
                    <span
                      key={item.id}
                      className={`h-2.5 w-2.5 rounded-full transition ${
                        index === activeIndex ? "bg-indigo-400" : "bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col gap-4">
            <div className="rounded-3xl bg-slate-950/80 p-6 shadow-lg shadow-black/15">
              <h2 className="text-lg font-semibold text-white">
                {t("home.ctas.heading")}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {t("home.news.subtitle")}
              </p>
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              {CTA_CONFIG.map(({ id, href, icon: Icon, gradient }) => (
                <Link
                  key={id}
                  href={href}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-transparent bg-gradient-to-br ${gradient} p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl`}
                >
                  <Icon
                    className="relative h-10 w-10 text-white/90 drop-shadow transition group-hover:scale-105"
                    aria-hidden="true"
                  />
                  <div className="mt-6 space-y-1">
                    <h3 className="text-xl font-semibold">
                      {t(`home.ctas.${id}.title`)}
                    </h3>
                    <p className="text-sm text-white/80">
                      {t(`home.ctas.${id}.description`)}
                    </p>
                  </div>
                  <span className="relative mt-6 inline-flex items-center justify-center rounded-full bg-white/20 p-2 text-white/90 transition group-hover:bg-white/30">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">{t("common.next")}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-slate-950/80 p-8 shadow-lg shadow-black/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-200">
                {t("home.rankings.accent")}
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-white lg:text-3xl">
                {t("home.rankings.title")}
              </h2>
              <p className="mt-2 text-sm text-slate-300">
                {t("home.rankings.subtitle")}
              </p>
            </div>
            <Link
              href="/rankings"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:opacity-95"
            >
              <Trophy className="h-4 w-4" aria-hidden="true" />
              {t("home.rankings.viewAll")}
            </Link>
          </div>

              <div className="mt-8 overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/60">
            <div className="grid grid-cols-[80px_1fr_120px_140px] gap-4 border-b border-slate-800/70 px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 sm:text-sm">
              <span>{t("home.rankings.table.rank")}</span>
              <span>{t("home.rankings.table.player")}</span>
              <span>{t("home.rankings.table.streak")}</span>
              <span>{t("home.rankings.table.profit")}</span>
            </div>
                {rankingsError ? (
                  <div className="px-6 py-6 text-sm text-rose-200">
                    {rankingsError}
                  </div>
                ) : isRankingsLoading ? (
                  <div className="px-6 py-6 text-sm text-slate-400">
                    {t("home.rankings.loading")}
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="px-6 py-6 text-sm text-slate-400">
                    {t("home.rankings.empty")}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800/60">
                    {leaderboard.map((row, index) => {
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
                          className="grid grid-cols-[80px_1fr_120px_140px] items-center gap-4 px-6 py-4 text-sm text-slate-200 sm:text-base"
                        >
                          <span className="font-semibold text-white/90">
                            #{index + 1}
                          </span>
                          <span className="font-medium text-white">
                            {row?.name || t("history.entry.unknown")}
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
          </div>
        </section>
      </div>
    </main>
  );
}
