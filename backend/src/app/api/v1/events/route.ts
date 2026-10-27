import { asc, count, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { eventRegistrations, events } from '@/db/schema'
import { json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

/** E’lon qilingan sport tadbirlari, boshlanish vaqti bo‘yicha */
export const GET = route(async () => {
  const db = await getDb()
  const [rows, joined] = await Promise.all([
    db.select().from(events).where(eq(events.status, 'published')).orderBy(asc(events.startsAt)),
    db.select({ id: eventRegistrations.eventId, n: count() }).from(eventRegistrations).groupBy(eventRegistrations.eventId),
  ])
  const online = new Map(joined.map((j) => [j.id, j.n]))
  return json({
    events: rows.map(({ status: _s, createdAt: _c, updatedAt: _u, startsAt, endsAt, ...e }) => ({
      ...e,
      // Oflayn (admin kiritgan) + saytdan ro‘yxatdan o‘tganlar
      registered: e.registered + (online.get(e.id) ?? 0),
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    })),
  })
})
