import 'server-only'
import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, events, news, services, sports } from '@/db/schema'
import { ratingsByComplex } from './catalog'

export const SITE_NAME = 'SportON'
const DEFAULT_DESCRIPTION =
  'SportON — O‘zbekistondagi sport majmualarini toping va onlayn bron qiling: futbol maydonlari, fitnes zallar, suzish havzalari, sektsiyalar.'
const DEFAULT_IMAGE = '/images/og-cover.jpg'

export const siteUrl = () => (process.env.PUBLIC_SITE_URL || 'https://sporton.uz').replace(/\/$/, '')
const abs = (path: string | null | undefined) => (!path ? null : path.startsWith('http') ? path : `${siteUrl()}${path}`)
const clip = (text: string | null | undefined, n = 160) => {
  const t = (text ?? '').replace(/\s+/g, ' ').trim()
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t
}

export type PageMeta = {
  title: string
  description: string
  image: string
  url: string
  type: 'website' | 'article' | 'place'
  jsonLd?: Record<string, unknown>
}

// ── Sitemap ────────────────────────────────────────────────────────

type Entry = { path: string; lastmod?: Date | null; priority: number; changefreq: 'daily' | 'weekly' | 'monthly' }

export async function sitemapEntries(): Promise<Entry[]> {
  const db = await getDb()
  const [cx, sv, nw, ev, sp] = await Promise.all([
    db.select({ id: complexes.id, at: complexes.updatedAt }).from(complexes).where(eq(complexes.status, 'published')),
    db
      .select({ id: services.id, at: services.updatedAt })
      .from(services)
      .innerJoin(complexes, eq(complexes.id, services.complexId))
      .where(and(eq(services.status, 'published'), eq(complexes.status, 'published'))),
    db.select({ id: news.id, at: news.updatedAt }).from(news).where(eq(news.status, 'published')).orderBy(desc(news.publishedAt)),
    db.select({ id: events.id, at: events.updatedAt }).from(events).where(eq(events.status, 'published')),
    db.select({ id: sports.id }).from(sports).where(eq(sports.active, true)),
  ])
  return [
    { path: '/', priority: 1, changefreq: 'daily' },
    { path: '/majmualar', priority: 0.9, changefreq: 'daily' },
    { path: '/sport-turlari', priority: 0.7, changefreq: 'weekly' },
    { path: '/xarita', priority: 0.6, changefreq: 'weekly' },
    ...sp.map((s) => ({ path: `/sport/${s.id}`, priority: 0.7, changefreq: 'weekly' as const })),
    ...cx.map((c) => ({ path: `/sport-majmua/${c.id}`, lastmod: c.at, priority: 0.9, changefreq: 'weekly' as const })),
    ...sv.map((s) => ({ path: `/bron/${s.id}`, lastmod: s.at, priority: 0.6, changefreq: 'weekly' as const })),
    ...nw.map((n) => ({ path: `/yangilik/${n.id}`, lastmod: n.at, priority: 0.5, changefreq: 'monthly' as const })),
    ...ev.map((e) => ({ path: `/tadbir/${e.id}`, lastmod: e.at, priority: 0.6, changefreq: 'weekly' as const })),
  ]
}

const xmlEscape = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function sitemapXml() {
  const urls = (await sitemapEntries()).map(
    (e) =>
      `  <url><loc>${xmlEscape(siteUrl() + encodeURI(e.path))}</loc>${e.lastmod ? `<lastmod>${e.lastmod.toISOString()}</lastmod>` : ''}<changefreq>${e.changefreq}</changefreq><priority>${e.priority.toFixed(1)}</priority></url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

// ── Sahifa meta teglari (ijtimoiy tarmoq botlari va qidiruv tizimlari uchun) ─

const base = (path: string): PageMeta => ({
  title: `${SITE_NAME} — sport majmualarini onlayn bron qilish`,
  description: DEFAULT_DESCRIPTION,
  image: abs(DEFAULT_IMAGE)!,
  url: siteUrl() + path,
  type: 'website',
})

export async function pageMeta(path: string): Promise<PageMeta> {
  const meta = base(path)
  const [, section, id] = path.split('?')[0].split('/')
  if (!id) {
    if (section === 'majmualar') return { ...meta, title: `Sport majmualari — ${SITE_NAME}` }
    if (section === 'xarita') return { ...meta, title: `Sport majmualari xaritada — ${SITE_NAME}` }
    return meta
  }
  const key = decodeURIComponent(id)
  const db = await getDb()

  if (section === 'sport-majmua') {
    const [c] = await db.select().from(complexes).where(and(eq(complexes.id, key), eq(complexes.status, 'published'))).limit(1)
    if (!c) return meta
    const rating = (await ratingsByComplex([c.id])).get(c.id)
    const image = abs(c.bannerImage ?? c.images[0] ?? c.logo) ?? meta.image
    return {
      ...meta,
      title: `${c.name}${c.city ? ` — ${c.city}` : ''} | ${SITE_NAME}`,
      description: clip(c.tagline || c.about) || meta.description,
      image,
      type: 'place',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SportsActivityLocation',
        name: c.name,
        description: clip(c.about, 300) || undefined,
        image,
        url: meta.url,
        address: c.location ? { '@type': 'PostalAddress', streetAddress: c.address ?? c.location, addressLocality: c.city ?? undefined, addressCountry: 'UZ' } : undefined,
        geo: c.lat != null && c.lng != null ? { '@type': 'GeoCoordinates', latitude: c.lat, longitude: c.lng } : undefined,
        openingHours: c.hours ?? undefined,
        aggregateRating:
          rating?.rating && rating.reviewsCount
            ? { '@type': 'AggregateRating', ratingValue: rating.rating, reviewCount: rating.reviewsCount }
            : undefined,
      },
    }
  }
  if (section === 'bron') {
    const n = Number(key)
    if (!Number.isInteger(n)) return meta
    const [row] = await db
      .select({ s: services, name: complexes.name, image: complexes.bannerImage })
      .from(services)
      .innerJoin(complexes, eq(complexes.id, services.complexId))
      .where(and(eq(services.id, n), eq(services.status, 'published'), eq(complexes.status, 'published')))
      .limit(1)
    if (!row) return meta
    return {
      ...meta,
      title: `${row.s.title} — ${row.name} | ${SITE_NAME}`,
      description: clip(`${row.s.price}. ${row.s.description ?? ''}`) || meta.description,
      image: abs(row.image) ?? meta.image,
    }
  }
  if (section === 'yangilik') {
    const [n] = await db.select().from(news).where(and(eq(news.id, key), eq(news.status, 'published'))).limit(1)
    if (!n) return meta
    return {
      ...meta,
      title: `${n.title} | ${SITE_NAME}`,
      description: clip(n.excerpt) || meta.description,
      image: abs(n.image) ?? meta.image,
      type: 'article',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: n.title,
        image: abs(n.image) ?? undefined,
        datePublished: n.publishedAt.toISOString(),
        publisher: { '@type': 'Organization', name: SITE_NAME },
      },
    }
  }
  if (section === 'tadbir') {
    const [e] = await db.select().from(events).where(and(eq(events.id, key), eq(events.status, 'published'))).limit(1)
    if (!e) return meta
    return { ...meta, title: `${e.title} | ${SITE_NAME}`, description: clip(e.excerpt) || meta.description, image: abs(e.image) ?? meta.image }
  }
  if (section === 'sport') {
    const [s] = await db.select().from(sports).where(eq(sports.id, key)).limit(1)
    if (!s) return meta
    return { ...meta, title: `${s.title} — sport majmualari va mashg‘ulotlar | ${SITE_NAME}`, image: abs(s.image) ?? meta.image }
  }
  return meta
}

const attr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Botlarga beriladigan HTML: meta teglar + JSON-LD; odamni asl sahifaga yo‘naltiradi */
export function metaHtml(meta: PageMeta) {
  const ld = meta.jsonLd ? `<script type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>` : ''
  return `<!doctype html>
<html lang="uz"><head>
<meta charset="utf-8">
<title>${attr(meta.title)}</title>
<meta name="description" content="${attr(meta.description)}">
<link rel="canonical" href="${attr(meta.url)}">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:type" content="${meta.type === 'article' ? 'article' : 'website'}">
<meta property="og:title" content="${attr(meta.title)}">
<meta property="og:description" content="${attr(meta.description)}">
<meta property="og:image" content="${attr(meta.image)}">
<meta property="og:url" content="${attr(meta.url)}">
<meta property="og:locale" content="uz_UZ">
<meta property="og:locale:alternate" content="ru_RU">
<meta name="twitter:card" content="summary_large_image">
${ld}
<meta http-equiv="refresh" content="0; url=${attr(meta.url)}">
</head><body><h1>${attr(meta.title)}</h1><p>${attr(meta.description)}</p><a href="${attr(meta.url)}">${attr(meta.url)}</a></body></html>`
}
