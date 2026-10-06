import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { sports } from '@/db/schema'
import { json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const db = await getDb()
  const rows = await db.select().from(sports).where(eq(sports.active, true)).orderBy(asc(sports.sortOrder))
  return json({ sports: rows.map(({ id, title, accent, image }) => ({ id, title, accent, image })) })
})
