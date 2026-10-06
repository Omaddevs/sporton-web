import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useAuth } from '../context/auth.js'
import { defaultProfile } from '../data/profile.js'
import { useBookings } from './useBookings.js'

const PREFIX = 'sporton-profile:'
const stores = new Map()

/** Kirgan foydalanuvchi uchun demo profilni uning ismi va raqami bilan boshlaymiz */
function seedFor(user) {
  if (!user) return defaultProfile
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
  return {
    ...defaultProfile,
    name: name || defaultProfile.name,
    phone: user.phone || '',
    email: user.email || '',
    avatar: user.avatar || '',
    verified: false,
    bookings: [],
  }
}

function read(key, seed) {
  try {
    const raw = window.localStorage.getItem(key)
    // Yangi maydonlar qo‘shilganda eski saqlangan nusxa ham to‘liq bo‘lishi uchun seed bilan birlashtiramiz
    return raw ? { ...seed, ...JSON.parse(raw) } : seed
  } catch {
    return seed
  }
}

function getStore(key, user) {
  let store = stores.get(key)
  if (store) return store

  const seed = seedFor(user)
  const listeners = new Set()
  let state = read(key, seed)

  store = {
    get: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    set(updater) {
      state = typeof updater === 'function' ? updater(state) : updater
      try {
        window.localStorage.setItem(key, JSON.stringify(state))
      } catch {
        /* to‘lgan xotira — o‘zgarish faqat sessiya davomida saqlanadi */
      }
      listeners.forEach((listener) => listener())
    },
    reset() {
      try {
        window.localStorage.removeItem(key)
      } catch {
        /* ignore */
      }
      stores.delete(key)
    },
  }
  stores.set(key, store)
  return store
}

export function useProfile() {
  const { user } = useAuth()
  const store = getStore(`${PREFIX}${user?.id ?? 'demo'}`, user)
  const stored = useSyncExternalStore(store.subscribe, store.get)
  // Kirgan foydalanuvchi uchun bronlar — backenddan (demo ro‘yxat emas)
  const bookings = useBookings(user?.id ?? null)
  const profile = useMemo(
    () => (user ? { ...stored, bookings: bookings.items } : stored),
    [user, stored, bookings.items],
  )

  const update = useCallback(
    (patch) => store.set((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) })),
    [store],
  )

  return { profile, update, reset: store.reset }
}

export const newId = (prefix) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
