// client/src/hooks/useGameConfig.js
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SOCKET_EVENTS } from '@/constants/socketEvents'
import { useUser } from '@/context/UserContext'
import useSocket from './useSocket'

export function useGameConfig() {
  const [configs, setConfigs] = useState({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const isMountedRef = useRef(false)
  const { user } = useUser()

  const fetchConfigs = useCallback(async ({ silent = false, timeoutMs = 8000 } = {}) => {
  if (!isMountedRef.current) return null
    if (silent) setRefreshing(true)
    else setLoading(true)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, timeoutMs)

    try {
      const response = await fetch('/api/game/configs', {
        cache: 'no-store',
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`Failed to load configs (${response.status})`)
      const data = await response.json()
      const configMap = {}
      data.configs?.forEach((cfg) => {
        if (cfg?.gameId) configMap[cfg.gameId] = cfg
      })
      if (isMountedRef.current) setConfigs(configMap)
      return configMap
    } catch (error) {
      if (error?.name === 'AbortError') {
        console.warn('Timed out while fetching game configs')
      } else {
        console.error('Failed to fetch game configs:', error)
      }
      return null
    } finally {
      clearTimeout(timeoutId)
      if (!isMountedRef.current) return
      if (silent) setRefreshing(false)
      else setLoading(false)
    }
  }, [])

  const applyConfigs = useCallback((list) => {
    if (!Array.isArray(list) || list.length === 0) return
    setConfigs((prev) => {
      const next = { ...prev }
      list.forEach((cfg) => {
        if (!cfg?.gameId) return
        next[cfg.gameId] = {
          ...next[cfg.gameId],
          ...cfg,
        }
      })
      return next
    })
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    fetchConfigs()
    return () => {
      isMountedRef.current = false
    }
  }, [fetchConfigs])

  useSocket(user?.id, {
    events: {
      [SOCKET_EVENTS.GAME.CONFIG_UPDATED]: (payload) => {
        if (payload?.configs?.length) {
          applyConfigs(payload.configs)
        }
        fetchConfigs({ silent: true })
      },
    },
  })

  const isGameDisabled = useCallback(
    (gameId) => configs[gameId]?.enabled === false,
    [configs]
  )

  const checkGameAccess = useCallback(
    (gameId, onDisabled) => {
      if (isGameDisabled(gameId)) {
        onDisabled?.()
        return false
      }
      return true
    },
    [isGameDisabled]
  )

  const refresh = useCallback(() => fetchConfigs({ silent: true }), [fetchConfigs])

  return useMemo(() => ({
    configs,
    loading,
    refreshing,
    isGameDisabled,
    checkGameAccess,
    refresh,
  }), [configs, loading, refreshing, isGameDisabled, checkGameAccess, refresh])
}
