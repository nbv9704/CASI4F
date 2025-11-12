// client/src/context/UserContext.jsx
'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import useApi from '../hooks/useApi'
import { useRouter } from 'next/navigation'
import { getExpToNextLevel } from '../utils/level'
import useSocket from '../hooks/useSocket'

const defaultUserContext = {
  user: null,
  balance: 0,
  bank: 0,
  fetchUser: async () => {},
  logout: () => {},
  updateBalance: () => {},
  updateBank: () => {},
  updateProgress: () => {},
}

const UserContext = createContext(defaultUserContext)

export function UserProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [balance, setBalance] = useState(0)
  const [bank, setBank]       = useState(0)
  const { get }               = useApi()
  const router                = useRouter()

  const fetchUser = useCallback(async () => {
    try {
      const u = await get('/user/me')
      const level = Number.isFinite(u.level) && u.level > 0 ? u.level : 1
      const experience = Number.isFinite(u.experience) && u.experience >= 0 ? u.experience : 0
      const nextLevelExpRaw = Number.isFinite(u.nextLevelExp) && u.nextLevelExp > 0
        ? u.nextLevelExp
        : getExpToNextLevel(level)
      const timeZone = typeof u.timeZone === 'string' && u.timeZone
        ? u.timeZone
        : 'Asia/Ho_Chi_Minh'

      const statusStates = ['online', 'offline', 'busy', 'idle']
      const statusState = statusStates.includes(u.statusState) ? u.statusState : 'online'
      const rawStatusMessage = typeof u.statusMessage === 'string' ? u.statusMessage : ''
      const expiresAtRaw = u.statusMessageExpiresAt ? new Date(u.statusMessageExpiresAt) : null
      const now = new Date()
      const statusMessageActive = rawStatusMessage && (!expiresAtRaw || expiresAtRaw > now)
        ? rawStatusMessage
        : ''
      const statusMessageExpiresAt = statusMessageActive && expiresAtRaw && !Number.isNaN(expiresAtRaw.getTime())
        ? expiresAtRaw.toISOString()
        : null

      setUser({
        id: u._id,
        username: u.username,
        email: u.email,
        avatar: u.avatar || '',
        dateOfBirth: u.dateOfBirth || null,
        role: u.role || 'user', // ⬅️ thêm role để phân quyền hiển thị Admin Health
        timeZone,
        level,
        experience,
        nextLevelExp: nextLevelExpRaw ?? null,
        statusState,
        statusMessage: statusMessageActive,
        statusMessageExpiresAt,
      })
      setBalance(u.balance)
      setBank(u.bank)
    } catch {
      setUser(null)
      setBalance(0)
      setBank(0)
    }
  }, [get])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    if (!user?.statusMessage || !user.statusMessageExpiresAt) return undefined

    const expiresAtMs = new Date(user.statusMessageExpiresAt).getTime()
    if (!Number.isFinite(expiresAtMs)) return undefined

    const delay = expiresAtMs - Date.now()
    if (delay <= 0) {
      setUser(prev => (prev ? { ...prev, statusMessage: '', statusMessageExpiresAt: null } : prev))
      return undefined
    }

    const timeout = setTimeout(() => {
      setUser(prev => {
        if (!prev) return prev
        if (prev.statusMessageExpiresAt !== user.statusMessageExpiresAt) return prev
        return { ...prev, statusMessage: '', statusMessageExpiresAt: null }
      })
    }, delay)

    return () => clearTimeout(timeout)
  }, [user?.statusMessage, user?.statusMessageExpiresAt])

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      setUser(null)
      setBalance(0)
      setBank(0)
      router.push('/login')
    }
  }, [router])

  const updateBalance = useCallback((newBalance) => setBalance(newBalance), [])
  const updateBank    = useCallback((newBank) => setBank(newBank), [])
  const updateProgress = useCallback(({ level, experience, nextLevelExp } = {}) => {
    setUser(prev => {
      if (!prev) return prev
      const safeLevel = Number.isFinite(level) && level > 0 ? level : (prev.level || 1)
      const safeExperience = Number.isFinite(experience) && experience >= 0 ? experience : (prev.experience || 0)
      const resolvedNext = Number.isFinite(nextLevelExp) && nextLevelExp > 0
        ? nextLevelExp
        : getExpToNextLevel(safeLevel)
      const normalizedNext = resolvedNext ?? null
      const normalizedExp = normalizedNext ? safeExperience : 0

      if (
        prev.level === safeLevel &&
        prev.experience === normalizedExp &&
        prev.nextLevelExp === normalizedNext
      ) {
        return prev
      }
      return {
        ...prev,
        level: safeLevel,
        experience: normalizedExp,
        nextLevelExp: normalizedNext
      }
    })
  }, [])

  const handleNotification = useCallback((notif) => {
    if (!notif || !notif.metadata) return

    const { type, metadata } = notif
    const normalize = (value) => {
      if (value == null) return null
      const numeric = typeof value === 'string' ? Number(value) : value
      return Number.isFinite(numeric) ? numeric : null
    }

    const walletBalance = normalize(metadata.walletBalance)
    const bankBalance = normalize(metadata.bankBalance)

    if (
      type === 'deposit' ||
      type === 'withdraw' ||
      type === 'transfer_sent' ||
      type === 'transfer_received'
    ) {
      if (walletBalance !== null) updateBalance(walletBalance)
      if (bankBalance !== null) updateBank(bankBalance)
    }
  }, [updateBalance, updateBank])

  useSocket(user?.id, handleNotification)

  const contextValue = useMemo(() => ({
    user,
    balance,
    bank,
    fetchUser,
    logout,
    updateBalance,
    updateBank,
    updateProgress,
  }), [user, balance, bank, fetchUser, logout, updateBalance, updateBank, updateProgress])

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext) || defaultUserContext
}
