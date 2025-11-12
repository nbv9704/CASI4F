'use client'

import LoadingState from '@/components/LoadingState'
import { useLocale } from '@/context/LocaleContext'

export default function GameHubLoading() {
  const { t } = useLocale()
  const messageKey = 'games.page.loading'
  const message = t(messageKey)
  const fallback = typeof message === 'string' && message !== messageKey
    ? message
    : 'Loading games…'

  return <LoadingState message={fallback} />
}
