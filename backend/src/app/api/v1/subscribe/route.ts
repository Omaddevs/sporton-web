import { getDb } from '@/db'
import { subscribers } from '@/db/schema'
import { json, readJson, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { subscribeSchema } from '@/lib/validation'

export const POST = route(async (request) => {
  rateLimit(`subscribe:${clientIp(request)}`, 10, 60 * 60_000)
  const { email } = await readJson(request, subscribeSchema)
  const db = await getDb()
  await db
    .insert(subscribers)
    .values({ email })
    .onConflictDoUpdate({ target: subscribers.email, set: { status: 'active' } })
  return json({ ok: true }, { status: 201 })
})
