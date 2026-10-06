import { api, API_URL } from './apiClient.js'

/**
 * Bildirishnomalar store’i: ro‘yxat backenddan, yangilari real vaqtda (SSE). SSE uzilsa —
 * har 60 soniyada so‘rov (polling). Barcha komponentlar (qo‘ng‘iroqcha, profil, toast) shu
 * yagona manbadan o‘qiydi.
 */
const PAGE = 30
const initial = { userId: null, items: [], unread: 0, loaded: false, loading: false, hasMore: false, error: '' }
let state = initial
const listeners = new Set()
const arrivals = new Set()
let source = null
let pollTimer = null

function set(patch) {
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) }
  listeners.forEach((l) => l())
}

export const getState = () => state
export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Yangi bildirishnoma kelganda (toast uchun) */
export function onArrival(listener) {
  arrivals.add(listener)
  return () => arrivals.delete(listener)
}

async function fetchFirstPage() {
  const userId = state.userId
  set({ loading: true, error: '' })
  try {
    const data = await api(`/notifications?limit=${PAGE}`)
    if (state.userId !== userId) return
    set({ items: data.items, unread: data.unread, hasMore: data.hasMore, loaded: true, loading: false })
  } catch (error) {
    if (state.userId === userId) set({ loading: false, loaded: true, error: error.message })
  }
}

function startPolling() {
  if (pollTimer) return
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible') fetchFirstPage()
  }, 60_000)
}

function stopPolling() {
  clearInterval(pollTimer)
  pollTimer = null
}

function connect() {
  if (typeof EventSource === 'undefined') return startPolling()
  source?.close()
  source = new EventSource(`${API_URL}/api/v1/notifications/stream`, { withCredentials: true })
  source.addEventListener('open', () => stopPolling())
  source.addEventListener('notification', (event) => {
    const data = JSON.parse(event.data)
    const item = data.notification
    if (state.items.some((n) => n.id === item.id)) return
    set((s) => ({ items: [item, ...s.items], unread: data.unread >= 0 ? data.unread : s.unread + 1 }))
    arrivals.forEach((l) => l(item))
  })
  source.addEventListener('unread', (event) => {
    const { unread } = JSON.parse(event.data)
    if (unread !== state.unread) {
      set({ unread })
      // Boshqa vkladkada o‘qilgan/o‘chirilgan bo‘lsa ro‘yxatni ham yangilaymiz
      fetchFirstPage()
    }
  })
  source.addEventListener('error', () => {
    // Brauzer o‘zi qayta ulanadi; ulanish butunlay yopilsa — polling
    if (source?.readyState === EventSource.CLOSED) startPolling()
  })
}

function onFocus() {
  if (state.userId && document.visibilityState === 'visible') fetchFirstPage()
}

export function startNotifications(userId) {
  if (state.userId === userId) return
  stopNotifications()
  if (!userId) return
  set({ ...initial, userId })
  fetchFirstPage()
  connect()
  document.addEventListener('visibilitychange', onFocus)
}

export function stopNotifications() {
  source?.close()
  source = null
  stopPolling()
  document.removeEventListener('visibilitychange', onFocus)
  if (state.userId) set(initial)
}

export async function loadMore() {
  if (!state.hasMore || state.loading) return
  const last = state.items[state.items.length - 1]
  set({ loading: true })
  try {
    const data = await api(`/notifications?limit=${PAGE}&before=${encodeURIComponent(last.createdAt)}`)
    set((s) => ({ items: [...s.items, ...data.items.filter((n) => !s.items.some((x) => x.id === n.id))], hasMore: data.hasMore, loading: false }))
  } catch {
    set({ loading: false })
  }
}

async function mutate(method, body, optimistic) {
  const prev = state
  set(optimistic)
  try {
    const { unread } = await api('/notifications', { method, body })
    set({ unread })
  } catch (error) {
    set({ items: prev.items, unread: prev.unread })
    throw error
  }
}

export const markRead = (id) => {
  const item = state.items.find((n) => n.id === id)
  if (!item || item.read) return Promise.resolve()
  return mutate('PATCH', { ids: [id] }, (s) => ({
    items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    unread: Math.max(0, s.unread - 1),
  })).catch(() => null)
}

export const markAllRead = () =>
  mutate('PATCH', { all: true }, (s) => ({ items: s.items.map((n) => ({ ...n, read: true })), unread: 0 })).catch(() => null)

export const remove = (id) =>
  mutate('DELETE', { ids: [id] }, (s) => {
    const item = s.items.find((n) => n.id === id)
    return { items: s.items.filter((n) => n.id !== id), unread: item && !item.read ? Math.max(0, s.unread - 1) : s.unread }
  }).catch(() => null)

export const clearAll = () => mutate('DELETE', { all: true }, () => ({ items: [], unread: 0, hasMore: false })).catch(() => null)
