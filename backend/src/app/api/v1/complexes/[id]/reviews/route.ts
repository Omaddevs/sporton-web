import { and, desc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, reviews } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { invalidateCatalog } from '@/lib/catalog'
import { json, notFound, readJson, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { reviewSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export const GET = route<{ id: string }>(async (_request, { params }) => {
  const { id } = await params
  const db = await getDb()
  const rows = await db
    .select({
      id: reviews.id,
      author: reviews.authorName,
      rating: reviews.rating,
      text: reviews.text,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(and(eq(reviews.complexId, id), eq(reviews.status, 'published')))
    .orderBy(desc(reviews.createdAt))
    .limit(100)
  return json({ reviews: rows })
})

export const POST = route<{ id: string }>(async (request, { params }) => {
  const { id } = await params
  rateLimit(`review:${clientIp(request)}`, 5, 60 * 60_000)
  const data = await readJson(request, reviewSchema)
  const user = await getCurrentUser()
  const db = await getDb()

  const [complex] = await db.select({ id: complexes.id }).from(complexes).where(eq(complexes.id, id)).limit(1)
  if (!complex) throw notFound('Majmua')

  const authorName = user ? `${user.firstName} ${user.lastName}`.trim() : data.name || 'Mehmon'
  const [review] = await db
    .insert(reviews)
    .values({ complexId: id, userId: user?.id ?? null, authorName, rating: data.rating, text: data.text })
    .returning()
  invalidateCatalog()
  return json(
    { review: { id: review.id, author: review.authorName, rating: review.rating, text: review.text, createdAt: review.createdAt } },
    { status: 201 },
  )
})
