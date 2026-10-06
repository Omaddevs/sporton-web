import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { events } from '@/db/schema'
import { json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

/** E’lon qilingan sport tadbirlari, boshlanish vaqti bo‘yicha */
export const GET = route(async () => {
  const db = await getDb()
  const rows = await db.select().from(events).where(eq(events.status, 'published')).orderBy(asc(events.startsAt))
  return json({
    events: rows.map(({ status: _s, createdAt: _c, updatedAt: _u, startsAt, endsAt, ...e }) => ({
      ...e,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })),
  })
})
