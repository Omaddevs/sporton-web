import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/auth.js'
import * as authApi from '../services/authApi.js'
import { api } from '../services/apiClient.js'
import { useBookings } from './useBookings.js'
import { useSavedList } from './useSaved.js'

/**
 * Profil — faqat serverdagi haqiqiy ma’lumot: hisob (ism, raqam, email, shahar, bio, sport turlari,
 * rasm), bronlar va statistika. update() o‘zgarishni serverga yozadi va sessiya nusxasini yangilaydi.
 */
export function useProfile() {
  const { user, refresh } = useAuth()
  const bookings = useBookings(user?.id ?? null)
  const savedCount = useSavedList('jobs').length + useSavedList('companies').length + useSavedList('courses').length
  const [stats, setStats] = useState(null)

  useEffect(() => {
    if (!user) return undefined
    const controller = new AbortController()
    api('/me/stats', { signal: controller.signal })
      .then((data) => setStats(data.stats))
      .catch(() => null)
    return () => controller.abort()
  }, [user, bookings.items.length])

  const profile = useMemo(
    () =>
      user && {
        ...user,
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
        bookings: bookings.items,
        stats: {
          bookings: stats?.bookings ?? bookings.items.length,
          completed: stats?.completed ?? bookings.items.filter((b) => b.status === 'completed').length,
          favorites: savedCount,
          reviews: stats?.reviews ?? 0,
        },
      },
    [user, bookings.items, stats, savedCount],
  )

  const update = useCallback(
    async (patch) => {
      const next = await authApi.updateProfile(patch)
      refresh({ ...user, ...next })
      return next
    },
    [refresh, user],
  )

  return { profile, update, bookingsLoaded: bookings.loaded }
}
