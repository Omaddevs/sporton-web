import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { partners } from '@/db/schema'
import { json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const db = await getDb()
  const rows = await db
    .select()
    .from(partners)
    .where(eq(partners.active, true))
    .orderBy(asc(partners.sortOrder), asc(partners.createdAt))
  return json({ partners: rows.map(({ id, name, logo, link }) => ({ id, name, logo, link })) })
})
