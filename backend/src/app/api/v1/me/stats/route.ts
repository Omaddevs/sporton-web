import { and, count, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings, favorites, reviews } from '@/db/schema'
import { requireUser } from '@/lib/auth'
import { json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

/** Profil statistikasi — faqat haqiqiy ma’lumotlardan */
export const GET = route(async () => {
  const user = await requireUser()
  const db = await getDb()
  const [[b], [done], [fav], [rev]] = await Promise.all([
    db.select({ n: count() }).from(bookings).where(eq(bookings.userId, user.id)),
    db.select({ n: count() }).from(bookings).where(and(eq(bookings.userId, user.id), eq(bookings.status, 'completed'))),
    db.select({ n: count() }).from(favorites).where(eq(favorites.userId, user.id)),
    db.select({ n: count() }).from(reviews).where(eq(reviews.userId, user.id)),
  ])
  return json({ stats: { bookings: b.n, completed: done.n, favorites: fav.n, reviews: rev.n } })
})
