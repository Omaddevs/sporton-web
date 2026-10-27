import { getDb } from '@/db'
import { users } from '@/db/schema'
import { hashPassword, publicUser, setSessionCookie } from '@/lib/auth'
import { ApiError, json, readJson, route } from '@/lib/http'
import { isUniqueViolation } from '@/lib/booking'
import { consumeRegisterCode } from '@/lib/phone-verification'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { registerSchema } from '@/lib/validation'
import { eq } from 'drizzle-orm'

/** Ro‘yxatdan o‘tish, 2-qadam: Telegram bot bergan kod bilan raqam tasdiqlanadi va hisob yaratiladi */
export const POST = route(async (request) => {
  await rateLimit(`register:${clientIp(request)}`, 20, 60 * 60_000)
  const data = await readJson(request, registerSchema)
  const db = await getDb()

  const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.phone, data.phone)).limit(1)
  if (taken) throw new ApiError(409, 'PHONE_TAKEN', 'Bu raqam bilan hisob allaqachon mavjud', 'phone')

  const { chatId } = await consumeRegisterCode(data.phone, data.code)

  let user
  try {
    ;[user] = await db
      .insert(users)
      .values({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        passwordHash: await hashPassword(data.password),
        provider: 'phone',
        // Kodni bergan bot chati — bron va eslatmalar shu yerga keladi
        telegramChatId: chatId,
        phoneVerifiedAt: new Date(),
        consentAt: new Date(),
        lastLoginAt: new Date(),
      })
      .returning()
  } catch (error) {
    if (isUniqueViolation(error)) throw new ApiError(409, 'PHONE_TAKEN', 'Bu raqam bilan hisob allaqachon mavjud', 'phone')
    throw error
  }

  await setSessionCookie(user)
  return json({ user: publicUser(user) }, { status: 201 })
})
