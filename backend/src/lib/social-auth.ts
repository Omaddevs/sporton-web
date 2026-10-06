import 'server-only'
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { and, eq } from 'drizzle-orm'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { getDb } from '@/db'
import { users, type User } from '@/db/schema'
import { env } from './env'
import { ApiError } from './http'

type Profile = {
  provider: 'google' | 'telegram'
  providerId: string
  firstName: string
  lastName: string
  email?: string | null
  avatar?: string | null
}

const googleJwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

export async function verifyGoogleCredential(credential: string): Promise<Profile> {
  if (!env.googleClientId) throw new ApiError(503, 'PROVIDER_DISABLED', 'Google orqali kirish sozlanmagan')
  try {
    const { payload } = await jwtVerify(credential, googleJwks, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: env.googleClientId,
    })
    if (!payload.sub || payload.email_verified === false) throw new Error('unverified')
    return {
      provider: 'google',
      providerId: payload.sub,
      firstName: String(payload.given_name ?? payload.name ?? 'Foydalanuvchi'),
      lastName: String(payload.family_name ?? ''),
      email: typeof payload.email === 'string' ? payload.email.toLowerCase() : null,
      avatar: typeof payload.picture === 'string' ? payload.picture : null,
    }
  } catch {
    throw new ApiError(401, 'PROVIDER_INVALID', 'Google tasdig‘i yaroqsiz. Qaytadan urinib ko‘ring')
  }
}

/** Telegram Login Widget ma’lumotini bot tokeni bilan tekshiradi */
export function verifyTelegramLogin(data: Record<string, unknown>): Profile {
  if (!env.telegram.token) throw new ApiError(503, 'PROVIDER_DISABLED', 'Telegram orqali kirish sozlanmagan')
  const { hash, ...fields } = data
  if (typeof hash !== 'string') throw new ApiError(401, 'PROVIDER_INVALID', 'Telegram tasdig‘i yaroqsiz')

  const checkString = Object.keys(fields)
    .filter((k) => fields[k] != null && fields[k] !== '')
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join('\n')
  const secret = createHash('sha256').update(env.telegram.token).digest()
  const expected = createHmac('sha256', secret).update(checkString).digest('hex')
  const valid =
    expected.length === hash.length && timingSafeEqual(Buffer.from(expected), Buffer.from(hash))
  const fresh = Date.now() / 1000 - Number(fields.auth_date ?? 0) < 24 * 60 * 60
  if (!valid || !fresh) throw new ApiError(401, 'PROVIDER_INVALID', 'Telegram tasdig‘i yaroqsiz')

  return {
    provider: 'telegram',
    providerId: String(fields.id),
    firstName: String(fields.first_name ?? 'Telegram'),
    lastName: String(fields.last_name ?? ''),
    avatar: typeof fields.photo_url === 'string' ? fields.photo_url : null,
  }
}

export async function upsertProviderUser(profile: Profile): Promise<User> {
  const db = await getDb()
  const [byProvider] = await db
    .select()
    .from(users)
    .where(and(eq(users.provider, profile.provider), eq(users.providerId, profile.providerId)))
    .limit(1)
  let user = byProvider

  if (!user && profile.email) {
    ;[user] = await db.select().from(users).where(eq(users.email, profile.email)).limit(1)
  }

  if (user) {
    if (user.status !== 'active') throw new ApiError(403, 'BLOCKED', 'Hisobingiz bloklangan')
    const [updated] = await db
      .update(users)
      .set({ lastLoginAt: new Date(), avatar: user.avatar ?? profile.avatar ?? null })
      .where(eq(users.id, user.id))
      .returning()
    return updated
  }

  const [created] = await db
    .insert(users)
    .values({
      firstName: profile.firstName.slice(0, 50),
      lastName: profile.lastName.slice(0, 50),
      email: profile.email ?? null,
      provider: profile.provider,
      providerId: profile.providerId,
      avatar: profile.avatar ?? null,
      consentAt: new Date(),
      lastLoginAt: new Date(),
    })
    .returning()
  return created
}
