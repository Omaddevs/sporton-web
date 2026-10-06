import { and, eq, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { events } from '@/db/schema'
import { json, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'

/** Tadbir ko‘rishlari hisoblagichi. Bir IP — 30 daqiqada bir marta. */
export const POST = route<{ id: string }>(async (request, { params }) => {
  const { id } = await params
  try {
    rateLimit(`event-view:${clientIp(request)}:${id}`, 1, 30 * 60_000)
  } catch {
    return json({ ok: true, counted: false })
  }
  const db = await getDb()
  await db
    .update(events)
    .set({ views: sql`${events.views} + 1` })
    .where(and(eq(events.id, id), eq(events.status, 'published')))
  return json({ ok: true, counted: true })
})
