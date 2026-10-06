import 'server-only'
import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { and, desc, eq, isNull } from 'drizzle-orm'
import { jwtVerify, SignJWT } from 'jose'
import { getDb } from '@/db'
import { resetCodes, users } from '@/db/schema'
import { env } from './env'
import { ApiError } from './http'

const CODE_TTL_MS = 5 * 60_000
const MAX_ATTEMPTS = 5

const hashCode = (code: string) => createHmac('sha256', env.authSecret).update(code).digest('hex')
const key = () => new TextEncoder().encode(`${env.authSecret}:reset`)

/** Yangi 6 xonali kod; avvalgi faol kodlar bekor qilinadi */
export async function issueResetCode(userId: string) {
  const db = await getDb()
  const code = String(randomInt(100000, 1000000))
  await db
    .update(resetCodes)
    .set({ consumedAt: new Date() })
    .where(and(eq(resetCodes.userId, userId), isNull(resetCodes.consumedAt)))
  await db.insert(resetCodes).values({ userId, codeHash: hashCode(code), expiresAt: new Date(Date.now() + CODE_TTL_MS) })
  return code
}

export async function verifyResetCode(phone: string, code: string) {
  const db = await getDb()
  const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1)
  if (!user) throw new ApiError(400, 'CODE_INVALID', 'Tasdiqlash kodi noto‘g‘ri')

  const [entry] = await db
    .select()
    .from(resetCodes)
    .where(and(eq(resetCodes.userId, user.id), isNull(resetCodes.consumedAt)))
    .orderBy(desc(resetCodes.createdAt))
    .limit(1)
  if (!entry || entry.expiresAt.getTime() < Date.now() || entry.attempts >= MAX_ATTEMPTS) {
    throw new ApiError(400, 'CODE_EXPIRED', 'Kod muddati tugagan. Yangi kod oling')
  }

  const a = Buffer.from(hashCode(code))
  const b = Buffer.from(entry.codeHash)
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    await db.update(resetCodes).set({ attempts: entry.attempts + 1 }).where(eq(resetCodes.id, entry.id))
    throw new ApiError(400, 'CODE_INVALID', 'Tasdiqlash kodi noto‘g‘ri')
  }

  const resetToken = await new SignJWT({ rid: entry.id, purpose: 'reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setExpirationTime('10m')
    .sign(key())
  return { resetToken }
}

/** Token tekshiriladi va kod bir martalik qilib yopiladi */
export async function consumeResetToken(resetToken: string) {
  let payload
  try {
    ;({ payload } = await jwtVerify(resetToken, key(), { algorithms: ['HS256'] }))
  } catch {
    throw new ApiError(400, 'TOKEN_INVALID', 'Sessiya muddati tugadi. Qaytadan urinib ko‘ring')
  }
  if (payload.purpose !== 'reset' || !payload.sub || typeof payload.rid !== 'string') {
    throw new ApiError(400, 'TOKEN_INVALID', 'Sessiya muddati tugadi. Qaytadan urinib ko‘ring')
  }
  const db = await getDb()
  const consumed = await db
    .update(resetCodes)
    .set({ consumedAt: new Date() })
    .where(and(eq(resetCodes.id, payload.rid), isNull(resetCodes.consumedAt)))
    .returning({ id: resetCodes.id })
  if (!consumed.length) throw new ApiError(400, 'TOKEN_INVALID', 'Bu havola allaqachon ishlatilgan')
  return payload.sub
}
