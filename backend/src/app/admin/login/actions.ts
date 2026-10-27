'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import { audit } from '@/lib/audit'
import { clearSessionCookie, hasRole, setSessionCookie, verifyPassword } from '@/lib/auth'
import { toLocalDigits } from '@/lib/phone'
import { rateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export type LoginState = { error?: string }

export async function adminLogin(_prev: LoginState, form: FormData): Promise<LoginState> {
  const phone = toLocalDigits(form.get('phone'))
  const password = String(form.get('password') ?? '')
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0] ?? 'local'
  try {
    await rateLimit(`admin-login:${ip}`, 10, 15 * 60_000)
  } catch (error) {
    return { error: (error as Error).message }
  }
  if (phone.length !== 9 || !password) return { error: 'Telefon raqam va parolni kiriting' }

  const db = await getDb()
  const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1)
  const ok = await verifyPassword(password, user?.passwordHash)
  if (!user || !ok || user.status !== 'active') return { error: 'Telefon raqam yoki parol noto‘g‘ri' }
  if (!hasRole(user, 'moderator')) return { error: 'Bu hisobda admin panelga kirish huquqi yo‘q' }

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id))
  await setSessionCookie(user)
  await audit(user.id, 'login', 'admin')
  const next = String(form.get('next') ?? '')
  redirect(next.startsWith('/admin') ? next : '/admin')
}

export async function adminLogout() {
  await clearSessionCookie()
  redirect('/admin/login')
}
