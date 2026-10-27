import { eq, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import { requireUser, setSessionCookie } from '@/lib/auth'
import { json, route } from '@/lib/http'

/** Barcha qurilmalardagi sessiyalarni bekor qiladi; joriy qurilmada yangi sessiya ochiladi */
export const POST = route(async () => {
  const user = await requireUser()
  const db = await getDb()
  const [updated] = await db
    .update(users)
    .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
    .where(eq(users.id, user.id))
    .returning()
  await setSessionCookie(updated)
  return json({ ok: true })
})
