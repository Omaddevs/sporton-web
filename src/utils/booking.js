import { tr } from '../i18n/index.js'
/**
 * Xizmatni qanday band qilish mumkin (admin panelda tanlanadi):
 * slot — sana va soat tanlanadi; request — vaqtsiz ariza, majmua qo‘ng‘iroq qiladi;
 * call — onlayn bron yo‘q, faqat telefon/Telegram.
 */
export const BOOKING_MODES = {
  slot: { label: tr('Soatlik bron'), cta: tr('Bron qilish') },
  request: { label: tr('Ariza orqali'), cta: tr('Ariza qoldirish') },
  call: { label: tr('Qo‘ng‘iroq orqali'), cta: tr('Qo‘ng‘iroq qilish') },
}

const TIMED_HOURS = /^(\d{1,2}:\d{2}\s*-|24\/7)/

/** Backend bermagan (ichki zaxira) ma’lumotlar uchun — backenddagi inferBookingMode bilan bir xil qoida */
function inferBookingMode(service) {
  const price = (service.salary ?? service.price ?? '').toLowerCase()
  if (service.type === 'remote') return 'request'
  if (/\/\s*oy|kelishiladi/.test(price) || !TIMED_HOURS.test(service.hours?.trim() ?? '')) return 'call'
  if (/\/\s*(soat|seans)/.test(price)) return 'slot'
  return 'request'
}

export function bookingModeOf(service) {
  return BOOKING_MODES[service?.bookingMode] ? service.bookingMode : inferBookingMode(service ?? {})
}

/** Sana va soat tanlanadimi */
export function isTimedService(service) {
  return bookingModeOf(service) === 'slot' && TIMED_HOURS.test(service?.hours?.trim() ?? '')
}
