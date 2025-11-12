'use client'

import LoadingState from '@/components/LoadingState'
import { useLocale } from '@/context/LocaleContext'
import { usePathname } from 'next/navigation'

const PATH_MESSAGE_MAP = [
  { pattern: /^\/?$/, key: 'loading.home', fallback: 'Loading home page…' },
  { pattern: /^\/rankings(\/|$)/, key: 'loading.rankings', fallback: 'Loading rankings…' },
  { pattern: /^\/rewards(\/|$)/, key: 'loading.rewards', fallback: 'Loading rewards…' },
  { pattern: /^\/game(\/|$)/, key: 'games.page.loading', fallback: 'Loading games…' },
]

export default function RootLoading() {
  const { t } = useLocale()
  const pathname = usePathname() || '/'

  const matched = PATH_MESSAGE_MAP.find(({ pattern }) => pattern.test(pathname))
  const messageKey = matched?.key ?? 'loading.appShell'
  const translated = t(messageKey)
  const fallback = matched?.fallback ?? 'Preparing your experience…'

  const message = typeof translated === 'string' && translated !== messageKey
    ? translated
    : fallback

  return <LoadingState message={message} />
}
