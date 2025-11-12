// client/src/app/notifications/page.js
'use client'

import RequireAuth from '@/components/RequireAuth'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BellRing, CheckCircle2, Inbox, Loader2, RefreshCw } from 'lucide-react'
import LoadingState from '@/components/LoadingState'
import { useLocale } from '../../context/LocaleContext'
import { useUser } from '../../context/UserContext'
import useApi from '../../hooks/useApi'

const FILTER_KEYS = ['all', 'deposit', 'withdraw', 'transfer_sent', 'transfer_received']

function NotificationsPage() {
  const { user } = useUser()
  const { get, patch } = useApi()
  const { t, locale } = useLocale()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [lastUpdated, setLastUpdated] = useState(null)
  const pageSize = 10

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale || 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale]
  )

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await get(`/notification?limit=100`)
      const list = Array.isArray(res?.notifications) ? res.notifications : []
      setNotifications(list)
      setLastUpdated(new Date())
    } catch {
      setNotifications([])
    } finally {
      setLoading(false)
      setInitialized(true)
    }
  }, [get, user])

  useEffect(() => {
    if (user) {
      fetchNotifications()
    } else {
      setNotifications([])
      setInitialized(false)
    }
  }, [user, fetchNotifications])

  const markAsRead = useCallback(
    async (id) => {
      if (!id) return
      try {
        await patch(`/notification/${id}/read`)
      } catch {
        /* ignore patch error to keep UI responsive */
      } finally {
        setNotifications((ns) => ns.map((n) => (n._id === id ? { ...n, read: true } : n)))
      }
    },
    [patch]
  )

  const markAllAsRead = useCallback(async () => {
    const unread = notifications.filter((n) => !n?.read)
    if (unread.length === 0) return
    await Promise.all(
      unread.map((n) => patch(`/notification/${n._id}/read`).catch(() => null))
    )
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [notifications, patch])

  const filterOptions = useMemo(
    () =>
      FILTER_KEYS.map((key) => ({
        key,
        label: t(`notifications.filters.${key}`),
      })),
    [t]
  )

  const filteredNotifications = useMemo(
    () =>
      notifications.filter((n) => (filter === 'all' ? true : n?.type === filter)),
    [notifications, filter]
  )

  const totalPages = Math.max(1, Math.ceil(filteredNotifications.length / pageSize))
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredNotifications.slice(start, start + pageSize)
  }, [filteredNotifications, page, pageSize])

  useEffect(() => {
    setPage(1)
  }, [filter])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const unreadCount = useMemo(
    () => notifications.reduce((acc, n) => (n?.read ? acc : acc + 1), 0),
    [notifications]
  )

  const summaryMetrics = useMemo(
    () => [
      {
        id: 'total-notifications',
        label: t('notifications.filters.all'),
        value: notifications.length,
      },
      {
        id: 'unread-notifications',
        label: t('notifications.list.unreadBadge'),
        value: unreadCount,
      },
      {
        id: `filter-${filter}`,
        label: t(`notifications.filters.${filter}`),
        value: filteredNotifications.length,
      },
    ],
    [filter, filteredNotifications.length, notifications.length, t, unreadCount]
  )

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6 py-16 text-white">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/10 p-10 text-center backdrop-blur">
          <h1 className="text-3xl font-semibold">{t('notifications.page.headerAccent')}</h1>
          <p className="mt-3 text-sm text-white/70">{t('notifications.page.loginPrompt')}</p>
        </div>
      </div>
    )
  }

  if (!initialized && loading) {
    return <LoadingState message={t('loading.notifications')} />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.25),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1fr_1.2fr]">
          <section className="flex flex-col justify-between gap-10 rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-300/40 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-indigo-200">
                <BellRing className="h-4 w-4" />
                {t('notifications.page.headerAccent')}
              </span>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold md:text-5xl">{t('notifications.page.title')}</h1>
                <p className="max-w-md text-sm text-indigo-100/80 md:text-base">
                  {t('notifications.page.subtitle')}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {summaryMetrics.map((metric) => (
                <div
                  key={metric.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 text-sm shadow-inner shadow-black/30"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] leading-4 text-indigo-200/80">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold" suppressHydrationWarning>
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            {lastUpdated && (
              <p className="text-xs text-white/60">
                {t('notifications.page.lastUpdated', {
                  time: dateFormatter.format(lastUpdated),
                })}
              </p>
            )}
          </section>

          <section className="flex flex-col rounded-3xl border border-white/10 bg-slate-950/85 p-8 shadow-2xl shadow-indigo-500/20 backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">
                  {t('notifications.page.listTitle')}
                </h2>
                <p className="text-sm text-white/60">
                  {t('notifications.page.markReadHint')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={notifications.length === 0 || unreadCount === 0}
                  className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100 transition hover:border-indigo-300/60 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {t('notifications.page.markAll')}
                </button>
                <button
                  type="button"
                  onClick={fetchNotifications}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl border border-indigo-400/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100 transition hover:border-indigo-300/60 hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('notifications.page.refreshing')}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>{t('notifications.page.refresh')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {filterOptions.map(({ key, label }) => {
                const active = key === filter
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                      active
                        ? 'border-indigo-300 bg-indigo-500/30 text-white shadow-lg shadow-indigo-500/30'
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-indigo-300/40 hover:text-white'
                    }`}
                  >
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex-1 overflow-hidden">
              {pageItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-white/60">
                  <Inbox className="h-10 w-10 text-white/40" />
                  <p>{t('notifications.page.empty')}</p>
                </div>
              ) : (
                <ul className="flex flex-col gap-3 overflow-y-auto pr-1">
                  {pageItems.map((n) => {
                    const createdAt = n?.createdAt ? new Date(n.createdAt) : null
                    const typeLabel = t(`notifications.filters.${n?.type || 'all'}`)
                    return (
                      <li key={n._id}>
                        <button
                          type="button"
                          onClick={() => markAsRead(n._id)}
                          className={`group w-full rounded-2xl border px-5 py-4 text-left transition hover:border-indigo-300/60 hover:bg-indigo-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                            n.read ? 'border-white/10 bg-white/5' : 'border-indigo-400/40 bg-indigo-500/10'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70">
                                  {typeLabel}
                                </span>
                                {!n.read && (
                                  <span className="rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-2 py-1 text-[11px] font-semibold text-white shadow">
                                    {t('notifications.list.unreadBadge')}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-white/90">{n.message}</p>
                            </div>
                            <CheckCircle2
                              className={`h-5 w-5 flex-shrink-0 transition ${
                                n.read ? 'text-emerald-400' : 'text-white/30 group-hover:text-emerald-300'
                              }`}
                            />
                          </div>
                          {createdAt && (
                            <div className="mt-3 text-xs text-white/50">
                              {t('notifications.list.timestamp', {
                                time: dateFormatter.format(createdAt),
                              })}
                            </div>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {filteredNotifications.length > pageSize && (
              <div className="mt-6 flex items-center justify-between text-sm text-white/70">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 transition hover:border-indigo-300/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('notifications.pagination.prev')}
                </button>
                <span>
                  {t('notifications.pagination.label', { page, total: totalPages })}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 transition hover:border-indigo-300/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('notifications.pagination.next')}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default RequireAuth(NotificationsPage)