import 'server-only'
import { ApiError } from './http'

type Bucket = { count: number; resetAt: number }

const globalStore = globalThis as unknown as { __sportonRate?: Map<string, Bucket> }
const buckets = (globalStore.__sportonRate ??= new Map())

/**
 * Oddiy xotiradagi (bitta server jarayoni uchun) cheklovchi. Bir nechta instansiyada
 * ishlatilsa — Redis’ga ko‘chirish kerak (interfeys o‘zgarmaydi).
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
    }
    return
  }
  bucket.count += 1
  if (bucket.count > limit) {
    const seconds = Math.ceil((bucket.resetAt - now) / 1000)
    throw new ApiError(429, 'RATE_LIMITED', `Juda ko‘p urinish. ${seconds} soniyadan so‘ng qayta urinib ko‘ring`)
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
}
