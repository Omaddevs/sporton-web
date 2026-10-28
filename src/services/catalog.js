import { api } from './apiClient.js'
import { hydrateCompanies } from '../data/companies.js'
import { hydrateJobs } from '../data/jobs.js'
import { rebuildComplexes } from '../data/complexes.js'
import { hydrateNews } from '../data/news.js'
import { hydrateEvents } from '../data/campaigns.js'
import { hydrateReels } from '../data/reels.js'

/**
 * 'api' — ma’lumotlar backenddan; 'static' — lokal ishlab chiqishda API ishlamadi, ichki namuna
 * ma’lumotlar; 'offline' — production’da API ishlamadi: namuna ma’lumot haqiqiydek ko‘rsatilmaydi,
 * sahifada «Server bilan aloqa yo‘q» ogohlantirishi chiqadi.
 */
export let catalogSource = 'static'

// Oxirgi katalog javobi — qoralamani oldindan ko‘rishda unga qo‘shib qayta yig‘amiz
let lastCatalog = { complexes: [], services: [] }

function applyCatalog(data) {
  hydrateCompanies(data.complexes)
  hydrateJobs(data.services)
  rebuildComplexes()
}

/**
 * Ilova chizilishidan oldin katalog, yangiliklar, tadbirlar va Reels’ni yuklaydi. Juda sekin bo‘lsa
 * yoki xato bersa — sayt baribir ochiladi (production’da bo‘sh ro‘yxat va ogohlantirish bilan).
 */
export async function hydrateCatalog({ timeout = 2500 } = {}) {
  const [catalog, news, events, reels] = await Promise.allSettled([
    api('/catalog', { timeout }),
    api('/news', { timeout }),
    api('/events', { timeout }),
    api('/reels', { timeout }),
  ])

  if (catalog.status === 'fulfilled') {
    lastCatalog = { complexes: catalog.value.complexes ?? [], services: catalog.value.services ?? [] }
    applyCatalog(lastCatalog)
    catalogSource = 'api'
  } else if (import.meta.env.DEV) {
    console.warn('[catalog] API ishlamadi — ichki namuna ma’lumotlar ishlatilmoqda', catalog.reason)
  } else {
    applyCatalog(lastCatalog)
    catalogSource = 'offline'
  }

  if (news.status === 'fulfilled') hydrateNews(news.value.news ?? [])
  else if (!import.meta.env.DEV) hydrateNews([])
  // Admin paneldagi tadbirlar va Reels; bo‘sh bo‘lsa bosh sahifadagi bo‘lim ko‘rinmaydi
  if (events.status === 'fulfilled') hydrateEvents(events.value.events ?? [])
  else if (!import.meta.env.DEV) hydrateEvents([])
  if (reels.status === 'fulfilled') hydrateReels(reels.value.reels ?? [])
  else if (!import.meta.env.DEV) hydrateReels([])
}

/**
 * Qoralama (hali e’lon qilinmagan) majmuani oldindan ko‘rish: admin/kabinetdagi imzolangan havola
 * (?preview=token). Majmua va uning barcha xizmatlari vaqtincha katalogga qo‘shiladi.
 */
export async function loadComplexPreview(complexId, token) {
  const data = await api(`/complexes/${encodeURIComponent(complexId)}/preview?token=${encodeURIComponent(token)}`)
  applyCatalog({
    complexes: [...lastCatalog.complexes.filter((c) => c.id !== complexId), data.complex],
    services: [...lastCatalog.services.filter((s) => s.complexId !== complexId), ...data.services],
  })
  return data.complex
}

/** Tadbir ko‘rishlari hisoblagichi (javobni kutmaymiz) */
export function trackEventView(eventId) {
  api(`/events/${encodeURIComponent(eventId)}/view`, { method: 'POST' }).catch(() => null)
}

/** Ko‘rishlar hisoblagichi (javobni kutmaymiz) */
export function trackView(complexId, serviceId) {
  const query = serviceId ? `?service=${serviceId}` : ''
  api(`/complexes/${encodeURIComponent(complexId)}/view${query}`, { method: 'POST' }).catch(() => null)
}
