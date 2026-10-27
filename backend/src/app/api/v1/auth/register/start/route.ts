import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import { env } from '@/lib/env'
import { ApiError, json, readJson, route } from '@/lib/http'
import { issueRegisterCode } from '@/lib/phone-verification'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { telegramEnabled } from '@/lib/telegram'
import { registerStartSchema } from '@/lib/validation'

/**
 * Ro‘yxatdan o‘tish, 1-qadam: raqam bo‘sh ekanini tekshiradi va bot havolasini qaytaradi.
 * Kodni bot beradi — foydalanuvchi botga «Raqamni yuborish» tugmasi bilan o‘z kontaktini yuboradi
 * (src/lib/telegram-bot.ts). Dev rejimda bot sozlanmagan bo‘lsa kod javobda qaytariladi (devCode).
 */
export const POST = route(async (request) => {
  const { phone } = await readJson(request, registerStartSchema)
  await rateLimit(`register-start:ip:${clientIp(request)}`, 20, 60 * 60_000)

  const db = await getDb()
  const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1)
  if (taken) throw new ApiError(409, 'PHONE_TAKEN', 'Bu raqam bilan hisob allaqachon mavjud. «Kirish» orqali kiring', 'phone')

  const botUrl = `https://t.me/${env.telegram.username}?start=reg`
  if (telegramEnabled()) return json({ botUrl })

  if (env.isProd) {
    throw new ApiError(503, 'REGISTER_UNAVAILABLE', 'Ro‘yxatdan o‘tish vaqtincha ishlamayapti. Keyinroq urinib ko‘ring')
  }
  await rateLimit(`register-start:phone:${phone}`, 5, 15 * 60_000)
  return json({ botUrl, devCode: await issueRegisterCode(phone, null) })
})
