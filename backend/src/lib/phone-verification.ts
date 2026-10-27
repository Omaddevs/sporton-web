import 'server-only'
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { getDb } from '@/db'
import { phoneVerifications } from '@/db/schema'
import { env } from './env'
import { ApiError } from './http'

const CODE_TTL_MS = 5 * 60_000
const MAX_ATTEMPTS = 5

const hashCode = (phone: string, code: string) =>
  createHmac('sha256', env.authSecret).update(`register:${phone}:${code}`).digest('hex')

/**
 * Ro‘yxatdan o‘tish kodi. Bot foydalanuvchining o‘z kontaktidan olingan raqam bilan chaqiradi —
 * shuning uchun kod faqat Telegram hisobiga bog‘langan raqamga beriladi. Avvalgi kodlar bekor qilinadi.
 */
export async function issueRegisterCode(phone: string, chatId: string | null) {
  const db = await getDb()
  const code = String(randomInt(100000, 1000000))
  await db
    .update(phoneVerifications)
    .set({ consumedAt: new Date() })
    .where(and(eq(phoneVerifications.phone, phone), isNull(phoneVerifications.consumedAt)))
  await db.insert(phoneVerifications).values({
    phone,
    chatId,
    codeHash: hashCode(phone, code),
    expiresAt: new Date(Date.now() + CODE_TTL_MS),
  })
  return code
}

/** Kodni tekshiradi va bir martalik qilib yopadi. Qaytaradi: botdagi chat id (bildirishnomalar uchun) */
export async function consumeRegisterCode(phone: string, code: string) {
  const db = await getDb()
  const [entry] = await db
    .select()
    .from(phoneVerifications)
    .where(and(eq(phoneVerifications.phone, phone), isNull(phoneVerifications.consumedAt)))
    .orderBy(desc(phoneVerifications.createdAt))
    .limit(1)
  if (!entry || entry.expiresAt.getTime() < Date.now() || entry.attempts >= MAX_ATTEMPTS) {
    throw new ApiError(400, 'CODE_EXPIRED', 'Kod muddati tugagan yoki olinmagan. Botdan yangi kod oling', 'code')
  }

  const a = Buffer.from(hashCode(phone, code))
  const b = Buffer.from(entry.codeHash)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await db.update(phoneVerifications).set({ attempts: entry.attempts + 1 }).where(eq(phoneVerifications.id, entry.id))
    throw new ApiError(400, 'CODE_INVALID', 'Tasdiqlash kodi noto‘g‘ri', 'code')
  }

  const consumed = await db
    .update(phoneVerifications)
    .set({ consumedAt: new Date() })
    .where(and(eq(phoneVerifications.id, entry.id), isNull(phoneVerifications.consumedAt)))
    .returning({ chatId: phoneVerifications.chatId })
  if (!consumed.length) throw new ApiError(400, 'CODE_EXPIRED', 'Bu kod allaqachon ishlatilgan. Yangi kod oling', 'code')
  return { chatId: consumed[0].chatId }
}
