import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/db'
import { bookings } from '@/db/schema'
import { requireUser } from '@/lib/auth'
import { tashkentNow } from '@/lib/booking'
import { ApiError, json, notFound, readJson, route } from '@/lib/http'

const CANCEL_BEFORE_HOURS = 3

/** Foydalanuvchi o‘z bronini bekor qiladi (boshlanishiga kamida 3 soat qolganda) */
export const PATCH = route<{ id: string }>(async (request, { params }) => {
  const user = await requireUser()
  const { id } = await params
  await readJson(request, z.object({ status: z.literal('cancelled') }))
  const db = await getDb()
  const [booking] = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.userId, user.id)))
    .limit(1)
  if (!booking) throw notFound('Bron')
  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    throw new ApiError(400, 'NOT_CANCELLABLE', 'Bu bronni bekor qilib bo‘lmaydi')
  }
  if (booking.date && booking.hour != null) {
    const now = tashkentNow()
    const startsIn =
      (Date.parse(`${booking.date}T00:00:00Z`) - Date.parse(`${now.date}T00:00:00Z`)) / 3_600_000 +
      booking.hour -
      now.hour
    if (startsIn < CANCEL_BEFORE_HOURS) {
      throw new ApiError(400, 'TOO_LATE', `Bronni kamida ${CANCEL_BEFORE_HOURS} soat oldin bekor qilish mumkin`)
    }
  }
  const [updated] = await db.update(bookings).set({ status: 'cancelled' }).where(eq(bookings.id, id)).returning()
  return json({ booking: updated })
})
