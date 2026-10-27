import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { reels } from '@/db/schema'
import { json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

/** Admin paneldan boshqariladigan Reels (faollari, tartib bo‘yicha). Bo‘sh — bo‘lim ko‘rinmaydi */
export const GET = route(async () => {
  const db = await getDb()
  const rows = await db.select().from(reels).where(eq(reels.active, true)).orderBy(asc(reels.sortOrder), asc(reels.createdAt))
  return json({
    reels: rows.map(({ code, title, tag, tagTone, cover, video, publishedOn }) => ({ code, title, tag, tagTone, cover, video, publishedOn })),
  })
})
