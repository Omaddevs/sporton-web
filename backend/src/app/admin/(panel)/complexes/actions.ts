'use server'

import { panelUrl } from '@/lib/env'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { complexes, LISTING_STATUSES, users, type ListingStatus } from '@/db/schema'
import { readComplex } from '@/lib/complex-form'
import { field, requireStaff, slugify } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { invalidateCatalog } from '@/lib/catalog'
import { isUniqueViolation } from '@/lib/booking'
import { notifyUserSafe } from '@/lib/notify'
import { toLocalDigits } from '@/lib/phone'

function fail(path: string, error: unknown): never {
  const message = error instanceof Error ? error.message : 'Saqlashda xatolik'
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

export async function createComplex(form: FormData) {
  const actor = await requireStaff()
  let id = ''
  try {
    const data = readComplex(form)
    id = slugify(field(form, 'id') ?? data.name) || `majmua-${Date.now()}`
    const db = await getDb()
    await db.insert(complexes).values({ id, ...data })
  } catch (error) {
    if (isUniqueViolation(error)) fail('/admin/complexes/new', new Error('Bunday ID bilan majmua mavjud'))
    fail('/admin/complexes/new', error)
  }
  await audit(actor.id, 'complex.create', 'complex', id)
  invalidateCatalog()
  redirect(`/admin/complexes/${id}?ok=${encodeURIComponent('Majmua yaratildi')}`)
}

export async function updateComplex(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('originalId'))
  try {
    const data = readComplex(form)
    const db = await getDb()
    await db.update(complexes).set(data).where(eq(complexes.id, id))
  } catch (error) {
    fail(`/admin/complexes/${id}`, error)
  }
  await audit(actor.id, 'complex.update', 'complex', id)
  invalidateCatalog()
  revalidatePath('/admin/complexes')
  redirect(`/admin/complexes/${id}?ok=${encodeURIComponent('O‘zgarishlar saqlandi')}`)
}

export async function setComplexStatus(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const raw = String(form.get('status'))
  const status = ((LISTING_STATUSES as readonly string[]).includes(raw) ? raw : 'hidden') as ListingStatus
  const db = await getDb()
  await db.update(complexes).set({ status }).where(eq(complexes.id, id))
  await audit(actor.id, `complex.${status}`, 'complex', id)
  invalidateCatalog()
  redirect(String(form.get('back') || '/admin/complexes'))
}

/** Barcha namuna (demo) majmualarni bir bosishda yashirish — launchdan oldin */
export async function hideDemoComplexes() {
  const actor = await requireStaff('admin')
  const db = await getDb()
  const rows = await db
    .update(complexes)
    .set({ status: 'hidden' })
    .where(and(eq(complexes.isDemo, true), eq(complexes.status, 'published')))
    .returning({ id: complexes.id })
  await audit(actor.id, 'complex.hide_demo', 'complex', null, { count: rows.length })
  invalidateCatalog()
  redirect(`/admin/complexes?ok=${encodeURIComponent(`${rows.length} ta demo majmua yashirildi`)}`)
}

export async function deleteComplex(form: FormData) {
  const actor = await requireStaff('admin')
  const id = String(form.get('id'))
  const db = await getDb()
  await db.delete(complexes).where(eq(complexes.id, id))
  await audit(actor.id, 'complex.delete', 'complex', id)
  invalidateCatalog()
  redirect(`/admin/complexes?ok=${encodeURIComponent('Majmua o‘chirildi')}`)
}

/** Majmua egasini biriktirish (telefon raqami bo‘yicha) yoki olib tashlash — kabinetga kirish shu orqali */
export async function setComplexOwner(form: FormData) {
  const actor = await requireStaff('admin')
  const id = String(form.get('id'))
  const path = `/admin/complexes/${encodeURIComponent(id)}`
  const db = await getDb()
  if (form.get('op') === 'remove') {
    await db.update(complexes).set({ ownerId: null }).where(eq(complexes.id, id))
    await audit(actor.id, 'complex.owner_remove', 'complex', id)
    redirect(`${path}?ok=${encodeURIComponent('Egasi olib tashlandi')}`)
  }
  const phone = toLocalDigits(form.get('phone'))
  const [owner] = phone.length === 9 ? await db.select().from(users).where(eq(users.phone, phone)).limit(1) : []
  if (!owner) redirect(`${path}?error=${encodeURIComponent('Bu raqam bilan ro‘yxatdan o‘tgan foydalanuvchi topilmadi')}`)
  await db.update(complexes).set({ ownerId: owner.id }).where(eq(complexes.id, id))
  await audit(actor.id, 'complex.owner_set', 'complex', id, { ownerId: owner.id })
  const [c] = await db.select({ name: complexes.name }).from(complexes).where(eq(complexes.id, id)).limit(1)
  notifyUserSafe(owner.id, {
    type: 'submission',
    title: 'Majmua kabineti ochildi',
    body: `Siz «${c?.name ?? id}» majmuasining egasi sifatida tasdiqlandingiz. Bronlar va ma’lumotlarni kabinetda boshqaring.`,
    link: panelUrl('/kabinet'),
  })
  redirect(`${path}?ok=${encodeURIComponent('Egasi biriktirildi — kabinetga kira oladi')}`)
}
