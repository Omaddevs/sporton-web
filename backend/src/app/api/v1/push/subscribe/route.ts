import { z } from 'zod'
import { getDb } from '@/db'
import { pushSubscriptions } from '@/db/schema'
import { requireUser } from '@/lib/auth'
import { ApiError, json, readJson, route } from '@/lib/http'
import { pushEnabled, removeSubscription } from '@/lib/push'
import { rateLimit } from '@/lib/rate-limit'

const subscriptionSchema = z.object({
  endpoint: z.url().max(1000).refine((u) => u.startsWith('https://'), 'Endpoint noto‘g‘ri'),
  keys: z.object({ p256dh: z.string().min(10).max(200), auth: z.string().min(8).max(100) }),
})

/** Brauzer push obunasini saqlash (bir endpoint — bitta qurilma) */
export const POST = route(async (request) => {
  const user = await requireUser()
  if (!pushEnabled()) throw new ApiError(503, 'PUSH_DISABLED', 'Push bildirishnomalar sozlanmagan')
  await rateLimit(`push:${user.id}`, 30, 60 * 60_000)
  const sub = await readJson(request, subscriptionSchema)
  const db = await getDb()
  await db
    .insert(pushSubscriptions)
    .values({
      userId: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId: user.id, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    })
  return json({ ok: true }, { status: 201 })
})

export const DELETE = route(async (request) => {
  await requireUser()
  const { endpoint } = await readJson(request, z.object({ endpoint: z.string().max(1000) }))
  await removeSubscription(endpoint)
  return json({ ok: true })
})
