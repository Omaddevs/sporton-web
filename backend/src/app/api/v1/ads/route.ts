import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { ads } from '@/db/schema'
import { json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

/** Faqat rasm va havolasi bor faol reklamalar: { ads: { home: {...} } } */
export const GET = route(async () => {
  const db = await getDb()
  const rows = await db.select().from(ads).where(eq(ads.active, true))
  const result: Record<string, { image: string; mobileImage: string | null; link: string; ctaLabel: string | null; alt: string | null }> = {}
  for (const { slot, image, mobileImage, link, ctaLabel, alt } of rows) {
    if (image && link) result[slot] = { image, mobileImage, link, ctaLabel, alt }
  }
  return json({ ads: result })
})
