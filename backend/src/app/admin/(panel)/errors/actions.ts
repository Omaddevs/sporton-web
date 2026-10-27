'use server'

import { lt } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { errorEvents } from '@/db/schema'
import { requireStaff } from '@/lib/admin'

export async function clearOldErrors() {
  await requireStaff('admin')
  const db = await getDb()
  await db.delete(errorEvents).where(lt(errorEvents.createdAt, new Date(Date.now() - 30 * 86_400_000)))
  redirect('/admin/errors?ok=' + encodeURIComponent('Eski yozuvlar tozalandi'))
}
