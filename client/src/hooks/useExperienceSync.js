// client/src/hooks/useExperienceSync.js
'use client'

import { useCallback } from 'react'
import { useUser } from '@/context/UserContext'

export default function useExperienceSync() {
  const { updateProgress, fetchUser } = useUser()

  return useCallback(
    (payload) => {
      const meta = payload?.experience
      if (meta && typeof meta === 'object') {
        updateProgress({
          level: meta.level,
          experience: meta.experience,
          nextLevelExp: meta.nextLevelExp,
        })
        return true
      }
      fetchUser()
      return false
    },
    [updateProgress, fetchUser],
  )
}
