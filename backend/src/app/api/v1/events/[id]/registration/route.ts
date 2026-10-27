import { and, count, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/db'
import { eventRegistrations, events } from '@/db/schema'
import { getCurrentUser, requireUser } from '@/lib/auth'
import { ApiError, json, notFound, readJson, route } from '@/lib/http'
import { notifyUserSafe } from '@/lib/notify'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

async function state(eventId: string, userId?: string | null) {
  const db = await getDb()
  const [[event], [{ n }], mine] = await Promise.all([
    db.select().from(events).where(and(eq(events.id, eventId), eq(events.status, 'published'))).limit(1),
    db.select({ n: count() }).from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId)),
    userId
      ? db
          .select({ id: eventRegistrations.userId })
          .from(eventRegistrations)
          .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)))
          .limit(1)
      : Promise.resolve([]),
  ])
  if (!event) throw notFound('Tadbir')
  // registered — admin kiritgan oflayn ishtirokchilar; saytdagilar ustiga qo‘shiladi
  return { event, registered: event.registered + n, joined: mine.length > 0 }
}

/** { joined, registered, capacity } */
export const GET = route<{ id: string }>(async (_request, { params }) => {
  const { id } = await params
  const user = await getCurrentUser()
  const { event, registered, joined } = await state(id, user?.id)
  return json({ joined, registered, capacity: event.capacity })
})

/** Ro‘yxatdan o‘tish / chiqish: { joined: boolean } */
export const PUT = route<{ id: string }>(async (request, { params }) => {
  const { id } = await params
  const user = await requireUser()
  await rateLimit(`event-join:${user.id}`, 30, 60 * 60_000)
  const { joined } = await readJson(request, z.object({ joined: z.boolean() }))
  const db = await getDb()
  const current = await state(id, user.id)

  if (joined && !current.joined) {
    if (current.event.startsAt.getTime() < Date.now()) throw new ApiError(422, 'EVENT_STARTED', 'Tadbir allaqachon boshlangan')
    if (current.event.capacity > 0 && current.registered >= current.event.capacity) {
      throw new ApiError(409, 'EVENT_FULL', 'Afsuski, joylar to‘lgan')
    }
    await db.insert(eventRegistrations).values({ eventId: id, userId: user.id }).onConflictDoNothing()
    notifyUserSafe(user.id, {
      type: 'system',
      title: 'Tadbirga ro‘yxatdan o‘tdingiz ✅',
      body: `«${current.event.title}» — ${current.event.startsAt.toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}. Tafsilotlar shu yerda va Telegram’da keladi.`,
      link: `/tadbir/${id}`,
    })
  } else if (!joined && current.joined) {
    await db.delete(eventRegistrations).where(and(eq(eventRegistrations.eventId, id), eq(eventRegistrations.userId, user.id)))
  }
  const next = await state(id, user.id)
  return json({ joined: next.joined, registered: next.registered, capacity: next.event.capacity })
})
