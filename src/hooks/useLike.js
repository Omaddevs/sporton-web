import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/auth.js'
import { api } from '../services/apiClient.js'
import { useAuthGate } from './useAuthGate.jsx'

/**
 * Layk (majmua, yangilik): soni va holati serverdan. Bosish — optimistik, server rad etsa qaytariladi.
 * Mehmonga ro‘yxatdan o‘tish oynasi ko‘rsatiladi.
 */
export function useLike(kind, id) {
  const { user } = useAuth()
  const { guard } = useAuthGate()
  const [state, setState] = useState({ liked: false, count: 0 })
  const pending = useRef(false)

  useEffect(() => {
    if (!id) return undefined
    const controller = new AbortController()
    api(`/likes?kind=${kind}&id=${encodeURIComponent(id)}`, { signal: controller.signal })
      .then((data) => setState({ liked: Boolean(data.liked), count: data.count ?? 0 }))
      .catch(() => null)
    return () => controller.abort()
  }, [kind, id, user?.id])

  const toggle = useCallback(async () => {
    if (!guard('like') || pending.current) return
    pending.current = true
    const prev = state
    const liked = !prev.liked
    setState({ liked, count: Math.max(0, prev.count + (liked ? 1 : -1)) })
    try {
      const data = await api('/likes', { method: 'PUT', body: { kind, id: String(id), liked } })
      setState({ liked: Boolean(data.liked), count: data.count ?? 0 })
    } catch {
      setState(prev)
    } finally {
      pending.current = false
    }
  }, [guard, kind, id, state])

  return { ...state, toggle }
}
