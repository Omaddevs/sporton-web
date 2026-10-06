'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { complexes, PUBLISH_STATUSES } from '@/db/schema'
import { field, requireStaff, slugify } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { invalidateCatalog } from '@/lib/catalog'
import { REGIONS } from '@/lib/constants'
import { isUniqueViolation } from '@/lib/booking'
import { imagesOf, normalizeMedia } from '@/lib/media'

function num(form: FormData, name: string) {
  const raw = field(form, name)
  if (raw == null) return null
  const n = Number(raw.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function readComplex(form: FormData) {
  const name = field(form, 'name')
  if (!name || name.length < 2) throw new Error('Majmua nomini kiriting')
  const status = String(form.get('status') ?? 'published')
  const region = field(form, 'region')
  const lat = num(form, 'lat')
  const lng = num(form, 'lng')
  if ((lat == null) !== (lng == null)) throw new Error('Koordinata uchun lat va lng ikkalasini ham kiriting')
  if (lat != null && (lat < 37 || lat > 46 || lng! < 55 || lng! > 74)) throw new Error('Koordinata O‘zbekiston hududida emas')
  let rawMedia: unknown = []
  try {
    rawMedia = JSON.parse(String(form.get('media') ?? '[]'))
  } catch {
    throw new Error('Media ro‘yxati noto‘g‘ri')
  }
  const media = normalizeMedia(rawMedia)
  const phone = field(form, 'phone')
  const telegram = field(form, 'telegram')
  return {
    name,
    status: ((PUBLISH_STATUSES as readonly string[]).includes(status) ? status : 'hidden') as 'published' | 'hidden',
    color: field(form, 'color') ?? '#1e6ff5',
    verified: form.get('verified') === 'on',
    listed: form.get('listed') === 'on',
    isDemo: form.get('isDemo') === 'on',
    tagline: field(form, 'tagline'),
    region,
    city: field(form, 'city') ?? REGIONS.find((r) => r.id === region)?.city ?? null,
    location: field(form, 'location'),
    address: field(form, 'address'),
    landmark: field(form, 'landmark'),
    website: field(form, 'website'),
    industry: field(form, 'industry'),
    years: field(form, 'years'),
    employees: field(form, 'employees'),
    phone,
    telegram: telegram ? (telegram.startsWith('@') ? telegram : `@${telegram.replace(/^https?:\/\/t\.me\//, '')}`) : null,
    hours: field(form, 'hours'),
    priceNote: field(form, 'priceNote'),
    bannerImage: field(form, 'bannerImage'),
    bannerSlogan: field(form, 'bannerSlogan'),
    about: field(form, 'about'),
    amenities: form.getAll('amenities').map(String),
    media,
    images: imagesOf(media),
    similarIds: String(form.get('similarIds') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    lat,
    lng,
  }
}

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
  const status = form.get('status') === 'published' ? 'published' : 'hidden'
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
