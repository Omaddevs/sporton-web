import { tr } from '../i18n/index.js'
import { companies, DEFAULT_COMPANY_ID } from './companies.js'
import { jobs } from './jobs.js'
import { SOCIAL_LINKS } from './social.js'

/**
 * Sport majmualari: kartalar va detail sahifa uchun majmua + uning xizmatlari (jobs.js)
 * dan yig‘ilgan ma’lumot. Reyting, sharhlar va ko‘rishlar faqat backenddan keladi —
 * hech narsa to‘qib chiqarilmaydi.
 */

const SPORT_IMAGES = {
  futbol: 'futbol',
  basketbol: 'basketbol',
  boks: 'boks',
  fitnes: 'fitnes',
  kurash: 'kurash',
  suzish: 'suzish',
  tennis: 'tennis',
  padel: 'tennis',
  'stol-tennisi': 'tennis',
  velosport: 'velosport',
  voleybol: 'voleybol',
  'yengil-atletika': 'yengil-atletika',
  yoga: 'yoga',
}

const GALLERY = ['g1', 'g2', 'g3', 'g4', 'g5']

export const FALLBACK_IMAGE = '/images/sport/cat/boshqa.webp'

export const AMENITIES = [
  { id: 'shower', label: tr('Dush va kiyinish xonasi') },
  { id: 'parking', label: tr('Bepul avtoturargoh') },
  { id: 'wifi', label: tr('Bepul Wi-Fi') },
  { id: 'locker', label: tr('Shaxsiy shkaflar') },
  { id: 'cafe', label: tr('Kafe va dam olish zonasi') },
  { id: 'inventory', label: tr('Inventar ijarasi') },
  { id: 'coach', label: tr('Malakali murabbiylar') },
  { id: 'ac', label: tr('Konditsioner') },
]

/** “250 000 so‘m / soat” → 250000 (so‘mda bo‘lmagan narxlar uchun null) */
export function parsePrice(price = '') {
  if (!price || !price.includes('so‘m')) return null
  const digits = price.split('so‘m')[0].replace(/\D/g, '')
  return digits ? Number(digits) : null
}

export function formatPrice(value) {
  return value.toLocaleString('ru-RU').replace(/[\s,  ]/g, ' ')
}

/** "+998 90 123 45 67" → "tel:+998901234567" */
export function phoneHref(phone) {
  return `tel:${String(phone ?? '').replace(/[^\d+]/g, '')}`
}

function buildComplex(company, index) {
  const services = jobs.filter((job) => job.companyId === company.id)
  const sportIds = [...new Set(services.map((job) => job.sportId))]
  const prices = services.map((job) => parsePrice(job.salary)).filter((value) => value !== null)
  const physical = services.find((job) => job.type !== 'remote')

  const uploaded = Array.isArray(company.media) ? company.media : []
  let images = uploaded.length ? uploaded.filter((m) => m.type === 'image').map((m) => m.url) : null
  if (!images?.length) images = company.images?.length ? company.images : null
  if (!images) {
    const covers = sportIds.map((id) => `/images/sport/cat/${SPORT_IMAGES[id] ?? 'boshqa'}.webp`)
    const gallery = Array.from(
      { length: 4 },
      (_, i) => `/images/sport/gallery/${GALLERY[(index + i) % GALLERY.length]}.webp`,
    )
    images = [...covers, ...gallery]
  }
  // Banner keng (24:5) kesiladi — yuklangan rasmlar bo‘lsa galereya va kartochkalarga qo‘shilmaydi
  if (!uploaded.length) images = [...new Set([...(company.bannerImage ? [company.bannerImage] : []), ...images])]

  // Galereya: rasm va videolar tartib bilan; yuklangan media bo‘lmasa muqova (banner) birinchi
  const media = uploaded.length ? uploaded : images.map((url) => ({ type: 'image', url, provider: 'link' }))
  const gallery =
    !uploaded.length && company.bannerImage && !media.some((m) => m.url === company.bannerImage)
      ? [{ type: 'image', url: company.bannerImage, provider: 'link' }, ...media]
      : media

  const amenityIds = Array.isArray(company.amenities) ? company.amenities : []

  return {
    ...company,
    images: images.slice(0, 7),
    gallery,
    services,
    sportIds,
    sports: [...new Set(services.map((job) => job.category))],
    minPrice: prices.length ? Math.min(...prices) : null,
    hasTrial: services.some((job) => job.type === 'intern'),
    hasOnline: services.some((job) => job.type === 'remote'),
    rating: company.rating ?? null,
    reviews: company.reviews ?? 0,
    views: company.views ?? 0,
    hours: company.hours ?? physical?.hours ?? '07:00 - 23:00',
    // Raqamning o‘zi backenddan faqat kirgan foydalanuvchiga keladi (PhoneReveal)
    hasPhone: company.hasPhone ?? Boolean(company.phone),
    // Majmuaning o‘z Telegram’i bo‘lmasa — SportON kanali
    telegram: company.telegram ?? SOCIAL_LINKS.telegram.handle,
    amenities: AMENITIES.filter((a) => amenityIds.includes(a.id)),
    coords: company.coords ?? physical?.coords ?? null,
  }
}

export const complexes = companies.map(buildComplex)

/** hydrateCompanies + hydrateJobs dan keyin chaqiriladi */
export function rebuildComplexes() {
  complexes.splice(0, complexes.length, ...companies.map(buildComplex))
}

export function getComplexById(id) {
  return complexes.find((c) => c.id === id) ?? null
}

export function getDefaultComplex() {
  return complexes.find((c) => c.id === DEFAULT_COMPANY_ID) ?? complexes[0] ?? null
}

/** Avval umumiy sport turi bor majmualar, keyin qolganlari */
export function getSimilarComplexes(complex, limit = 4) {
  const others = complexes.filter((c) => c.id !== complex.id)
  const shared = others.filter((c) => c.sportIds.some((id) => complex.sportIds.includes(id)))
  return [...shared, ...others.filter((c) => !shared.includes(c))].slice(0, limit)
}

/** Haqiqiy sharhlar ro‘yxatidan: o‘rtacha baho va 5★→1★ foizlari */
export function summarizeReviews(reviews) {
  const total = reviews.length
  const average = total ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10 : null
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    percent: total ? Math.round((reviews.filter((r) => r.rating === stars).length / total) * 100) : 0,
  }))
  return { total, average, breakdown }
}

/** Shu sport turi bo‘yicha xizmat ko‘rsatadigan majmualar */
export function getComplexesForCategory(categoryId) {
  return complexes.filter((c) => c.sportIds.includes(categoryId))
}
