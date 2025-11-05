// client/src/app/game/solo/page.js
"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useMemo } from "react";

import GameCard from "@/components/GameCard";
import RequireAuth from '@/components/RequireAuth'
import { GAMES } from "@/data/games";
import { useLocale } from "@/context/LocaleContext";

const HAS_THUMB = new Set(["coinflip", "dice", "blackjackdice"]);

function SoloGamesPage() {
  const { t } = useLocale()

  const games = useMemo(() => {
    const soloGames = GAMES.filter((g) => g.supports.includes("solo"))
    const withNames = soloGames.map((game) => {
      const key = `games.entries.${game.id}.name`
      const localized = t(key)
      const displayName = typeof localized === 'string' && localized !== key ? localized : game.name
      return { ...game, displayName }
    })

    return withNames.sort((a, b) => {
      const aThumb = HAS_THUMB.has(a.id) ? 1 : 0
      const bThumb = HAS_THUMB.has(b.id) ? 1 : 0
      if (bThumb !== aThumb) return bThumb - aThumb
      return a.displayName.localeCompare(b.displayName)
    })
  }, [t])

  return (
    <main className="min-h-screen text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-12 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/80 p-8 shadow-lg shadow-black/20">
          <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-violet-500/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 right-0 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-500/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-violet-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {t('games.solo.headerAccent')}
              </span>
              <h1 className="mt-4 text-3xl font-semibold text-white lg:text-4xl">
                {t('games.solo.title')}
              </h1>
              <p className="mt-3 text-sm text-slate-300 lg:text-base">
                {t('games.solo.subtitle')}
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
                {t('games.solo.helper')}
              </p>
            </div>

            <Link
              href="/game"
              className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-violet-500/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t('games.common.back')}
            </Link>
          </div>
        </section>

        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-800/70 bg-slate-950/70 py-20 text-center text-slate-400">
            <p className="text-lg font-semibold text-white/90">{t('games.solo.emptyTitle')}</p>
            <Link
              href="/game"
              className="inline-flex items-center gap-2 rounded-full border border-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-violet-500/60 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t('games.solo.emptyAction')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
            {games.map((g) => (
              <Link
                key={g.id}
                href={`/game/${g.id}`}
                className="focus-visible:ring-offset-3 group relative block rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 focus-visible:ring-offset-slate-950"
                aria-label={t('games.page.previewAria', { name: g.displayName })}
              >
                <div className="absolute inset-0 rounded-3xl border border-slate-800/70 bg-slate-950/70 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
                <div className="relative">
                  <GameCard mode={g.id} fluid />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default RequireAuth(SoloGamesPage)