import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import { publicUser, setSessionCookie, verifyPassword } from '@/lib/auth'
import { ApiError, json, readJson, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { loginSchema } from '@/lib/validation'

export const POST = route(async (request) => {
  const data = await readJson(request, loginSchema)
  rateLimit(`login:ip:${clientIp(request)}`, 30, 15 * 60_000)
  rateLimit(`login:phone:${data.phone}`, 8, 15 * 60_000)

  const db = await getDb()
  const [user] = await db.select().from(users).where(eq(users.phone, data.phone)).limit(1)
  const ok = await verifyPassword(data.password, user?.passwordHash)
  if (!user || !ok) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Telefon raqam yoki parol noto‘g‘ri')
  if (user.status !== 'active') throw new ApiError(403, 'BLOCKED', 'Hisobingiz bloklangan. Qo‘llab-quvvatlash xizmatiga murojaat qiling')

  const [updated] = await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id)).returning()
  await setSessionCookie(updated)
  return json({ user: publicUser(updated) })
})
