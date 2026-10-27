import 'server-only'
import { lt, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { rateLimits } from '@/db/schema'
import { ApiError } from './http'

let lastCleanup = 0

/**
 * Bazadagi cheklovchi: server qayta ishga tushganda nolga tushmaydi va bir nechta instansiyada ham
 * umumiy. Bitta atomik so‘rov — oyna tugagan bo‘lsa hisob 1 dan boshlanadi, aks holda +1.
 */
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const db = await getDb()
  const resetAt = new Date(Date.now() + windowMs)
  const [row] = await db
    .insert(rateLimits)
    .values({ key, count: 1, resetAt })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.resetAt} <= now() then 1 else ${rateLimits.count} + 1 end`,
        resetAt: sql`case when ${rateLimits.resetAt} <= now() then excluded.reset_at else ${rateLimits.resetAt} end`,
      },
    })
    .returning({ count: rateLimits.count, resetAt: rateLimits.resetAt })

  // Eskirgan yozuvlarni vaqti-vaqti bilan tozalaymiz (jadval o‘smasin)
  if (Date.now() - lastCleanup > 10 * 60_000) {
    lastCleanup = Date.now()
    void db.delete(rateLimits).where(lt(rateLimits.resetAt, new Date())).catch(() => null)
  }

  if (row.count > limit) {
    const seconds = Math.max(1, Math.ceil((row.resetAt.getTime() - Date.now()) / 1000))
    throw new ApiError(429, 'RATE_LIMITED', `Juda ko‘p urinish. ${seconds} soniyadan so‘ng qayta urinib ko‘ring`)
  }
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'local'
}
