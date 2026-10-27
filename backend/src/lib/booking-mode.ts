import type { BookingMode } from '@/db/schema'

/**
 * Eski ma’lumotlar uchun bron rejimini taxmin qiladi (seed va 0009 migratsiyasi bilan bir xil qoida):
 * onlayn — ariza; oylik / kelishiladi / ish vaqti aniq emas — qo‘ng‘iroq; soat va seans — slot;
 * qolgani (dars, bepul) — ariza.
 */
export function inferBookingMode(service: { type: string; price: string; hours: string | null }): BookingMode {
  const price = service.price.toLowerCase()
  if (service.type === 'remote') return 'request'
  if (/\/\s*oy|kelishiladi/.test(price) || !/^(\d{1,2}:\d{2}\s*-|24\/7)/.test(service.hours?.trim() ?? '')) return 'call'
  if (/\/\s*(soat|seans)/.test(price)) return 'slot'
  return 'request'
}
