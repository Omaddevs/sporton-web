import 'server-only'
import { and, eq, inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings, complexes, services, type Booking, type BookingStatus } from '@/db/schema'
import { audit } from './audit'
import { notifyUserSafe } from './notify'

/** Ruxsat etilgan o‘tishlar: yakunlangan/bekor qilingan bron qayta o‘zgarmaydi */
const ALLOWED_FROM: Record<Exclude<BookingStatus, 'pending'>, BookingStatus[]> = {
  confirmed: ['pending'],
  completed: ['confirmed'],
  cancelled: ['pending', 'confirmed'],
}

/**
 * Bron holatini o‘zgartiradi (admin va majmua egasi uchun umumiy). complexIds berilsa — faqat
 * shu majmualarning bronlari (egasi boshqa majmua bronini o‘zgartira olmaydi).
 */
export async function changeBookingStatus(input: {
  bookingId: string
  status: BookingStatus
  note?: string | null
  actorId: string
  complexIds?: string[]
}) {
  if (input.status === 'pending') throw new Error('Noto‘g‘ri holat')
  const db = await getDb()
  const where = [eq(bookings.id, input.bookingId), inArray(bookings.status, ALLOWED_FROM[input.status])]
  if (input.complexIds) where.push(inArray(bookings.complexId, input.complexIds.length ? input.complexIds : ['—']))
  const [booking] = await db
    .update(bookings)
    .set({ status: input.status, adminNote: input.note?.trim() || undefined })
    .where(and(...where))
    .returning()
  if (!booking) throw new Error('Bronni bu holatga o‘tkazib bo‘lmaydi (holati o‘zgargan yoki sizga tegishli emas)')
  await audit(input.actorId, `booking.${input.status}`, 'booking', booking.id, { code: booking.code })
  void notifyBookingStatus(booking, input.status)
  return booking
}

const pad = (n: number) => String(n).padStart(2, '0')

async function notifyBookingStatus(booking: Booking, status: BookingStatus) {
  if (!booking.userId || status === 'pending') return
  const db = await getDb()
  const [info] = await db
    .select({ service: services.title, complex: complexes.name })
    .from(services)
    .innerJoin(complexes, eq(complexes.id, services.complexId))
    .where(eq(services.id, booking.serviceId))
    .limit(1)
  const what = `«${info?.service ?? 'Xizmat'}» — ${info?.complex ?? ''}`
  const when = booking.date && booking.hour != null ? `, ${booking.date.split('-').reverse().join('.')} ${pad(booking.hour)}:00` : ''
  const note = booking.adminNote ? ` Izoh: ${booking.adminNote}` : ''
  const messages = {
    confirmed: { title: 'Bron tasdiqlandi ✅', body: `${booking.code} · ${what}${when}. Sizni kutamiz!${note}`, link: '/profil?bolim=bronlar' },
    cancelled: { title: 'Bron bekor qilindi', body: `${booking.code} · ${what}${when}.${note || ' Boshqa vaqtni tanlab, qayta bron qilishingiz mumkin.'}`, link: `/sport-majmua/${booking.complexId}` },
    completed: { title: 'Mashg‘ulot yakunlandi', body: `${what} — tashrifingiz uchun rahmat! Taassurotlaringizni sharhda qoldiring.`, link: `/sport-majmua/${booking.complexId}#sharhlar` },
  } as const
  // Yakunlanganda — faqat ilovada (Telegram/push bilan bezovta qilmaymiz)
  notifyUserSafe(booking.userId, { type: 'booking', ...messages[status] }, status === 'completed' ? { telegram: false, push: false } : undefined)
}
