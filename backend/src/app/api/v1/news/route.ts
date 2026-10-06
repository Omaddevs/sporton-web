import { count, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { newsComments } from '@/db/schema'
import { getPublishedNews, serializeNews } from '@/lib/catalog'
import { json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const db = await getDb()
  const rows = await getPublishedNews()
  const counts = await db
    .select({ newsId: newsComments.newsId, total: count() })
    .from(newsComments)
    .where(eq(newsComments.status, 'published'))
    .groupBy(newsComments.newsId)
  const byNews = new Map(counts.map((c) => [c.newsId, c.total]))
  return json(
    { news: rows.map((n) => serializeNews(n, { comments: byNews.get(n.id) ?? 0 })) },
    { headers: { 'cache-control': 'public, max-age=30, stale-while-revalidate=120' } },
  )
})
