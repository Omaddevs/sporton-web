import { eq, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, services } from '@/db/schema'
import { json, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'

/** Ko‘rishlar hisoblagichi. ?service=ID bo‘lsa xizmatniki ham oshadi. Bir IP — 30 daqiqada bir marta. */
export const POST = route<{ id: string }>(async (request, { params }) => {
  const { id } = await params
  const serviceId = Number(new URL(request.url).searchParams.get('service')) || null
  try {
    await rateLimit(`view:${clientIp(request)}:${id}:${serviceId ?? ''}`, 1, 30 * 60_000)
  } catch {
    return json({ ok: true, counted: false })
  }
  const db = await getDb()
  await db.update(complexes).set({ views: sql`${complexes.views} + 1` }).where(eq(complexes.id, id))
  if (serviceId) await db.update(services).set({ views: sql`${services.views} + 1` }).where(eq(services.id, serviceId))
  return json({ ok: true, counted: true })
})
