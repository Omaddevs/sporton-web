/** "2026-10-05" → "05.10.2026" */
export function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return d && m && y ? `${d}.${m}.${y}` : iso
}

const todayIso = () => new Date().toISOString().slice(0, 10)

export const isUpcoming = (booking) =>
  (booking.status === 'pending' || booking.status === 'confirmed') && (booking.flexible || booking.date >= todayIso())

/** Bronlar: eng yaqin kelajakdagilar tepada, keyin o‘tganlar (yangidan eskiga) */
export function sortBookings(list) {
  return [...list].sort((a, b) => {
    const ua = isUpcoming(a)
    const ub = isUpcoming(b)
    if (ua !== ub) return ua ? -1 : 1
    return ua ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
  })
}
