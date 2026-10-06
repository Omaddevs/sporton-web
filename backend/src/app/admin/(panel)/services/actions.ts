'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { services, SERVICE_TYPES, sports } from '@/db/schema'
import { field, lines, requireStaff } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { invalidateCatalog, parsePriceValue } from '@/lib/catalog'

async function readService(form: FormData) {
  const title = field(form, 'title')
  if (!title || title.length < 3) throw new Error('Xizmat nomini kiriting')
  const sportId = field(form, 'sportId')
  const db = await getDb()
  const [sport] = sportId ? await db.select().from(sports).where(eq(sports.id, sportId)).limit(1) : []
  if (!sport) throw new Error('Sport turini tanlang')
  const type = String(form.get('type'))
  if (!(SERVICE_TYPES as readonly string[]).includes(type)) throw new Error('Xizmat turini tanlang')
  const price = field(form, 'price')
  if (!price) throw new Error('Narxni kiriting (masalan: 250 000 so‘m / soat yoki Narxi kelishiladi)')
  const lat = field(form, 'lat')
  const lng = field(form, 'lng')
  return {
    title,
    sportId: sport.id,
    category: field(form, 'category') ?? sport.title,
    type: type as 'full',
    location: type === 'remote' ? 'Onlayn' : (field(form, 'location') ?? 'Toshkent'),
    lat: type === 'remote' || !lat ? null : Number(lat),
    lng: type === 'remote' || !lng ? null : Number(lng),
    price,
    priceValue: parsePriceValue(price),
    hours: field(form, 'hours'),
    workMode: field(form, 'workMode'),
    experience: field(form, 'experience'),
    level: field(form, 'level'),
    description: field(form, 'description'),
    tasks: lines(form, 'tasks'),
    requirements: lines(form, 'requirements'),
    offers: lines(form, 'offers'),
    status: form.get('status') === 'hidden' ? ('hidden' as const) : ('published' as const),
  }
}

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
