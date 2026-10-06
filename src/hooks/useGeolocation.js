import { useCallback, useEffect, useState } from 'react'

const isSupported =
  typeof window !== 'undefined' && window.isSecureContext && 'geolocation' in navigator

const CACHE_KEY = 'sporton-geo'
const CACHE_TTL = 10 * 60 * 1000

function readCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY))
    if (cached && Date.now() - cached.at < CACHE_TTL) return cached.position
  } catch {
    // sessionStorage yopiq bo'lishi mumkin — keshsiz davom etamiz
  }
  return null
}

function writeCache(position) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), position }))
  } catch {
    // e'tiborsiz
  }
}

/**
 * status: 'idle' | 'locating' | 'granted' | 'denied' | 'unavailable' | 'unsupported'
 * Ruxsat avval berilgan bo'lsa, joylashuv sahifa ochilganda avtomatik aniqlanadi.
 * Oxirgi joylashuv sessiya davomida keshlanadi — sahifa qayta ochilganda xarita darhol chiqadi.
 */
export function useGeolocation() {
  const [state, setState] = useState(() => ({
    status: isSupported ? 'idle' : 'unsupported',
    position: null,
  }))

  const request = useCallback(() => {
    if (!isSupported) return
    setState((prev) => (prev.position ? prev : { ...prev, status: 'locating' }))
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = { lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }
        writeCache(position)
        setState((prev) => {
          // Keshdagi nuqtadan ~150 m ichida bo'lsa, xarita qayta siljimasligi uchun eski koordinatani qoldiramiz
          const near =
            prev.position &&
            Math.abs(prev.position.lat - position.lat) < 0.0014 &&
            Math.abs(prev.position.lng - position.lng) < 0.0018
          return { status: 'granted', position: near ? { ...prev.position, accuracy: position.accuracy } : position }
        })
      },
      (error) =>
        setState((prev) => {
          // Keshdagi joylashuv bor bo'lsa, vaqtinchalik xato uni o'chirmasin
          if (prev.position && error.code !== error.PERMISSION_DENIED) return prev
          return { status: error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable', position: null }
        }),
      // Yuqori aniqlik (GPS) kompyuterlarda 10+ soniya kuttirardi; shahar ichidagi masofa uchun Wi‑Fi/IP aniqligi yetarli
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    )
  }, [])

  useEffect(() => {
    if (!isSupported || !navigator.permissions?.query) return undefined
    let cancelled = false
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((permission) => {
        if (cancelled) return
        if (permission.state === 'granted') {
          const cached = readCache()
          if (cached) setState({ status: 'granted', position: cached })
          request()
        } else if (permission.state === 'denied') {
          setState({ status: 'denied', position: null })
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [request])

  return { ...state, request }
}
