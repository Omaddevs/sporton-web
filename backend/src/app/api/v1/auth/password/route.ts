import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import { hashPassword, requireUser, setSessionCookie, verifyPassword } from '@/lib/auth'
import { ApiError, json, readJson, route } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'
import { changePasswordSchema } from '@/lib/validation'

export const POST = route(async (request) => {
  const user = await requireUser()
  await rateLimit(`password:${user.id}`, 10, 15 * 60_000)
  const data = await readJson(request, changePasswordSchema)

  if (!(await verifyPassword(data.currentPassword, user.passwordHash))) {
    throw new ApiError(400, 'INVALID_PASSWORD', 'Joriy parol noto‘g‘ri', 'currentPassword')
  }
  if (data.newPassword === data.currentPassword) {
    throw new ApiError(400, 'SAME_PASSWORD', 'Yangi parol joriy paroldan farq qilishi kerak', 'newPassword')
  }

  const db = await getDb()
  // tokenVersion oshadi — boshqa qurilmalardagi sessiyalar yopiladi, joriy sessiya yangilanadi
  const [updated] = await db
    .update(users)
    .set({ passwordHash: await hashPassword(data.newPassword), tokenVersion: user.tokenVersion + 1 })
    .where(eq(users.id, user.id))
    .returning()
  await setSessionCookie(updated)
  return json({ ok: true })
})
