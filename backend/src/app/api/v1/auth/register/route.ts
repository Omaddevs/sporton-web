import { getDb } from '@/db'
import { users } from '@/db/schema'
import { hashPassword, publicUser, setSessionCookie } from '@/lib/auth'
import { ApiError, json, readJson, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { registerSchema } from '@/lib/validation'
import { eq } from 'drizzle-orm'

export const POST = route(async (request) => {
  rateLimit(`register:${clientIp(request)}`, 10, 60 * 60_000)
  const data = await readJson(request, registerSchema)
  const db = await getDb()

  const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.phone, data.phone)).limit(1)
  if (taken) throw new ApiError(409, 'PHONE_TAKEN', 'Bu raqam bilan hisob allaqachon mavjud', 'phone')

  const [user] = await db
    .insert(users)
    .values({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      passwordHash: await hashPassword(data.password),
      provider: 'phone',
      consentAt: new Date(),
      lastLoginAt: new Date(),
    })
    .returning()

  await setSessionCookie(user)
  return json({ user: publicUser(user) }, { status: 201 })
})
