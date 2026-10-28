import { useEffect, useSyncExternalStore } from 'react'
import { api } from '../services/apiClient.js'
import { tr } from '../i18n/index.js'

/** Foydalanuvchining backenddagi bronlari — profil bo‘limlari uchun umumiy store */
let state = { userId: null, items: [], loaded: false }
const listeners = new Set()
let inflight = null

function emit(next) {
  state = next
  listeners.forEach((listener) => listener())
}

const pad = (n) => String(n).padStart(2, '0')

/** API qatori → profil UI ko‘rinishi */
function toRow(b) {
  return {
    id: b.id,
    code: b.code,
    title: b.serviceTitle,
    companyId: b.complexId,
    place: b.complexName,
    date: b.date ?? b.createdAt.slice(0, 10),
    hour: b.hour,
    time: b.hour == null ? tr('Vaqt kelishiladi') : `${pad(b.hour)}:00–${pad(b.hour + 1)}:00`,
    // Ariza (vaqtsiz) bron — sana yo‘q, faol bo‘lsa bekor qilish mumkin
    flexible: b.date == null,
    price: b.priceLabel,
    status: b.status,
  }
}

export function loadBookings(userId, { force = false } = {}) {
  if (!userId) {
    emit({ userId: null, items: [], loaded: false })
    return Promise.resolve()
  }
  if (!force && state.userId === userId && (state.loaded || inflight)) return inflight ?? Promise.resolve()
  inflight = api('/bookings')
    .then((data) => emit({ userId, items: (data.bookings ?? []).map(toRow), loaded: true }))
    .catch(() => emit({ ...state, userId, loaded: true }))
    .finally(() => {
      inflight = null
    })
  return inflight
}

export async function cancelBooking(id) {
  await api(`/bookings/${id}`, { method: 'PATCH', body: { status: 'cancelled' } })
  emit({ ...state, items: state.items.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)) })
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useBookings(userId) {
  const snapshot = useSyncExternalStore(subscribe, () => state)
  useEffect(() => {
    loadBookings(userId)
  }, [userId])
  return snapshot.userId === userId ? snapshot : { userId, items: [], loaded: false }
}
