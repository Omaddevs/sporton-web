import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/db'
import { pushSubscriptions, users } from '@/db/schema'
import { requireUser } from '@/lib/auth'
import { env } from '@/lib/env'
import { json, readJson, route } from '@/lib/http'
import { prefsOf } from '@/lib/notify'
import { pushEnabled, vapidPublicKey } from '@/lib/push'
import { telegramEnabled } from '@/lib/telegram'

export const dynamic = 'force-dynamic'

async function state(userId: string) {
  const db = await getDb()
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  const devices = await db.select({ id: pushSubscriptions.id }).from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId))
  return {
    prefs: prefsOf(user),
    telegram: {
      available: telegramEnabled(),
      linked: Boolean(user.telegramChatId),
      botUrl: `https://t.me/${env.telegram.username}?start=link`,
    },
    push: { available: pushEnabled(), publicKey: vapidPublicKey(), devices: devices.length },
  }
}

export const GET = route(async () => {
  const user = await requireUser()
  return json(await state(user.id))
})

const prefsSchema = z
  .object({
    bookingReminders: z.boolean(),
    promotions: z.boolean(),
    news: z.boolean(),
    telegram: z.boolean(),
    push: z.boolean(),
  })
  .partial()

export const PATCH = route(async (request) => {
  const user = await requireUser()
  const patch = await readJson(request, prefsSchema)
  const db = await getDb()
  await db
    .update(users)
    .set({ notifyPrefs: { ...user.notifyPrefs, ...patch } })
    .where(eq(users.id, user.id))
  return json(await state(user.id))
})

/** Telegram’ni uzish */
export const DELETE = route(async () => {
  const user = await requireUser()
  const db = await getDb()
  await db.update(users).set({ telegramChatId: null }).where(eq(users.id, user.id))
  return json(await state(user.id))
})
