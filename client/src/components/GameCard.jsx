// client/src/components/GameCard.jsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useMemo, useState } from 'react'

import { GAMES } from '@/data/games'
import { useLocale } from '../context/LocaleContext'

/**
 * Props:
 * - mode: string (required) - game id (e.g. "coinflip")
 * - fluid?: boolean — if true the card flexes to parent width
 * - disabled?: boolean — show locked overlay state
 */
export default function GameCard({ mode, fluid = false, disabled = false }) {
  const { theme } = useTheme()
  const { t } = useLocale()
  const [mounted, setMounted] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => setMounted(true), [])

  const game = useMemo(() => GAMES.find(g => g.id === mode), [mode])
  const isComingSoon = game?.status === 'coming_soon'
  const nameKey = `games.entries.${mode}.name`
  const descriptionKey = `games.entries.${mode}.description`

  const localizedName = useMemo(() => {
    const value = t(nameKey)
    return typeof value === 'string' && value !== nameKey ? value : game?.name ?? mode
  }, [game?.name, mode, nameKey, t])

  const localizedDescription = useMemo(() => {
    const value = t(descriptionKey)
    return typeof value === 'string' && value !== descriptionKey ? value : game?.description ?? ''
  }, [game?.description, descriptionKey, t])

  // Skeleton during SSR/CSR mismatch
  if (!mounted) {
    return (
      <div
        className={`${fluid ? 'w-full' : 'w-56'} h-64 animate-pulse rounded-3xl border border-neutral-200 bg-neutral-100/60 dark:border-neutral-800 dark:bg-neutral-900/60`}
        aria-label="Loading game card"
      />
    )
  }

  const isDark = theme === 'dark'
  const gradientOverlay = isDark
    ? 'from-violet-500/30 via-transparent to-indigo-500/20'
    : 'from-violet-500/40 via-transparent to-indigo-500/30'
  const src = `/cards/${mode}.png`
  const cardWidth = fluid ? 'w-full' : 'w-56'

  return (
    <div
  className={`${cardWidth} group relative overflow-hidden rounded-3xl border border-neutral-200/70 bg-white/90 shadow-sm transition-all duration-300 ${disabled ? 'opacity-60 grayscale' : 'hover:-translate-y-1 hover:shadow-xl'} dark:border-neutral-800/70 dark:bg-slate-950/70`}
      aria-label={`${localizedName} card${disabled ? ' (locked)' : ''}`}
    >
      {disabled && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/65 text-center text-sm font-semibold text-white">
          <span className="text-lg">🚫</span>
          <span>Game đang bị tạm khóa</span>
        </div>
      )}
      <div className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${gradientOverlay} opacity-80 group-hover:opacity-100 transition`} />

      <div className="relative h-40 overflow-hidden">
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 animate-pulse bg-neutral-200/60 dark:bg-neutral-800/50" />
        )}

        {imgError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-200/70 text-neutral-600 dark:bg-neutral-800/70 dark:text-neutral-300">
            <div className="mb-2 text-4xl">{game?.icon || '🎮'}</div>
            <span className="text-xs opacity-70">No preview</span>
          </div>
        ) : (
          <img
            src={src}
            alt={`${localizedName} preview`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
            draggable={false}
          />
        )}

        {isComingSoon && (
          <div className="absolute right-3 top-3">
            <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-black shadow">
              {t('games.modal.comingSoon')}
            </span>
          </div>
        )}
      </div>

      <div className="relative flex h-24 flex-col gap-1 border-t border-neutral-200/60 px-4 py-3 dark:border-neutral-800/60">
        <h3 className="text-lg font-semibold text-neutral-900 transition-colors group-hover:text-neutral-800 dark:text-neutral-50 dark:group-hover:text-white">
          {localizedName}
        </h3>
        {localizedDescription && (
          <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">{localizedDescription}</p>
        )}
      </div>
    </div>
  )
}