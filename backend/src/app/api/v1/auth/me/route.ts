import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import { clearSessionCookie, getCurrentUser, publicUser, requireUser } from '@/lib/auth'
import { ApiError, json, readJson, route } from '@/lib/http'
import { profileSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const user = await getCurrentUser()
  return json({ user: user ? publicUser(user) : null })
})

export const PATCH = route(async (request) => {
  const user = await requireUser()
  const data = await readJson(request, profileSchema)
  const db = await getDb()
  const email = data.email === undefined ? undefined : data.email.toLowerCase() || null
  if (email) {
    const [taken] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1)
    if (taken && taken.id !== user.id) throw new ApiError(409, 'EMAIL_TAKEN', 'Bu email boshqa hisobga biriktirilgan', 'email')
  }
  const [updated] = await db
    .update(users)
    .set({ firstName: data.firstName, lastName: data.lastName, email })
    .where(eq(users.id, user.id))
    .returning()
  return json({ user: publicUser(updated) })
})

/** Hisobni o‘chirish. Bronlar/sharhlar anonim holda qoladi (user_id → null). */
export const DELETE = route(async () => {
  const user = await requireUser()
  if (user.role === 'admin') throw new ApiError(400, 'ADMIN_DELETE', 'Admin hisobini bu yerdan o‘chirib bo‘lmaydi')
  const db = await getDb()
  await db.delete(users).where(eq(users.id, user.id))
  await clearSessionCookie()
  return json({ ok: true })
})
