import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { news, newsComments } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { json, notFound, readJson, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { commentSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

const shape = (c: typeof newsComments.$inferSelect) => ({
  id: c.id,
  author: c.authorName,
  text: c.text,
  createdAt: c.createdAt,
})

export const GET = route<{ id: string }>(async (_request, { params }) => {
  const { id } = await params
  const db = await getDb()
  const rows = await db
    .select()
    .from(newsComments)
    .where(and(eq(newsComments.newsId, id), eq(newsComments.status, 'published')))
    .orderBy(desc(newsComments.createdAt))
    .limit(200)
  return json({ comments: rows.map(shape) })
})

export const POST = route<{ id: string }>(async (request, { params }) => {
  const { id } = await params
  rateLimit(`comment:${clientIp(request)}`, 10, 60 * 60_000)
  const data = await readJson(request, commentSchema)
  const user = await getCurrentUser()
  const db = await getDb()
  const [exists] = await db.select({ id: news.id }).from(news).where(eq(news.id, id)).limit(1)
  if (!exists) throw notFound('Yangilik')
  const [comment] = await db
    .insert(newsComments)
    .values({
      newsId: id,
      userId: user?.id ?? null,
      authorName: user ? `${user.firstName} ${user.lastName}`.trim() : data.name || 'Mehmon',
      text: data.text,
    })
    .returning()
  return json({ comment: shape(comment) }, { status: 201 })
})
