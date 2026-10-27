import { and, eq, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { news } from '@/db/schema'
import { serializeNews } from '@/lib/catalog'
import { json, notFound, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export const GET = route<{ id: string }>(async (request, { params }) => {
  const { id } = await params
  const db = await getDb()
  const [row] = await db.select().from(news).where(and(eq(news.id, id), eq(news.status, 'published'))).limit(1)
  if (!row) throw notFound('Yangilik')
  try {
    await rateLimit(`news-view:${clientIp(request)}:${id}`, 1, 30 * 60_000)
    await db.update(news).set({ views: sql`${news.views} + 1` }).where(eq(news.id, id))
  } catch {
    /* takroriy ko‘rish hisoblanmaydi */
  }
  return json({ news: serializeNews(row) })
})
