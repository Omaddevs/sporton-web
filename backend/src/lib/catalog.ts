import 'server-only'
import { and, avg, count, desc, eq, inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, news, reviews, services, type Complex, type News, type Service } from '@/db/schema'

/** So‘mdagi narxni matndan ajratadi: «250 000 so‘m / soat» → 250000 */
export function parsePriceValue(price: string | null | undefined) {
  if (!price || !price.includes('so‘m')) return null
  const digits = price.split('so‘m')[0].replace(/\D/g, '')
  return digits ? Number(digits) : null
}

type Rating = { rating: number | null; reviewsCount: number }

export function serializeComplex(row: Complex, rating: Rating, servicesCount: number) {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    verified: row.verified,
    listed: row.listed,
    tagline: row.tagline,
    location: row.location,
    city: row.city,
    region: row.region,
    address: row.address,
    landmark: row.landmark,
    website: row.website,
    industry: row.industry,
    years: row.years,
    employees: row.employees,
    // Raqam ochiq katalogda berilmaydi — faqat kirgan foydalanuvchiga /complexes/:id/contact orqali
    hasPhone: Boolean(row.phone),
    telegram: row.telegram,
    hours: row.hours,
    priceNote: row.priceNote,
    logo: row.logo,
    bannerImage: row.bannerImage,
    bannerSlogan: row.bannerSlogan,
    about: row.about,
    similarIds: row.similarIds,
    amenities: row.amenities,
    images: row.images,
    media: row.media,
    coords: row.lat != null && row.lng != null ? { lat: row.lat, lng: row.lng } : null,
    views: row.views,
    rating: rating.rating,
    reviews: rating.reviewsCount,
    adsCount: servicesCount,
  }
}

export function serializeService(row: Service) {
  return {
    id: row.id,
    complexId: row.complexId,
    title: row.title,
    sportId: row.sportId,
    category: row.category,
    type: row.type,
    location: row.location,
    coords: row.lat != null && row.lng != null ? { lat: row.lat, lng: row.lng } : null,
    price: row.price,
    priceValue: row.priceValue,
    hours: row.hours,
    workMode: row.workMode,
    experience: row.experience,
    level: row.level,
    description: row.description,
    tasks: row.tasks,
    requirements: row.requirements,
    offers: row.offers,
    bookingMode: row.bookingMode,
    views: row.views,
    createdAt: row.createdAt,
  }
}

export function serializeNews(row: News, extra: { comments?: number } = {}) {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    excerpt: row.excerpt,
    image: row.image,
    imageCaption: row.imageCaption,
    gallery: row.gallery,
    body: row.body,
    tags: row.tags,
    featured: row.featured,
    authorName: row.authorName,
    views: row.views,
    publishedAt: row.publishedAt,
    comments: extra.comments ?? 0,
  }
}

export async function ratingsByComplex(ids?: string[]) {
  const db = await getDb()
  const rows = await db
    .select({ complexId: reviews.complexId, avg: avg(reviews.rating), total: count() })
    .from(reviews)
    .where(
      ids?.length
        ? and(eq(reviews.status, 'published'), inArray(reviews.complexId, ids))
        : eq(reviews.status, 'published'),
    )
    .groupBy(reviews.complexId)
  return new Map<string, Rating>(
    rows.map((r) => [
      r.complexId,
      { rating: r.avg == null ? null : Math.round(Number(r.avg) * 10) / 10, reviewsCount: r.total },
    ]),
  )
}

const NO_RATING: Rating = { rating: null, reviewsCount: 0 }

// ── Katalog keshi: frontend har sahifa ochilganda bir marta so‘raydi ──

type Catalog = Awaited<ReturnType<typeof buildCatalog>>
const cacheStore = globalThis as unknown as { __sportonCatalog?: { at: number; data: Catalog } }
const CATALOG_TTL = 30_000

async function buildCatalog() {
  const db = await getDb()
  const complexRows = await db
    .select()
    .from(complexes)
    .where(eq(complexes.status, 'published'))
    .orderBy(desc(complexes.listed), complexes.sortOrder, complexes.createdAt)
  const ids = complexRows.map((c) => c.id)
  const serviceRows = ids.length
    ? await db
        .select()
        .from(services)
        .where(and(eq(services.status, 'published'), inArray(services.complexId, ids)))
        .orderBy(services.id)
    : []
  // Xizmatlar majmualar tartibida (haqiqiy e’lonlar birinchi), ichida — id bo‘yicha
  const order = new Map(ids.map((id, i) => [id, i]))
  serviceRows.sort((a, b) => order.get(a.complexId)! - order.get(b.complexId)! || a.id - b.id)
  const ratings = await ratingsByComplex()
  const serviceCounts = new Map<string, number>()
  for (const s of serviceRows) serviceCounts.set(s.complexId, (serviceCounts.get(s.complexId) ?? 0) + 1)

  return {
    complexes: complexRows.map((c) => serializeComplex(c, ratings.get(c.id) ?? NO_RATING, serviceCounts.get(c.id) ?? 0)),
    services: serviceRows.map(serializeService),
    generatedAt: new Date().toISOString(),
  }
}

export async function getCatalog() {
  const cached = cacheStore.__sportonCatalog
  if (cached && Date.now() - cached.at < CATALOG_TTL) return cached.data
  const data = await buildCatalog()
  cacheStore.__sportonCatalog = { at: Date.now(), data }
  return data
}

/** Admin o‘zgarishlaridan so‘ng chaqiriladi */
export function invalidateCatalog() {
  cacheStore.__sportonCatalog = undefined
}

export async function getPublishedNews() {
  const db = await getDb()
  return db
    .select()
    .from(news)
    .where(eq(news.status, 'published'))
    .orderBy(desc(news.featured), desc(news.publishedAt))
}
