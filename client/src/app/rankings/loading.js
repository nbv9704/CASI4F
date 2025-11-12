'use client'

import LoadingState from '@/components/LoadingState'
import { useLocale } from '@/context/LocaleContext'

export default function RankingsLoading() {
  const { t } = useLocale()
  const messageKey = 'home.rankings.loading'
  const message = t(messageKey)
  const fallback = typeof message === 'string' && message !== messageKey
    ? message
    : 'Loading leaderboard…'

  return <LoadingState message={fallback} />
}
