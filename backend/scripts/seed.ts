/**
 * Boshlang‘ich ma’lumotlar: scripts/seed-data.json (frontend katalogining nusxasi, `npm run seed:export`)
 * dagi majmualar, xizmatlar, yangiliklar va sport tadbirlarini bazaga yozadi.
 *
 *   npm run db:seed            — faqat bo‘sh jadvallarni to‘ldiradi (xavfsiz, qayta ishga tushirsa bo‘ladi)
 *   npm run db:seed -- --force — katalog va yangiliklarni o‘chirib, qaytadan yozadi
 *
 * Soxta ma’lumot yozilmaydi: sharhlar, reytinglar va izohlar bo‘sh boshlanadi; namuna (demo)
 * majmualarga to‘qib chiqarilgan telefon/sayt yozilmaydi va ular `is_demo` bilan belgilanadi.
 */
import './_env'
import { count, sql } from 'drizzle-orm'
import { createDb } from '../src/db/client'
import { inferBookingMode } from '../src/lib/booking-mode'
import { complexes as complexesTable, events as eventsTable, news as newsTable, services as servicesTable, sports } from '../src/db/schema'
import { readFileSync } from 'node:fs'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any

const seed: Any = JSON.parse(readFileSync(new URL('./seed-data.json', import.meta.url), 'utf8'))
const { categories, complexes: sourceComplexes, companies: sourceCompanies, jobs: sourceJobs } = seed

const force = process.argv.includes('--force')

const EXTRA_SPORTS = [
  { id: 'padel', title: 'Padel', accent: '#6366f1' },
  { id: 'stol-tennisi', title: 'Stol tennisi', accent: '#65a30d' },
  { id: 'shaxmat', title: 'Shaxmat', accent: '#334155' },
]

const CITY_REGION: Record<string, string> = {
  Toshkent: 'toshkent-shahar',
  Samarqand: 'samarqand',
  Buxoro: 'buxoro',
  Namangan: 'namangan',
  Andijon: 'andijon',
  'Farg‘ona': 'fargona',
  Nukus: 'qoraqalpogiston',
  Xorazm: 'xorazm',
  Qarshi: 'qashqadaryo',
  Jizzax: 'jizzax',
}

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']

/** «3-oktabr 2026» → Date */
function parseUzDate(value: string) {
  const match = /^(\d{1,2})-([a-z‘']+)\s+(\d{4})/i.exec(value ?? '')
  if (!match) return new Date()
  const month = MONTHS.indexOf(match[2].toLowerCase())
  return new Date(Date.UTC(Number(match[3]), Math.max(0, month), Number(match[1]), 9))
}

function parsePriceValue(price: string) {
  if (!price || !price.includes('so‘m')) return null
  const digits = price.split('so‘m')[0].replace(/\D/g, '')
  return digits ? Number(digits) : null
}

async function main() {
  const db = await createDb()

  if (force && process.env.NODE_ENV === 'production' && !process.argv.includes('--i-know')) {
    throw new Error('--force barcha xizmatlar, bronlar va sharhlarni o‘chiradi. Production’da: --force --i-know')
  }
  if (force) {
    console.log('… --force: katalog va yangiliklar tozalanmoqda')
    await db.delete(servicesTable)
    await db.delete(complexesTable)
    await db.delete(newsTable)
    await db.delete(eventsTable)
    await db.delete(sports)
  }

  // ── Sport turlari ──
  const [{ value: sportCount }] = await db.select({ value: count() }).from(sports)
  if (sportCount === 0) {
    const rows = [
      ...categories.map((c: Any, i: number) => ({
        id: c.id,
        title: c.title,
        accent: String(c.accent ?? '').startsWith('#') ? c.accent : null,
        image: c.image ?? null,
        sortOrder: i,
      })),
      ...EXTRA_SPORTS.map((s, i) => ({ ...s, image: null, sortOrder: categories.length + i })),
    ]
    await db.insert(sports).values(rows).onConflictDoNothing()
    console.log(`✓ Sport turlari: ${rows.length}`)
  }

  // ── Majmualar ──
  const [{ value: complexCount }] = await db.select({ value: count() }).from(complexesTable)
  if (complexCount === 0) {
    const rawById = new Map(sourceCompanies.map((c: Any) => [c.id, c]))
    const rows = sourceComplexes.map((c: Any, index: number) => {
      const raw: Any = rawById.get(c.id) ?? {}
      const isDemo = !raw.listed
      return {
        id: c.id,
        name: c.name,
        color: c.color,
        verified: Boolean(c.verified),
        listed: Boolean(raw.listed),
        isDemo,
        status: 'published' as const,
        tagline: c.tagline ?? null,
        location: c.location ?? null,
        city: c.city ?? null,
        region: CITY_REGION[c.city] ?? null,
        website: isDemo ? null : (raw.website ?? null),
        industry: c.industry ?? null,
        years: c.years ?? null,
        employees: c.employees ?? null,
        // Faqat e’londa ko‘rsatilgan haqiqiy raqam. Namuna majmualarga raqam to‘qilmaydi.
        phone: raw.phone ?? null,
        telegram: raw.telegram ?? null,
        hours: raw.hours ?? c.hours ?? null,
        priceNote: raw.priceNote ?? null,
        logo: raw.logo ?? null,
        bannerImage: raw.bannerImage ?? null,
        bannerSlogan: c.bannerSlogan ?? null,
        about: c.about ?? null,
        similarIds: c.similarIds ?? [],
        amenities: [],
        images: c.images ?? [],
        media: (c.images ?? []).map((url: string) => ({ type: 'image' as const, url, provider: 'link' as const })),
        lat: c.coords?.lat ?? null,
        lng: c.coords?.lng ?? null,
        views: isDemo ? (c.views ?? 0) : 0,
        sortOrder: index,
      }
    })
    await db.insert(complexesTable).values(rows)
    console.log(`✓ Majmualar: ${rows.length} (demo: ${rows.filter((r: Any) => r.isDemo).length})`)
  }

  // ── Xizmatlar ──
  const [{ value: serviceCount }] = await db.select({ value: count() }).from(servicesTable)
  if (serviceCount === 0) {
    const listedIds = new Set(sourceCompanies.filter((c: Any) => c.listed).map((c: Any) => c.id))
    const rows = sourceJobs.map((j: Any) => ({
      id: j.id,
      complexId: j.companyId,
      title: j.title,
      sportId: j.sportId,
      category: j.category,
      type: j.type,
      location: j.location,
      lat: j.coords?.lat ?? null,
      lng: j.coords?.lng ?? null,
      price: j.salary,
      priceValue: parsePriceValue(j.salary),
      hours: j.hours ?? null,
      workMode: j.workMode ?? null,
      experience: j.experience ?? null,
      level: j.level ?? null,
      description: j.description ?? null,
      tasks: j.tasks ?? [],
      requirements: j.requirements ?? [],
      offers: j.offers ?? [],
      views: listedIds.has(j.companyId) ? 0 : (j.views ?? 0),
      bookingMode: inferBookingMode({ type: j.type, price: j.salary, hours: j.hours ?? null }),
    }))
    for (let i = 0; i < rows.length; i += 50) await db.insert(servicesTable).values(rows.slice(i, i + 50))
    // Aniq id’lar bilan yozilgani uchun ketma-ketlikni oxirgi id’ga suramiz
    await db.execute(
      sql`select setval(pg_get_serial_sequence('services', 'id'), (select coalesce(max(id), 1) from services))`,
    )
    console.log(`✓ Xizmatlar: ${rows.length}`)
  }

  // ── Yangiliklar ──
  const [{ value: newsCount }] = await db.select({ value: count() }).from(newsTable)
  if (newsCount === 0) {
    const rows = seed.news.map((n: Any) => {
      return {
        id: n.id,
        category: n.category,
        title: n.title,
        excerpt: n.excerpt ?? '',
        image: n.image ?? null,
        body: n.body,
        tags: n.tags ?? [],
        featured: Boolean(n.featured),
        status: 'published' as const,
        authorName: 'SportON tahririyati',
        publishedAt: parseUzDate(n.date),
      }
    })
    await db.insert(newsTable).values(rows)
    console.log(`✓ Yangiliklar: ${rows.length}`)
  }

  // ── Sport tadbirlari ──
  const [{ value: eventCount }] = await db.select({ value: count() }).from(eventsTable)
  if (eventCount === 0 && seed.events?.length) {
    const rows = seed.events.map((e: Any) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      image: e.image ?? null,
      location: e.location,
      startsAt: new Date(e.startsAt),
      endsAt: new Date(e.endsAt),
      excerpt: e.excerpt ?? '',
      about: e.about ?? [],
      includes: e.includes ?? [],
      rules: e.rules ?? [],
      schedule: e.schedule ?? [],
      faq: e.faq ?? [],
      organizerName: e.organizer?.name ?? 'SportON',
      organizerRole: e.organizer?.role ?? 'Tashkilotchi',
      venueName: e.venue?.name ?? null,
      venueAddress: e.venue?.address ?? null,
      fee: e.fee ?? 'Bepul',
      prize: e.prize ?? null,
      level: e.level ?? 'Barcha darajalar',
      age: e.age ?? 'Cheklovsiz',
      capacity: e.capacity ?? 0,
      registered: e.registered ?? 0,
      views: e.views ?? 0,
    }))
    await db.insert(eventsTable).values(rows)
    console.log(`✓ Sport tadbirlari: ${rows.length}`)
  }

  console.log('✓ Seed tugadi')
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
