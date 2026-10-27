import { and, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes } from '@/db/schema'
import { requireUser } from '@/lib/auth'
import { json, notFound, route } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/** Majmua telefon raqami — faqat ro‘yxatdan o‘tgan foydalanuvchilarga (katalogda yashirin) */
export const GET = route<{ id: string }>(async (_request, { params }) => {
  const user = await requireUser()
  // Raqamlarni ommaviy yig‘ib olishning oldini olish
  await rateLimit(`contact:${user.id}`, 120, 60 * 60_000)
  const { id } = await params
  const db = await getDb()
  const [row] = await db
    .select({ phone: complexes.phone })
    .from(complexes)
    .where(and(eq(complexes.id, id), eq(complexes.status, 'published')))
    .limit(1)
  if (!row) throw notFound('Majmua')
  return json({ phone: row.phone })
})
