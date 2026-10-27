import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import { env } from '@/lib/env'
import { ApiError, json, readJson, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { issueResetCode } from '@/lib/reset'
import { sendTelegram, telegramEnabled } from '@/lib/telegram'
import { resetRequestSchema } from '@/lib/validation'

/**
 * 1-qadam. Raqam bazada borligini tekshiradi. Kodni Telegram bot beradi (foydalanuvchi botga
 * kontaktini yuboradi). Bot avval ulangan bo‘lsa — kod darhol o‘sha chatga yuboriladi.
 * Dev rejimda bot bo‘lmasa kod javobda qaytariladi (devCode).
 */
export const POST = route(async (request) => {
  const { phone } = await readJson(request, resetRequestSchema)
  await rateLimit(`reset:ip:${clientIp(request)}`, 15, 60 * 60_000)
  await rateLimit(`reset:phone:${phone}`, 5, 15 * 60_000)

  const db = await getDb()
  const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1)
  if (!user || user.status !== 'active') {
    throw new ApiError(404, 'PHONE_NOT_FOUND', 'Bu raqam bilan ro‘yxatdan o‘tilmagan', 'phone')
  }

  const botUrl = `https://t.me/${env.telegram.username}?start=reset`

  if (telegramEnabled()) {
    if (user.telegramChatId) {
      const code = await issueResetCode(user.id)
      await sendTelegram(user.telegramChatId, `SportON: parolni tiklash kodi — ${code}\nKod 5 daqiqa amal qiladi. Uni hech kimga bermang.`)
      return json({ sentAt: Date.now(), botUrl, delivered: true })
    }
    return json({ sentAt: Date.now(), botUrl, delivered: false })
  }

  if (env.isProd) {
    throw new ApiError(503, 'RESET_UNAVAILABLE', 'Parolni tiklash vaqtincha ishlamayapti. Qo‘llab-quvvatlash xizmatiga yozing')
  }
  const code = await issueResetCode(user.id)
  return json({ sentAt: Date.now(), botUrl, delivered: false, devCode: code })
})
