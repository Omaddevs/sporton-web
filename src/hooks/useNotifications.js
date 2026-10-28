import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { useAuth } from '../context/auth.js'
import * as store from '../services/notifications.js'
import { tr } from '../i18n/index.js'

/** «5 daqiqa oldin», «Kecha», «3 kun oldin» */
export function formatAgo(date, now = Date.now()) {
  const ms = now - new Date(date).getTime()
  const minutes = Math.round(ms / 60000)
  if (minutes < 1) return tr('Hozirgina')
  if (minutes < 60) return tr('{n} daqiqa oldin', { n: minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 24) return tr('{n} soat oldin', { n: hours })
  const days = Math.round(hours / 24)
  if (days === 1) return tr('Kecha')
  if (days < 7) return tr('{n} kun oldin', { n: days })
  return new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Bildirishnomalar (backenddan, real vaqtda). Qo‘ng‘iroqcha, profil va toast bitta store’dan
 * o‘qiydi — hisoblagichlar hamma joyda bir xil.
 */
export function useNotifications() {
  const { user } = useAuth()
  const state = useSyncExternalStore(store.subscribe, store.getState)

  useEffect(() => {
    store.startNotifications(user?.id ?? null)
  }, [user?.id])

  const items = useMemo(
    () =>
      state.items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        text: n.body,
        to: n.link,
        unread: !n.read,
        createdAt: n.createdAt,
      })),
    [state.items],
  )

  return {
    signedIn: Boolean(user),
    items,
    unreadCount: state.unread,
    loaded: state.loaded,
    loading: state.loading,
    hasMore: state.hasMore,
    error: state.error,
    loadMore: store.loadMore,
    markRead: store.markRead,
    markAllRead: store.markAllRead,
    remove: store.remove,
    clearAll: store.clearAll,
  }
}
