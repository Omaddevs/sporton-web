'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { services } from '@/db/schema'
import { requireStaff } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { invalidateCatalog } from '@/lib/catalog'
import { readService } from '@/lib/service-form'

const fail = (path: string, error: unknown): never =>
  redirect(`${path}${path.includes('?') ? '&' : '?'}error=${encodeURIComponent(error instanceof Error ? error.message : 'Xatolik')}`)

export async function createService(form: FormData) {
  const actor = await requireStaff()
  const complexId = String(form.get('complexId'))
  let id = 0
  try {
    const db = await getDb()
    const [row] = await db.insert(services).values({ complexId, ...(await readService(form)) }).returning({ id: services.id })
    id = row.id
  } catch (error) {
    fail(`/admin/services/new?complex=${complexId}`, error)
  }
  await audit(actor.id, 'service.create', 'service', id, { complexId })
  invalidateCatalog()
  redirect(`/admin/complexes/${complexId}?ok=${encodeURIComponent('Xizmat qo‘shildi')}`)
}

export async function updateService(form: FormData) {
  const actor = await requireStaff()
  const id = Number(form.get('id'))
  try {
    const db = await getDb()
    await db.update(services).set(await readService(form)).where(eq(services.id, id))
  } catch (error) {
    fail(`/admin/services/${id}`, error)
  }
  await audit(actor.id, 'service.update', 'service', id)
  invalidateCatalog()
  redirect(`/admin/services/${id}?ok=${encodeURIComponent('Saqlandi')}`)
}

export async function deleteService(form: FormData) {
  const actor = await requireStaff('admin')
  const id = Number(form.get('id'))
  const db = await getDb()
  const [row] = await db.delete(services).where(eq(services.id, id)).returning({ complexId: services.complexId })
  await audit(actor.id, 'service.delete', 'service', id)
  invalidateCatalog()
  redirect(row ? `/admin/complexes/${row.complexId}?ok=${encodeURIComponent('Xizmat o‘chirildi')}` : '/admin/complexes')
}
