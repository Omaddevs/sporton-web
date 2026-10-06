import { api } from './apiClient.js'
import { hydrateCompanies } from '../data/companies.js'
import { hydrateJobs } from '../data/jobs.js'
import { rebuildComplexes } from '../data/complexes.js'
import { hydrateNews } from '../data/news.js'
import { hydrateEvents } from '../data/campaigns.js'

/** true — ma’lumotlar backenddan; false — API ishlamadi, ichki zaxira ma’lumotlar ko‘rsatilmoqda */
export let catalogSource = 'static'

/**
 * Ilova chizilishidan oldin katalog va yangiliklarni yuklaydi. Juda sekin bo‘lsa yoki xato
 * bersa — ichki (bundle’dagi) ma’lumotlar bilan davom etamiz, sayt baribir ochiladi.
 */
export async function hydrateCatalog({ timeout = 2500 } = {}) {
  const [catalog, news, events] = await Promise.allSettled([
    api('/catalog', { timeout }),
    api('/news', { timeout }),
    api('/events', { timeout }),
  ])

  if (catalog.status === 'fulfilled' && catalog.value.complexes?.length) {
    hydrateCompanies(catalog.value.complexes)
    hydrateJobs(catalog.value.services)
    rebuildComplexes()
    catalogSource = 'api'
  } else if (import.meta.env.DEV) {
    console.warn('[catalog] API ishlamadi — ichki ma’lumotlar ishlatilmoqda', catalog.reason)
  }

  if (news.status === 'fulfilled') hydrateNews(news.value.news ?? [])
  // Admin paneldagi tadbirlar; bo‘sh bo‘lsa bosh sahifadagi bo‘lim ko‘rinmaydi
  if (events.status === 'fulfilled') hydrateEvents(events.value.events ?? [])
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
