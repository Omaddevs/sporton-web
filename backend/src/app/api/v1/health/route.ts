import { sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const db = await getDb()
  await db.execute(sql`select 1`)
  return json({ ok: true, time: new Date().toISOString() })
})
