import 'server-only'
import { randomBytes } from 'node:crypto'

/** Toshkent vaqti (UTC+5, yozgi vaqt yo‘q) */
const TZ_OFFSET_MS = 5 * 60 * 60_000

export function tashkentNow() {
  const d = new Date(Date.now() + TZ_OFFSET_MS)
  return { date: d.toISOString().slice(0, 10), hour: d.getUTCHours() }
}

export function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** «07:00 - 23:00» → {open: 7, close: 23}; «24/7» → {0, 24}; aniq bo‘lmasa null */
export function parseHours(hours: string | null | undefined) {
  if (!hours) return null
  if (hours.trim() === '24/7') return { open: 0, close: 24 }
  const match = /^(\d{1,2}):\d{2}\s*-\s*(\d{1,2}):\d{2}/.exec(hours.trim())
  if (!match) return null
  const open = Number(match[1])
  let close = Number(match[2])
  if (close <= open) close = 24
  return { open, close }
}

/** Sana/vaqt tanlanadigan xizmatmi (frontend mantiqi bilan bir xil) */
export function isTimedService(service: { type: string; hours: string | null }) {
  return service.type !== 'remote' && /^\d/.test(service.hours ?? '')
}

export function bookingCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(6)
  return `SP-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`
}

export function isUniqueViolation(error: unknown) {
  const e = error as { code?: string; cause?: { code?: string } }
  return e?.code === '23505' || e?.cause?.code === '23505'
}

export const BOOKING_STATUS_LABELS = {
  pending: 'Tasdiqlanmoqda',
  confirmed: 'Tasdiqlangan',
  completed: 'Yakunlandi',
  cancelled: 'Bekor qilingan',
} as const
