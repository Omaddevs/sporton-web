'use server'

import { count, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { complexes, users } from '@/db/schema'
import { audit } from '@/lib/audit'
import { clearSessionCookie, setSessionCookie, verifyPassword } from '@/lib/auth'
import { toLocalDigits } from '@/lib/phone'
import { rateLimit } from '@/lib/rate-limit'

export type LoginState = { error?: string }

/** Majmua egasi kirishi: telefon + parol. Kabinet faqat admin biriktirgan majmua egalariga ochiladi */
export async function ownerLogin(_prev: LoginState, form: FormData): Promise<LoginState> {
  const phone = toLocalDigits(form.get('phone'))
  const password = String(form.get('password') ?? '')
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0] ?? 'local'
  try {
    await rateLimit(`owner-login:${ip}`, 10, 15 * 60_000)
  } catch (error) {
    return { error: (error as Error).message }
  }
  if (phone.length !== 9 || !password) return { error: 'Telefon raqam va parolni kiriting' }

  const db = await getDb()
  const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1)
  const ok = await verifyPassword(password, user?.passwordHash)
  if (!user || !ok || user.status !== 'active') return { error: 'Telefon raqam yoki parol noto‘g‘ri' }
  const [{ n }] = await db.select({ n: count() }).from(complexes).where(eq(complexes.ownerId, user.id))
  if (!n) {
    return {
      error:
        'Bu hisobga hali majmua biriktirilmagan. Saytda «Majmua qo‘shish» orqali ariza yuboring — admin tasdiqlagach kabinet ochiladi.',
    }
  }

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id))
  await setSessionCookie(user)
  await audit(user.id, 'login', 'kabinet')
  redirect('/kabinet')
}

export async function ownerLogout() {
  await clearSessionCookie()
  redirect('/kabinet/login')
}
