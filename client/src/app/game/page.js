// client/src/app/game/page.js
'use client'

import Link from 'next/link'
import { Gamepad2, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'

import GameCard from '@/components/GameCard'
import GameDetailModal from '@/components/GameDetailModal'
import GameFilterBar from '@/components/GameFilterBar'
import { GAMES } from '@/data/games'
import { useLocale } from '@/context/LocaleContext'

export default function GameHubPage() {
  const { t } = useLocale()
  const [filter, setFilter] = useState({
    type: 'all',         // 'all' | 'solo' | 'battle'
    sort: 'name_asc',    // 'name_asc'|'name_desc'|'stake_asc'|'stake_desc'
    q: '',
  })
  const [activeGame, setActiveGame] = useState(null)

  const filtered = useMemo(() => {
    let list = [...GAMES]

    const resolveName = (game) => {
      const key = `games.entries.${game.id}.name`
      const value = t(key)
      return typeof value === 'string' && value !== key ? value : game.name
    }

    // type filter
    if (filter.type !== 'all') {
      list = list.filter(g => g.supports?.includes(filter.type))
    }

    // search
    if (filter.q?.trim()) {
      const s = filter.q.trim().toLowerCase()
      list = list.filter(g =>
        resolveName(g).toLowerCase().includes(s) ||
        g.name.toLowerCase().includes(s) ||
        g.id.toLowerCase().includes(s)
      )
    }

    // sort
    switch (filter.sort) {
      case 'name_desc':
        list.sort((a,b) => resolveName(b).localeCompare(resolveName(a))); break
      case 'stake_asc':
        list.sort((a,b) => (a.minBet ?? 0) - (b.minBet ?? 0)); break
      case 'stake_desc':
        list.sort((a,b) => (b.minBet ?? 0) - (a.minBet ?? 0)); break
      default:
        list.sort((a,b) => resolveName(a).localeCompare(resolveName(b))); break
    }

    // Keep “with thumbnails first” feel (coinflip/dice/blackjackdice)
    const HAS_THUMB = new Set(['coinflip','dice','blackjackdice'])
    list.sort((a,b) => (HAS_THUMB.has(b.id) - HAS_THUMB.has(a.id)))

    return list.map(game => ({ ...game, displayName: resolveName(game) }))
  }, [filter, t])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 lg:px-6">
  <section className="relative overflow-hidden rounded-3xl border border-neutral-200/70 bg-gradient-to-br from-white via-white to-violet-50 p-8 shadow-sm dark:border-neutral-800/70 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/40">
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-violet-500/30 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-12 right-0 h-36 w-36 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden="true" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-violet-600 dark:text-violet-300">
              <Sparkles className="h-3 w-3" />
              {t('games.page.headerAccent')}
            </span>
            <h1 className="mt-4 text-3xl font-semibold text-neutral-900 dark:text-white lg:text-4xl">
              {t('games.page.title')}
            </h1>
            <p className="mt-3 text-base text-neutral-600 dark:text-neutral-300">
              {t('games.page.subtitle')}
            </p>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {t('games.page.explorerHint')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/game/solo"
              className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/80 px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md dark:border-neutral-700 dark:bg-slate-950/80 dark:text-neutral-200 dark:hover:border-neutral-500"
            >
              <Gamepad2 className="h-4 w-4" />
              {t('games.page.viewSolo')}
            </Link>
            <Link
              href="/game/battle"
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:opacity-95"
            >
              ⚔️ {t('games.page.viewBattle')}
            </Link>
          </div>
        </div>
      </section>

      <GameFilterBar onChange={setFilter} initial={filter} />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-neutral-200 py-20 text-center text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <p className="text-lg font-semibold">{t('games.page.emptyTitle')}</p>
          <button
            onClick={() => setFilter({ type: 'all', sort: 'name_asc', q: '' })}
            className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
            type="button"
          >
            {t('games.page.emptyAction')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((g) => (
            <button
              key={g.id}
              onClick={() => setActiveGame(g)}
              className="text-left rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-transform hover:scale-105"
              aria-label={t('games.page.previewAria', { name: g.displayName || g.name })}
              type="button"
            >
              <GameCard mode={g.id} fluid />
            </button>
          ))}
        </div>
      )}

      <GameDetailModal
        open={!!activeGame}
        onOpenChange={(v) => !v && setActiveGame(null)}
        game={activeGame}
        preferredType={filter.type === 'battle' ? 'battle' : 'solo'}
      />
    </div>
  )
}
