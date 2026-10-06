'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { BOOKING_STATUSES, bookings, complexes, services, type Booking, type BookingStatus } from '@/db/schema'
import { requireStaff } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { notifyUserSafe } from '@/lib/notify'

export async function setBookingStatus(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const status = String(form.get('status')) as BookingStatus
  const back = String(form.get('back') || '/admin/bookings')
  if (!BOOKING_STATUSES.includes(status)) redirect(`${back}${back.includes('?') ? '&' : '?'}error=${encodeURIComponent('Noto‘g‘ri holat')}`)

  const db = await getDb()
  const [booking] = await db
    .update(bookings)
    .set({ status, adminNote: String(form.get('adminNote') ?? '').trim() || undefined })
    .where(eq(bookings.id, id))
    .returning()
  if (booking) {
    await audit(actor.id, `booking.${status}`, 'booking', id, { code: booking.code })
    notifyBookingStatus(booking, status)
  }
  revalidatePath('/admin', 'layout')
  redirect(back)
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
  const message = messages[status]
  // Yakunlanganda — faqat ilovada (Telegram/push bilan bezovta qilmaymiz)
  notifyUserSafe(booking.userId, { type: 'booking', ...message }, status === 'completed' ? { telegram: false, push: false } : undefined)
}
