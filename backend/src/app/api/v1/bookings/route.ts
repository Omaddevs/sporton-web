import { panelUrl } from '@/lib/env'
import { and, count, desc, eq, inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings, complexes, services } from '@/db/schema'
import { requireUser } from '@/lib/auth'
import { addDays, bookingCode, isTimedService, isUniqueViolation, parseHours, tashkentNow } from '@/lib/booking'
import { ApiError, json, notFound, readJson, route } from '@/lib/http'
import { formatPhone } from '@/lib/phone'
import { rateLimit } from '@/lib/rate-limit'
import { notifyUserSafe } from '@/lib/notify'
import { notifyAdmins } from '@/lib/telegram'
import { bookingSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

const MAX_ACTIVE = 5
const MAX_DAYS_AHEAD = 30

export const GET = route(async () => {
  const user = await requireUser()
  const db = await getDb()
  const rows = await db
    .select({
      id: bookings.id,
      code: bookings.code,
      status: bookings.status,
      date: bookings.date,
      hour: bookings.hour,
      priceLabel: bookings.priceLabel,
      createdAt: bookings.createdAt,
      serviceId: bookings.serviceId,
      serviceTitle: services.title,
      complexId: bookings.complexId,
      complexName: complexes.name,
      location: complexes.location,
    })
    .from(bookings)
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(complexes, eq(complexes.id, bookings.complexId))
    .where(eq(bookings.userId, user.id))
    .orderBy(desc(bookings.createdAt))
    .limit(100)
  return json({ bookings: rows })
})

export const POST = route(async (request) => {
  const user = await requireUser()
  await rateLimit(`booking:${user.id}`, 20, 60 * 60_000)
  const data = await readJson(request, bookingSchema)
  const db = await getDb()

  const [row] = await db
    .select({ service: services, complexStatus: complexes.status, complexName: complexes.name, ownerId: complexes.ownerId })
    .from(services)
    .innerJoin(complexes, eq(complexes.id, services.complexId))
    .where(eq(services.id, data.serviceId))
    .limit(1)
  if (!row || row.service.status !== 'published' || row.complexStatus !== 'published') throw notFound('Xizmat')
  const service = row.service
  if (service.bookingMode === 'call') {
    throw new ApiError(422, 'BOOKING_DISABLED', 'Bu xizmatni onlayn band qilib bo‘lmaydi. Majmuaga qo‘ng‘iroq qiling')
  }

  let date: string | null = null
  let hour: number | null = null
  if (isTimedService(service)) {
    if (!data.date || data.hour == null) throw new ApiError(422, 'SLOT_REQUIRED', 'Sana va vaqtni tanlang', 'hour')
    const now = tashkentNow()
    if (data.date < now.date || data.date > addDays(now.date, MAX_DAYS_AHEAD)) {
      throw new ApiError(422, 'DATE_OUT_OF_RANGE', `Bron faqat ${MAX_DAYS_AHEAD} kun ichida mumkin`, 'date')
    }
    if (data.date === now.date && data.hour <= now.hour) {
      throw new ApiError(422, 'SLOT_PAST', 'Bu vaqt o‘tib ketgan. Boshqa vaqtni tanlang', 'hour')
    }
    const range = parseHours(service.hours)
    if (range && (data.hour < range.open || data.hour >= range.close)) {
      throw new ApiError(422, 'SLOT_CLOSED', 'Majmua bu vaqtda ishlamaydi', 'hour')
    }
    date = data.date
    hour = data.hour
  }

  const [{ value: active }] = await db
    .select({ value: count() })
    .from(bookings)
    .where(and(eq(bookings.userId, user.id), inArray(bookings.status, ['pending'])))
  if (active >= MAX_ACTIVE) {
    throw new ApiError(429, 'TOO_MANY_BOOKINGS', `Bir vaqtda ${MAX_ACTIVE} tadan ortiq tasdiqlanmagan bron bo‘lishi mumkin emas`)
  }

  try {
    const [booking] = await db
      .insert(bookings)
      .values({
        code: bookingCode(),
        userId: user.id,
        serviceId: service.id,
        complexId: service.complexId,
        customerName: data.name,
        customerPhone: data.phone,
        date,
        hour,
        priceLabel: service.price,
        priceValue: service.priceValue,
        note: data.note || null,
      })
      .returning()

    notifyUserSafe(
      user.id,
      {
        type: 'booking',
        title: 'Bron qabul qilindi',
        body: `${booking.code} · «${service.title}» — ${row.complexName}${date ? `, ${date.split('-').reverse().join('.')} ${String(hour).padStart(2, '0')}:00` : ''}. Majmua tasdiqlagach xabar beramiz.`,
        link: '/profil?bolim=bronlar',
      },
      { telegram: false, push: false },
    )
    notifyAdmins('🆕 Yangi bron', [
      `${booking.code} · ${row.complexName}`,
      service.title,
      date ? `${date} · ${String(hour).padStart(2, '0')}:00` : 'Vaqt: kelishiladi',
      `${data.name} · ${formatPhone(data.phone)}`,
    ])
    // Majmua egasiga — sayt, Telegram va push orqali (kabinetda tasdiqlaydi)
    notifyUserSafe(row.ownerId, {
      type: 'booking',
      title: date ? '🆕 Yangi bron' : '🆕 Yangi ariza',
      body: `${booking.code} · ${service.title}${date ? `, ${date.split('-').reverse().join('.')} ${String(hour).padStart(2, '0')}:00` : ''} — ${data.name}, ${formatPhone(data.phone)}. Kabinetda tasdiqlang.`,
      link: panelUrl('/kabinet/bronlar?status=pending'),
    })
    return json({ booking }, { status: 201 })
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ApiError(409, 'SLOT_TAKEN', 'Bu vaqt hozirgina band qilindi. Boshqa vaqtni tanlang', 'hour')
    }
    throw error
  }
})
