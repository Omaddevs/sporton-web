'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { sports } from '@/db/schema'
import { field, requireStaff, slugify } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { isUniqueViolation } from '@/lib/booking'

export async function saveSport(form: FormData) {
  const actor = await requireStaff('admin')
  const existing = field(form, 'originalId')
  const title = field(form, 'title')
  if (!title) redirect(`/admin/sports?error=${encodeURIComponent('Nomini kiriting')}`)
  const data = {
    title,
    accent: field(form, 'accent'),
    image: field(form, 'image'),
    sortOrder: Number(field(form, 'sortOrder') ?? 0) || 0,
    active: form.get('active') === 'on',
  }
  const db = await getDb()
  try {
    if (existing) await db.update(sports).set(data).where(eq(sports.id, existing))
    else await db.insert(sports).values({ id: slugify(field(form, 'id') ?? title), ...data })
  } catch (error) {
    redirect(`/admin/sports?error=${encodeURIComponent(isUniqueViolation(error) ? 'Bunday ID mavjud' : 'Saqlab bo‘lmadi')}`)
  }
  await audit(actor.id, existing ? 'sport.update' : 'sport.create', 'sport', existing ?? title)
  redirect(`/admin/sports?ok=${encodeURIComponent('Saqlandi')}`)
}
