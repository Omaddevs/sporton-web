'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { complexes, services } from '@/db/schema'
import { audit } from '@/lib/audit'
import { invalidateCatalog } from '@/lib/catalog'
import { readOwnerComplex } from '@/lib/complex-form'
import { requireOwnedComplex, requireOwner } from '@/lib/owner'
import { readService } from '@/lib/service-form'

const go = (path: string, kind: 'ok' | 'error', message: string): never =>
  redirect(`${path}${path.includes('?') ? '&' : '?'}${kind}=${encodeURIComponent(message)}`)
const messageOf = (error: unknown) => (error instanceof Error ? error.message : 'Saqlashda xatolik')

/** Egasi majmua ma’lumotlarini tahrirlaydi (holat va tasdiq belgilari — faqat admin) */
export async function ownerUpdateComplex(form: FormData) {
  const id = String(form.get('originalId'))
  const { user } = await requireOwnedComplex(id)
  const path = `/kabinet/majmua/${encodeURIComponent(id)}`
  try {
    const data = readOwnerComplex(form)
    const db = await getDb()
    await db.update(complexes).set(data).where(and(eq(complexes.id, id), eq(complexes.ownerId, user.id)))
  } catch (error) {
    go(path, 'error', messageOf(error))
  }
  await audit(user.id, 'complex.update', 'complex', id, { by: 'owner' })
  invalidateCatalog()
  revalidatePath('/kabinet', 'layout')
  go(path, 'ok', 'O‘zgarishlar saqlandi')
}

async function ownedService(serviceId: number) {
  const { user, complexIds } = await requireOwner()
  const db = await getDb()
  const [row] = await db.select().from(services).where(eq(services.id, serviceId)).limit(1)
  if (!row || !complexIds.includes(row.complexId)) redirect('/kabinet?error=forbidden')
  return { user, service: row }
}

export async function ownerCreateService(form: FormData) {
  const complexId = String(form.get('complexId'))
  const { user } = await requireOwnedComplex(complexId)
  let id = 0
  try {
    const db = await getDb()
    const [row] = await db.insert(services).values({ complexId, ...(await readService(form)) }).returning({ id: services.id })
    id = row.id
  } catch (error) {
    go(`/kabinet/xizmat/new?complex=${encodeURIComponent(complexId)}`, 'error', messageOf(error))
  }
  await audit(user.id, 'service.create', 'service', id, { complexId, by: 'owner' })
  invalidateCatalog()
  go(`/kabinet/majmua/${encodeURIComponent(complexId)}`, 'ok', 'Xizmat qo‘shildi')
}

export async function ownerUpdateService(form: FormData) {
  const id = Number(form.get('id'))
  const { user, service } = await ownedService(id)
  try {
    const db = await getDb()
    // complexId formadan emas — bazadagi qiymat saqlanadi (boshqa majmuaga ko‘chirib bo‘lmaydi)
    await db.update(services).set(await readService(form)).where(eq(services.id, service.id))
  } catch (error) {
    go(`/kabinet/xizmat/${id}`, 'error', messageOf(error))
  }
  await audit(user.id, 'service.update', 'service', id, { by: 'owner' })
  invalidateCatalog()
  go(`/kabinet/xizmat/${id}`, 'ok', 'Saqlandi')
}

export async function ownerDeleteService(form: FormData) {
  const id = Number(form.get('id'))
  const { user, service } = await ownedService(id)
  const db = await getDb()
  await db.delete(services).where(eq(services.id, service.id))
  await audit(user.id, 'service.delete', 'service', id, { by: 'owner' })
  invalidateCatalog()
  go(`/kabinet/majmua/${encodeURIComponent(service.complexId)}`, 'ok', 'Xizmat o‘chirildi')
}
