// client/src/context/UserContext.jsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import useApi from '../hooks/useApi'
import { useRouter } from 'next/navigation'
import { getExpToNextLevel } from '../utils/level'

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

  const fetchUser = async () => {
    try {
      const u = await get('/user/me')
      const level = Number.isFinite(u.level) && u.level > 0 ? u.level : 1
      const experience = Number.isFinite(u.experience) && u.experience >= 0 ? u.experience : 0
      const nextLevelExpRaw = Number.isFinite(u.nextLevelExp) && u.nextLevelExp > 0
        ? u.nextLevelExp
        : getExpToNextLevel(level)

      setUser({
        id: u._id,
        username: u.username,
        email: u.email,
        avatar: u.avatar || '',
        dateOfBirth: u.dateOfBirth || null,
        role: u.role || 'user', // ⬅️ thêm role để phân quyền hiển thị Admin Health
        level,
        experience,
        nextLevelExp: nextLevelExpRaw ?? null
      })
      setBalance(u.balance)
      setBank(u.bank)
    } catch {
      setUser(null)
      setBalance(0)
      setBank(0)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      setUser(null)
      setBalance(0)
      setBank(0)
      router.push('/login')
    }
  }

  const updateBalance = (newBalance) => setBalance(newBalance)
  const updateBank    = (newBank)     => setBank(newBank)
  const updateProgress = ({ level, experience, nextLevelExp } = {}) => {
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
  }

  return (
    <UserContext.Provider value={{
      user, balance, bank,
      fetchUser, logout,
      updateBalance, updateBank,
      updateProgress
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext) || defaultUserContext
}
