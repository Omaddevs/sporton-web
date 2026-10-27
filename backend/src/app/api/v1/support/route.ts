import { getDb } from '@/db'
import { supportTickets } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'
import { ApiError, json, readJson, route } from '@/lib/http'
import { formatPhone } from '@/lib/phone'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { notifyAdmins } from '@/lib/telegram'
import { supportSchema } from '@/lib/validation'

export const POST = route(async (request) => {
  await rateLimit(`support:${clientIp(request)}`, 5, 60 * 60_000)
  const data = await readJson(request, supportSchema)
  const user = await getCurrentUser()
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : data.name
  const contact = data.contact || (user?.phone ? formatPhone(user.phone) : user?.email) || ''
  if (!name || !contact) throw new ApiError(422, 'CONTACT_REQUIRED', 'Ism va bog‘lanish uchun ma’lumot kiriting', 'contact')

  const db = await getDb()
  const [ticket] = await db
    .insert(supportTickets)
    .values({ userId: user?.id ?? null, name, contact, topic: data.topic, message: data.message })
    .returning({ id: supportTickets.id })
  notifyAdmins('💬 Yangi murojaat', [`${name} · ${contact}`, `Mavzu: ${data.topic}`, data.message.slice(0, 300)])
  return json({ ok: true, id: ticket.id }, { status: 201 })
})
