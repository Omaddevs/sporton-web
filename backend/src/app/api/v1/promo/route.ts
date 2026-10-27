import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { promoSlides } from '@/db/schema'
import { json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

/** Bosh sahifadagi promo karusel: faqat faol slaydlar (bo‘sh ro‘yxat — karusel ko‘rinmaydi) */
export const GET = route(async () => {
  const db = await getDb()
  const rows = await db
    .select()
    .from(promoSlides)
    .where(eq(promoSlides.active, true))
    .orderBy(asc(promoSlides.sortOrder), asc(promoSlides.createdAt))
  return json({ slides: rows.map(({ id, image, mobileImage, link, alt }) => ({ id, image, mobileImage, link, alt })) })
})
