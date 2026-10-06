'use server'

import { eq, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { USER_ROLES, users, type UserRole } from '@/db/schema'
import { requireStaff } from '@/lib/admin'
import { audit } from '@/lib/audit'

export async function updateUser(form: FormData) {
  const actor = await requireStaff('admin')
  const id = String(form.get('id'))
  const back = String(form.get('back') || '/admin/users')
  const op = String(form.get('op'))
  if (id === actor.id) redirect(`${back}${back.includes('?') ? '&' : '?'}error=${encodeURIComponent('O‘z hisobingizni o‘zgartira olmaysiz')}`)

  const db = await getDb()
  if (op === 'block' || op === 'unblock') {
    // Bloklanganda tokenVersion oshadi — barcha sessiyalar darhol yopiladi
    await db
      .update(users)
      .set({ status: op === 'block' ? 'blocked' : 'active', tokenVersion: sql`${users.tokenVersion} + 1` })
      .where(eq(users.id, id))
  } else if (op === 'role') {
    const role = String(form.get('role')) as UserRole
    if (!USER_ROLES.includes(role)) redirect(back)
    await db.update(users).set({ role, tokenVersion: sql`${users.tokenVersion} + 1` }).where(eq(users.id, id))
  }
  await audit(actor.id, `user.${op}`, 'user', id, op === 'role' ? { role: form.get('role') } : undefined)
  redirect(back)
}
