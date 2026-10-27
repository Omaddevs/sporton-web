'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { BOOKING_STATUSES, type BookingStatus } from '@/db/schema'
import { requireStaff } from '@/lib/admin'
import { changeBookingStatus } from '@/lib/booking-status'

export async function setBookingStatus(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const status = String(form.get('status')) as BookingStatus
  const back = String(form.get('back') || '/admin/bookings')
  const fail = (message: string) => redirect(`${back}${back.includes('?') ? '&' : '?'}error=${encodeURIComponent(message)}`)
  if (!BOOKING_STATUSES.includes(status)) fail('Noto‘g‘ri holat')

  try {
    await changeBookingStatus({ bookingId: id, status, note: String(form.get('adminNote') ?? ''), actorId: actor.id })
  } catch (error) {
    fail((error as Error).message)
  }
  revalidatePath('/admin', 'layout')
  redirect(back)
}
