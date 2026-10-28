import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { subscribers } from '@/db/schema'
import { json, readJson, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { notifyAdmins } from '@/lib/telegram'
import { subscribeSchema } from '@/lib/validation'

export const POST = route(async (request) => {
  await rateLimit(`subscribe:${clientIp(request)}`, 10, 60 * 60_000)
  const { email } = await readJson(request, subscribeSchema)
  const db = await getDb()
  const [existing] = await db.select({ status: subscribers.status }).from(subscribers).where(eq(subscribers.email, email))
  await db
    .insert(subscribers)
    .values({ email })
    .onConflictDoUpdate({ target: subscribers.email, set: { status: 'active' } })
  // Adminga faqat yangi (yoki qayta faollashgan) obuna haqida xabar — takroriy yuborishda jim
  if (existing?.status !== 'active') notifyAdmins('📧 Yangi email obunachi', [email, 'Admin panel → Obunachilar'])
  return json({ ok: true }, { status: 201 })
})
