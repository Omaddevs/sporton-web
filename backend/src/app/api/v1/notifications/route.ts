import { and, desc, eq, inArray, isNull, lt } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/db'
import { notifications } from '@/db/schema'
import { requireUser } from '@/lib/auth'
import { publish } from '@/lib/events'
import { json, readJson, route } from '@/lib/http'
import { serializeNotification, unreadCount } from '@/lib/notify'

export const dynamic = 'force-dynamic'

/** GET ?limit=30&before=<ISO> — sahifalab (eng yangisi birinchi) */
export const GET = route(async (request) => {
  const user = await requireUser()
  const url = new URL(request.url)
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') ?? 30)))
  const before = url.searchParams.get('before')
  const db = await getDb()
  const rows = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, user.id),
        before && !Number.isNaN(Date.parse(before)) ? lt(notifications.createdAt, new Date(before)) : undefined,
      ),
    )
    .orderBy(desc(notifications.createdAt))
    .limit(limit + 1)
  return json({
    items: rows.slice(0, limit).map(serializeNotification),
    hasMore: rows.length > limit,
    unread: await unreadCount(user.id),
  })
})

const idsSchema = z.object({ ids: z.array(z.uuid()).max(500).optional(), all: z.boolean().optional() })

/** O‘qilgan deb belgilash: { ids } yoki { all: true } */
export const PATCH = route(async (request) => {
  const user = await requireUser()
  const { ids, all } = await readJson(request, idsSchema)
  const db = await getDb()
  if (all || ids?.length) {
    await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, user.id),
          isNull(notifications.readAt),
          all ? undefined : inArray(notifications.id, ids!),
        ),
      )
  }
  const unread = await unreadCount(user.id)
  publish(user.id, { kind: 'unread', unread })
  return json({ unread })
})

/** O‘chirish: { ids } yoki { all: true } */
export const DELETE = route(async (request) => {
  const user = await requireUser()
  const { ids, all } = await readJson(request, idsSchema)
  const db = await getDb()
  if (all || ids?.length) {
    await db
      .delete(notifications)
      .where(and(eq(notifications.userId, user.id), all ? undefined : inArray(notifications.id, ids!)))
  }
  const unread = await unreadCount(user.id)
  publish(user.id, { kind: 'unread', unread })
  return json({ unread })
})
