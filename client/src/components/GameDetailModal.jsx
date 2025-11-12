// client/src/components/GameDetailModal.jsx
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { useLocale } from '../context/LocaleContext'
import { useGameConfig } from '../hooks/useGameConfig'

/**
 * Props:
 * - open: boolean
 * - onOpenChange: (boolean) => void
 * - game: { id, name, description, minBet, supports, status }
 * - preferredType?: 'solo'|'battle'  // để quyết định Play đi tới đâu nếu support cả hai
 */
export default function GameDetailModal({ open, onOpenChange, game, preferredType = 'solo' }) {
  const { t } = useLocale()
  const [selectedMode, setSelectedMode] = useState(preferredType)
  const { isGameDisabled, loading: configLoading, refreshing: configRefreshing, refresh } = useGameConfig()

  const nameKey = game ? `games.entries.${game.id}.name` : null
  const descriptionKey = game ? `games.entries.${game.id}.description` : null

  const localizedName = useMemo(() => {
    if (!game || !nameKey) return game?.name ?? ''
    const value = t(nameKey)
    return typeof value === 'string' && value !== nameKey ? value : game.name
  }, [game, nameKey, t])

  const localizedDescription = useMemo(() => {
    if (!game || !descriptionKey) return game?.description ?? ''
    const value = t(descriptionKey)
    return typeof value === 'string' && value !== descriptionKey ? value : game.description
  }, [descriptionKey, game, t])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onOpenChange?.(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onOpenChange])

  // Reset selected mode when modal opens
  useEffect(() => {
    if (open && game) {
      // Set to preferred type if supported, otherwise first available mode
      if (game.supports?.includes(preferredType)) {
        setSelectedMode(preferredType)
      } else {
        setSelectedMode(game.supports?.[0] || 'solo')
      }
    }
  }, [open, game, preferredType])

  useEffect(() => {
    if (open) {
      refresh()
    }
  }, [open, refresh])

  if (!open || !game) return null

  const hasBothModes = game.supports?.includes('solo') && game.supports?.includes('battle')
  const configBusy = configLoading || configRefreshing
  const gameDisabled = !configBusy && isGameDisabled(game.id)
  const playable = !configBusy && game.status === 'live' && game.supports?.includes(selectedMode) && !gameDisabled

  const href = selectedMode === 'battle'
    ? `/game/battle/${game.id}`
    : `/game/${game.id}`

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        aria-label={t('games.modal.close')}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
        type="button"
      />

      <div
        role="dialog"
        aria-modal="true"
        className="relative z-[61] w-full max-w-xl overflow-hidden rounded-3xl border border-neutral-200/70 bg-white/95 shadow-2xl backdrop-blur dark:border-neutral-800/70 dark:bg-slate-950/90"
      >
        <div className="absolute -top-28 right-0 h-48 w-48 rounded-full bg-gradient-to-br from-violet-500/40 to-indigo-500/40 blur-3xl" aria-hidden="true" />

        <div className="relative flex flex-col gap-5 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-violet-500">
                {t('games.page.headerAccent')}
              </span>
              <h2 className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">{localizedName}</h2>
            </div>
            {game.status === 'coming_soon' && (
              <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black shadow">
                {t('games.modal.comingSoon')}
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-200/70 shadow-sm dark:border-neutral-800/70">
            <img
              src={`/cards/${game.id}.png`}
              alt={`${localizedName} cover`}
              className="h-48 w-full object-cover"
              draggable={false}
            />
          </div>

          {localizedDescription && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{localizedDescription}</p>
          )}

          <div className="grid gap-4 rounded-2xl border border-neutral-200/60 bg-neutral-50/80 p-4 dark:border-neutral-800/60 dark:bg-neutral-900/60">
            <div className="flex items-center justify-between text-sm font-medium text-neutral-700 dark:text-neutral-200">
              <span>{t('games.modal.minStake')}</span>
              <span className="text-base font-semibold text-neutral-900 dark:text-neutral-50">{game.minBet}</span>
            </div>

            {hasBothModes ? (
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  {t('games.modal.selectMode')}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedMode('solo')}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:focus-visible:ring-violet-500 ${
                      selectedMode === 'solo'
                        ? 'border-violet-500 bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow'
                        : 'border-neutral-200 bg-white/90 text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-300 dark:hover:text-white'
                    }`}
                    type="button"
                    aria-pressed={selectedMode === 'solo'}
                  >
                    🎮 {t('games.modal.solo')}
                  </button>
                  <button
                    onClick={() => setSelectedMode('battle')}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 dark:focus-visible:ring-violet-500 ${
                      selectedMode === 'battle'
                        ? 'border-violet-500 bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow'
                        : 'border-neutral-200 bg-white/90 text-neutral-600 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-300 dark:hover:text-white'
                    }`}
                    type="button"
                    aria-pressed={selectedMode === 'battle'}
                  >
                    ⚔️ {t('games.modal.battle')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between text-sm text-neutral-600 dark:text-neutral-300">
                <span>{t('games.modal.mode')}</span>
                <span className="font-medium">
                  {game.supports?.map(value => (value === 'battle' ? t('games.modal.battle') : t('games.modal.solo'))).join(', ')}
                </span>
              </div>
            )}
          </div>

          {gameDisabled && (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-800/60 dark:bg-red-900/20 dark:text-red-200">
              🚫 Game đang bị tạm khóa, vui lòng đợi...
            </div>
          )}

          {configBusy && (
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900/40 dark:text-neutral-300">
              ⏳ Đang kiểm tra trạng thái game...
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <button
              className="rounded-2xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
              onClick={() => onOpenChange?.(false)}
              type="button"
            >
              {t('games.modal.close')}
            </button>

            {playable ? (
              <Link
                href={href}
                className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow transition hover:opacity-95"
                onClick={() => onOpenChange?.(false)}
              >
                {t('games.modal.play')}
              </Link>
            ) : (
              <button
                className="cursor-not-allowed rounded-2xl border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-400 dark:border-neutral-700 dark:text-neutral-500"
                disabled
                title={configBusy ? 'Đang kiểm tra trạng thái game' : gameDisabled ? 'Game đang bị tạm khóa' : t('games.modal.notAvailable')}
                type="button"
              >
                {configBusy ? '⏳ Kiểm tra...' : gameDisabled ? '🚫 Tạm khóa' : t('games.modal.notAvailable')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
