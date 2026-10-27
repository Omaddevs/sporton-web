'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { BOOKING_STATUSES, type BookingStatus } from '@/db/schema'
import { changeBookingStatus } from '@/lib/booking-status'
import { requireOwner } from '@/lib/owner'

const DONE: Record<string, string> = {
  confirmed: 'Bron tasdiqlandi — mijozga xabar yuborildi',
  cancelled: 'Bron bekor qilindi — mijozga xabar yuborildi',
  completed: 'Bron yakunlandi',
}

/** Egasi faqat o‘z majmualarining bronlarini boshqaradi (changeBookingStatus complexIds bilan cheklaydi) */
export async function ownerSetBookingStatus(form: FormData) {
  const { user, complexIds } = await requireOwner()
  const status = String(form.get('status')) as BookingStatus
  const back = String(form.get('back') || '/kabinet/bronlar')
  const go = (kind: 'ok' | 'error', message: string) =>
    redirect(`${back}${back.includes('?') ? '&' : '?'}${kind}=${encodeURIComponent(message)}`)
  if (!BOOKING_STATUSES.includes(status) || status === 'pending') go('error', 'Noto‘g‘ri holat')

  try {
    await changeBookingStatus({
      bookingId: String(form.get('id')),
      status,
      note: String(form.get('note') ?? ''),
      actorId: user.id,
      complexIds,
    })
  } catch (error) {
    go('error', (error as Error).message)
  }
  revalidatePath('/kabinet', 'layout')
  go('ok', DONE[status])
}
