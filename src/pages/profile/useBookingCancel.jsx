import { useState } from 'react'
import { ConfirmModal } from './ProfileModal.jsx'
import { formatDate } from './profileUtils.js'
import { cancelBooking } from '../../hooks/useBookings.js'

export function useBookingCancel(_profile, _update, notify) {
  const [target, setTarget] = useState(null)
  const modal = (
    <ConfirmModal
      open={Boolean(target)}
      title="Bronni bekor qilasizmi?"
      text={
        target
          ? `«${target.title}» — ${target.place}, ${formatDate(target.date)} ${target.time}. Bron boshlanishiga kamida 3 soat qolgan bo‘lsa, bepul bekor qilinadi.`
          : ''
      }
      confirmLabel="Ha, bekor qilish"
      onClose={() => setTarget(null)}
      onConfirm={async () => {
        try {
          await cancelBooking(target.id)
          notify('Bron bekor qilindi')
        } catch (err) {
          notify(err.message)
        }
        setTarget(null)
      }}
    />
  )
  return [setTarget, modal]
}
