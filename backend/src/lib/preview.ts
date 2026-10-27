import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { env } from './env'

const TTL_MS = 2 * 60 * 60_000

const sign = (id: string, exp: number) =>
  createHmac('sha256', `${env.authSecret}:preview`).update(`${id}.${exp}`).digest('base64url')

/** Qoralama majmuani saytda ko‘rish uchun 2 soatlik havola tokeni (admin va egasiga) */
export function previewToken(complexId: string) {
  const exp = Date.now() + TTL_MS
  return `${exp}.${sign(complexId, exp)}`
}

export function verifyPreviewToken(complexId: string, token: string | null) {
  const [expRaw, sig] = (token ?? '').split('.')
  const exp = Number(expRaw)
  if (!sig || !Number.isFinite(exp) || exp < Date.now()) return false
  const a = Buffer.from(sig)
  const b = Buffer.from(sign(complexId, exp))
  return a.length === b.length && timingSafeEqual(a, b)
}
