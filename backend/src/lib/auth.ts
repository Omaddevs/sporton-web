import 'server-only'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { jwtVerify, SignJWT } from 'jose'
import { cookies, headers } from 'next/headers'
import { cache } from 'react'
import { getDb } from '@/db'
import { users, type User, type UserRole } from '@/db/schema'
import { env } from './env'
import { ApiError } from './http'

export const SESSION_COOKIE = 'sporton_session'
const SESSION_DAYS = 30
export const MIN_PASSWORD = 8

const secretKey = () => new TextEncoder().encode(env.authSecret)

export function hashPassword(password: string) {
  return bcrypt.hash(password, 11)
}

let dummyHash: string | null = null

export async function verifyPassword(password: string, hash: string | null | undefined) {
  // Hisob topilmasa ham bir xil vaqt sarflanadi — raqam mavjudligini vaqt orqali bilib bo‘lmaydi
  dummyHash ??= bcrypt.hashSync('sporton-dummy-password', 11)
  const ok = await bcrypt.compare(password, hash ?? dummyHash)
  return ok && Boolean(hash)
}

export async function signSession(user: Pick<User, 'id' | 'tokenVersion' | 'role'>) {
  return new SignJWT({ ver: user.tokenVersion, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey())
}

export async function setSessionCookie(user: Pick<User, 'id' | 'tokenVersion' | 'role'>) {
  const token = await signSession(user)
  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd || env.cookieSameSite === 'none',
    sameSite: env.cookieSameSite,
    path: '/',
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  })
  return token
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: env.isProd || env.cookieSameSite === 'none',
    sameSite: env.cookieSameSite,
    path: '/',
    maxAge: 0,
  })
}

async function readToken() {
  const store = await cookies()
  const fromCookie = store.get(SESSION_COOKIE)?.value
  if (fromCookie) return fromCookie
  const auth = (await headers()).get('authorization')
  return auth?.startsWith('Bearer ') ? auth.slice(7) : null
}

/** Joriy foydalanuvchi (yoki null). Bitta so‘rov ichida keshlanadi. */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await readToken()
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ['HS256'] })
    if (!payload.sub) return null
    const db = await getDb()
    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1)
    if (!user || user.status !== 'active' || user.tokenVersion !== payload.ver) return null
    return user
  } catch {
    return null
  }
})

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'Avval tizimga kiring')
  return user
}

const ROLE_RANK: Record<UserRole, number> = { user: 0, moderator: 1, admin: 2 }

export function hasRole(user: Pick<User, 'role'> | null | undefined, role: UserRole) {
  return Boolean(user) && ROLE_RANK[user!.role] >= ROLE_RANK[role]
}

export async function requireRole(role: UserRole) {
  const user = await requireUser()
  if (!hasRole(user, role)) throw new ApiError(403, 'FORBIDDEN', 'Bu amal uchun ruxsat yo‘q')
  return user
}

/** Frontend’ga qaytariladigan foydalanuvchi (parol xeshisiz) */
export function publicUser(user: User) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? '',
    email: user.email ?? '',
    provider: user.provider,
    role: user.role,
    avatar: user.avatar ?? '',
    bio: user.bio ?? '',
    city: user.city ?? '',
    sports: user.sports ?? [],
    phoneVerified: Boolean(user.phoneVerifiedAt),
    createdAt: user.createdAt,
  }
}
