import { useCallback, useSyncExternalStore } from 'react'

/**
 * Saqlanganlar (sevimlilar): xizmatlar, majmualar, kurslar. Shu brauzerda saqlanadi —
 * barcha sahifalardagi «saqlash» tugmalari va /saqlanganlar sahifasi bitta manbadan o‘qiydi.
 */
const STORAGE_KEY = 'sporton-saved'
const KINDS = ['jobs', 'companies', 'courses']
const listeners = new Set()

function read() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    return Object.fromEntries(KINDS.map((k) => [k, Array.isArray(raw?.[k]) ? raw[k] : []]))
  } catch {
    return { jobs: [], companies: [], courses: [] }
  }
}

let state = typeof window === 'undefined' ? { jobs: [], companies: [], courses: [] } : read()

function write(next) {
  state = next
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* xotira to‘lgan — faqat sessiya davomida */
  }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Boshqa vkladkada o‘zgarsa — yangilaymiz
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      state = read()
      listeners.forEach((listener) => listener())
    }
  })
}

export function toggleSaved(kind, id) {
  const list = state[kind]
  write({ ...state, [kind]: list.includes(id) ? list.filter((x) => x !== id) : [id, ...list] })
}

export function useSavedList(kind) {
  return useSyncExternalStore(subscribe, () => state[kind], () => [])
}

export function useSaved(kind, id) {
  const list = useSavedList(kind)
  const toggle = useCallback(() => toggleSaved(kind, id), [kind, id])
  return [list.includes(id), toggle]
}
