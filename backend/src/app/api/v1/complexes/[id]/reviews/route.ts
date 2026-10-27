import { and, desc, eq, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, reviews } from '@/db/schema'
import { requireUser } from '@/lib/auth'
import { invalidateCatalog } from '@/lib/catalog'
import { ApiError, json, notFound, readJson, route } from '@/lib/http'
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
  // Sharhni faqat ro‘yxatdan o‘tgan (raqami tasdiqlangan) foydalanuvchi yozadi
  const user = await requireUser()
  if (!user.phoneVerifiedAt) {
    throw new ApiError(403, 'PHONE_NOT_VERIFIED', 'Sharh yozish uchun raqamingizni Telegram bot orqali tasdiqlang (Profil → Raqamni tasdiqlash)')
  }
  await rateLimit(`review:${user.id}`, 5, 60 * 60_000)
  await rateLimit(`review:${clientIp(request)}`, 20, 60 * 60_000)
  const data = await readJson(request, reviewSchema)
  const db = await getDb()

  const [complex] = await db
    .select({ id: complexes.id })
    .from(complexes)
    .where(and(eq(complexes.id, id), eq(complexes.status, 'published')))
    .limit(1)
  if (!complex) throw notFound('Majmua')

  const authorName = `${user.firstName} ${user.lastName}`.trim()
  // Bitta foydalanuvchi — bitta majmuaga bitta sharh: qayta yozsa avvalgisi yangilanadi
  const [review] = await db
    .insert(reviews)
    .values({ complexId: id, userId: user.id, authorName, rating: data.rating, text: data.text })
    .onConflictDoUpdate({
      target: [reviews.complexId, reviews.userId],
      targetWhere: sql`user_id is not null`,
      // Holat (admin yashirgan bo‘lsa) saqlanadi — tahrir moderatsiyani chetlab o‘tmasin
      set: { authorName, rating: data.rating, text: data.text, createdAt: new Date() },
    })
    .returning()
  invalidateCatalog()
  return json(
    { review: { id: review.id, author: review.authorName, rating: review.rating, text: review.text, createdAt: review.createdAt } },
    { status: 201 },
  )
})
