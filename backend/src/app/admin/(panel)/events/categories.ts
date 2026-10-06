import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { events, sports } from '@/db/schema'

/** Kategoriya maydoni uchun takliflar: sport turlari + avval ishlatilgan kategoriyalar */
export async function eventCategories() {
  const db = await getDb()
  const [sportRows, used] = await Promise.all([
    db.select({ title: sports.title }).from(sports).where(eq(sports.active, true)).orderBy(asc(sports.sortOrder)),
    db.selectDistinct({ title: events.category }).from(events),
  ])
  return [...new Set([...sportRows.map((s) => s.title), ...used.map((u) => u.title)])]
}
