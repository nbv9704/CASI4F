// client/src/components/GameFilterBar.jsx
'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { useLocale } from '../context/LocaleContext'

/**
 * Props:
 * - onChange: (state) => void
 * - initial?: { type: 'all'|'solo'|'battle', sort: 'name_asc'|'name_desc'|'stake_asc'|'stake_desc', q: string }
 */
export default function GameFilterBar({ onChange, initial }) {
  const { t } = useLocale()
  const [type, setType] = useState(initial?.type ?? 'all')
  const [sort, setSort] = useState(initial?.sort ?? 'name_asc')
  const [q, setQ] = useState(initial?.q ?? '')

  useEffect(() => {
    onChange?.({ type, sort, q })
  }, [type, sort, q, onChange])

  const types = useMemo(
    () => [
      { value: 'all', label: t('games.filters.typeOptions.all') },
      { value: 'solo', label: t('games.filters.typeOptions.solo') },
      { value: 'battle', label: t('games.filters.typeOptions.battle') },
    ],
    [t]
  )

  const sorts = useMemo(
    () => [
      { value: 'name_asc', label: t('games.filters.sortOptions.nameAsc') },
      { value: 'name_desc', label: t('games.filters.sortOptions.nameDesc') },
      { value: 'stake_asc', label: t('games.filters.sortOptions.stakeAsc') },
      { value: 'stake_desc', label: t('games.filters.sortOptions.stakeDesc') },
    ],
    [t]
  )

  return (
    <div className="rounded-3xl border border-neutral-200/70 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-neutral-800/70 dark:bg-slate-950/60">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {t('games.filters.typeLabel')}
          </span>
          <div className="flex flex-wrap gap-2">
            {types.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 dark:focus-visible:ring-violet-500 ${
                  type === option.value
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 dark:bg-neutral-800/70 dark:text-neutral-300 dark:hover:text-white'
                }`}
                aria-pressed={type === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <label className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('games.filters.searchPlaceholder')}
              className="w-full rounded-2xl border border-neutral-200 bg-white/90 py-2 pl-10 pr-4 text-sm shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:border-neutral-700 dark:bg-slate-950/70 dark:text-neutral-100 dark:focus:border-violet-500 dark:focus:ring-violet-500/60"
              aria-label={t('games.filters.searchPlaceholder')}
            />
          </label>

          <div className="flex items-center gap-2 sm:max-w-[190px]">
            <SlidersHorizontal className="hidden h-4 w-4 text-neutral-400 sm:block" aria-hidden="true" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-2xl border border-neutral-200 bg-white/90 py-2 pl-3 pr-8 text-sm shadow-sm transition focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300 dark:border-neutral-700 dark:bg-slate-950/70 dark:text-neutral-100 dark:focus:border-violet-500 dark:focus:ring-violet-500/60"
              aria-label={t('games.filters.sortLabel')}
            >
              {sorts.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
