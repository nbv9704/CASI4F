import { useCallback, useMemo } from 'react'
import useApi from './useApi'

export default function useFriendsApi() {
  const api = useApi()

  const buildQuery = useCallback((params = {}) => {
    const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== null)
    if (!entries.length) return ''
    const search = new URLSearchParams()
    entries.forEach(([key, value]) => {
      search.append(key, String(value))
    })
    return `?${search.toString()}`
  }, [])

  const fetchFriends = useCallback(() => api.get('/social/friends'), [api])
  const sendRequest = useCallback((payload) => api.post('/social/friends', payload), [api])
  const respondRequest = useCallback((friendshipId, action) => api.post(`/social/friends/${friendshipId}/respond`, { action }), [api])
  const removeFriend = useCallback((friendshipId) => api.del(`/social/friends/${friendshipId}`), [api])
  const fetchMessages = useCallback((friendId, params) => api.get(`/social/messages/${friendId}${buildQuery(params)}`), [api, buildQuery])
  const sendMessage = useCallback((friendId, body) => api.post(`/social/messages/${friendId}`, { body }), [api])

  return useMemo(() => ({
    fetchFriends,
    sendRequest,
    respondRequest,
    removeFriend,
    fetchMessages,
    sendMessage,
  }), [fetchFriends, sendRequest, respondRequest, removeFriend, fetchMessages, sendMessage])
}
