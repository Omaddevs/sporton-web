import { useCallback, useSyncExternalStore } from 'react'
import { api } from '../services/apiClient.js'
import { useAuthGate } from './useAuthGate.jsx'

/**
 * Saqlanganlar (sevimlilar): xizmatlar, majmualar, kurslar. Serverda saqlanadi — telefon va
 * kompyuterda bir xil, brauzer tozalansa ham yo‘qolmaydi. Saqlash uchun hisobga kirish kerak.
 * Komponentlar eski nomlardan foydalanadi (jobs/companies/courses) — serverda service/complex/course.
 */
const KIND_TO_SERVER = { jobs: 'service', companies: 'complex', courses: 'course' }
const KINDS = Object.keys(KIND_TO_SERVER)
const EMPTY = Object.freeze({ jobs: [], companies: [], courses: [] })
// Avval faqat brauzerda saqlangan ro‘yxat (eski versiya) — birinchi kirishda hisobga ko‘chiriladi
const LEGACY_KEY = 'sporton-saved'

let state = EMPTY
let currentUser = null
const listeners = new Set()

function emit(next) {
  state = next
  listeners.forEach((listener) => listener())
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function fromServer(favorites) {
  return {
    jobs: (favorites?.service ?? []).map((id) => (/^\d+$/.test(id) ? Number(id) : id)),
    companies: favorites?.complex ?? [],
    courses: favorites?.course ?? [],
  }
}

function readLegacy() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(LEGACY_KEY) ?? 'null')
    if (!raw) return []
    return KINDS.flatMap((k) => (Array.isArray(raw[k]) ? raw[k] : []).map((id) => ({ kind: KIND_TO_SERVER[k], id: String(id) })))
  } catch {
    return []
  }
}

/** AuthProvider foydalanuvchi o‘zgarganda chaqiradi: kirganda — serverdan yuklash, chiqqanda — tozalash */
export async function syncFavorites(userId) {
  currentUser = userId ?? null
  if (!userId) {
    emit(EMPTY)
    return
  }
  try {
    const legacy = readLegacy()
    const data = legacy.length
      ? await api('/me/favorites/import', { method: 'POST', body: { items: legacy.slice(0, 300) } })
      : await api('/me/favorites')
    if (legacy.length) {
      try {
        window.localStorage.removeItem(LEGACY_KEY)
      } catch {
        /* ignore */
      }
    }
    if (currentUser === userId) emit(fromServer(data.favorites))
  } catch {
    /* tarmoq xatosi — keyingi kirishda qayta uriniladi */
  }
}

/** Optimistik: darhol ko‘rinadi, server rad etsa — qaytariladi */
export async function toggleSaved(kind, id) {
  if (!currentUser) return
  const list = state[kind]
  const saved = !list.includes(id)
  emit({ ...state, [kind]: saved ? [id, ...list] : list.filter((x) => x !== id) })
  try {
    await api('/me/favorites', { method: 'PUT', body: { kind: KIND_TO_SERVER[kind], id: String(id), saved } })
  } catch {
    const now = state[kind]
    emit({ ...state, [kind]: saved ? now.filter((x) => x !== id) : [id, ...now] })
  }
}

export function useSavedList(kind) {
  return useSyncExternalStore(subscribe, () => state[kind], () => EMPTY[kind])
}

/** [saqlanganmi, toggle] — mehmonga ro‘yxatdan o‘tish oynasini ko‘rsatadi */
export function useSaved(kind, id) {
  const { guard } = useAuthGate()
  const list = useSavedList(kind)
  const toggle = useCallback(() => {
    if (guard('like')) toggleSaved(kind, id)
  }, [guard, kind, id])
  return [list.includes(id), toggle]
}
