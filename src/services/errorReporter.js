import { API_URL } from './apiClient.js'

// Bir sessiyada ko‘pi bilan shuncha xabar; bir xil xato bir marta
const MAX_REPORTS = 10
const seen = new Set()

/** Brauzerdagi xatoni backendga yuboradi (admin → «Xatolar»). Hech qachon o‘zi xato tashlamaydi. */
export function reportError(error, extra = {}) {
  try {
    const message = String(error?.message ?? error ?? 'Noma’lum xato').slice(0, 1000)
    if (!message || seen.has(message) || seen.size >= MAX_REPORTS) return
    // Brauzer kengaytmalari va tarmoq uzilishlari — bizning xato emas
    if (/ResizeObserver loop|Script error\.?$|Failed to fetch|NetworkError|Load failed|chrome-extension:|moz-extension:/i.test(message)) return
    seen.add(message)
    const body = JSON.stringify({
      message,
      stack: String(error?.stack ?? extra.componentStack ?? '').slice(0, 8000) || undefined,
      url: window.location.href.slice(0, 1000),
    })
    const url = `${API_URL}/api/v1/client-errors`
    if (navigator.sendBeacon?.(url, new Blob([body], { type: 'application/json' }))) return
    fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body, keepalive: true, credentials: 'include' }).catch(() => null)
  } catch {
    /* monitoring sahifani buzmasin */
  }
}

/** Global ushlagichlar — main.jsx da bir marta */
export function installErrorReporter() {
  if (import.meta.env.DEV) return
  window.addEventListener('error', (event) => reportError(event.error ?? event.message))
  window.addEventListener('unhandledrejection', (event) => reportError(event.reason))
}
