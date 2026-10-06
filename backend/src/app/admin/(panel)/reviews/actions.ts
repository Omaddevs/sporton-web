'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { newsComments, reviews } from '@/db/schema'
import { requireStaff } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { invalidateCatalog } from '@/lib/catalog'

export async function moderate(form: FormData) {
  const actor = await requireStaff()
  const kind = form.get('kind') === 'comment' ? 'comment' : 'review'
  const id = String(form.get('id'))
  const op = String(form.get('op'))
  const table = kind === 'comment' ? newsComments : reviews
  const db = await getDb()
  if (op === 'delete') await db.delete(table).where(eq(table.id, id))
  else await db.update(table).set({ status: op === 'publish' ? 'published' : 'hidden' }).where(eq(table.id, id))
  await audit(actor.id, `${kind}.${op}`, kind, id)
  if (kind === 'review') invalidateCatalog()
  redirect(String(form.get('back') || '/admin/reviews'))
}
