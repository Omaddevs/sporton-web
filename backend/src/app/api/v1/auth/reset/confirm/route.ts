import { eq, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import { hashPassword } from '@/lib/auth'
import { json, readJson, route } from '@/lib/http'
import { consumeResetToken } from '@/lib/reset'
import { resetPasswordSchema } from '@/lib/validation'

export const POST = route(async (request) => {
  const { resetToken, password } = await readJson(request, resetPasswordSchema)
  const userId = await consumeResetToken(resetToken)
  const db = await getDb()
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(password), tokenVersion: sql`${users.tokenVersion} + 1` })
    .where(eq(users.id, userId))
  return json({ ok: true })
})
