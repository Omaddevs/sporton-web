'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { events, type EventFaqItem, type EventScheduleItem } from '@/db/schema'
import { field, requireStaff, slugify } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { isUniqueViolation } from '@/lib/booking'

const fail = (path: string, error: unknown): never =>
  redirect(`${path}?error=${encodeURIComponent(error instanceof Error ? error.message : 'Xatolik')}`)

function json(form: FormData, name: string): unknown[] {
  try {
    const value = JSON.parse(String(form.get(name) ?? '[]'))
    return Array.isArray(value) ? value : []
  } catch {
    throw new Error('Ro‘yxat ma’lumotlari noto‘g‘ri')
  }
}

const text = (v: unknown, max = 1000) => String(v ?? '').trim().slice(0, max)
const strings = (list: unknown[], max = 1000) => list.map((v) => text(v, max)).filter(Boolean).slice(0, 50)

/** «2026-10-20T07:00» — Toshkent vaqti (UTC+5) */
function tashkentDate(value: string | null, label: string) {
  const d = value ? new Date(`${value}:00+05:00`) : null
  if (!d || Number.isNaN(d.getTime())) throw new Error(`${label} noto‘g‘ri`)
  return d
}

function readEvent(form: FormData) {
  const title = field(form, 'title')
  const category = field(form, 'category')
  const location = field(form, 'location')
  if (!title || title.length < 5) throw new Error('Tadbir nomi kamida 5 belgi bo‘lsin')
  if (!category) throw new Error('Kategoriyani kiriting')
  if (!location) throw new Error('Qisqa manzilni kiriting')

  const startsAt = tashkentDate(field(form, 'startsAt'), 'Boshlanish vaqti')
  const endsAt = tashkentDate(field(form, 'endsAt'), 'Tugash vaqti')
  if (endsAt < startsAt) throw new Error('Tugash vaqti boshlanishdan oldin bo‘lishi mumkin emas')

  const image = field(form, 'image')
  if (image && ((!/^https:\/\//.test(image) && !/^\/(images|api\/v1\/files)\/[\w./-]+$/.test(image)) || image.includes('..'))) {
    throw new Error('Muqova rasmi manzili noto‘g‘ri')
  }

  const capacity = Math.trunc(Number(field(form, 'capacity')))
  const registered = Math.trunc(Number(field(form, 'registered') ?? 0))
  if (!Number.isFinite(capacity) || capacity < 1) throw new Error('Joylar soni kamida 1 bo‘lsin')
  if (!Number.isFinite(registered) || registered < 0) throw new Error('Ro‘yxatdan o‘tganlar soni noto‘g‘ri')

  const schedule = json(form, 'schedule')
    .map((s) => s as Record<string, unknown>)
    .map((s): EventScheduleItem => ({ time: text(s.time, 40), label: text(s.label, 200), ...(text(s.note) ? { note: text(s.note, 300) } : {}) }))
    .filter((s) => s.label)
    .slice(0, 50)
  const faq = json(form, 'faq')
    .map((f) => f as Record<string, unknown>)
    .map((f): EventFaqItem => ({ q: text(f.q, 300), a: text(f.a, 2000) }))
    .filter((f) => f.q && f.a)
    .slice(0, 30)

  return {
    title,
    category,
    location,
    image,
    startsAt,
    endsAt,
    excerpt: field(form, 'excerpt') ?? '',
    about: strings(json(form, 'about'), 4000),
    includes: strings(json(form, 'includes'), 200),
    rules: strings(json(form, 'rules'), 300),
    schedule,
    faq,
    organizerName: field(form, 'organizerName') ?? 'SportON',
    organizerRole: field(form, 'organizerRole') ?? 'Tashkilotchi',
    venueName: field(form, 'venueName'),
    venueAddress: field(form, 'venueAddress'),
    fee: field(form, 'fee') ?? 'Bepul',
    prize: field(form, 'prize'),
    level: field(form, 'level') ?? 'Barcha darajalar',
    age: field(form, 'age') ?? 'Cheklovsiz',
    capacity,
    registered: Math.min(registered, capacity),
    status: form.get('status') === 'draft' ? ('draft' as const) : ('published' as const),
  }
}

export async function createEvent(form: FormData) {
  const actor = await requireStaff()
  let id = ''
  try {
    const data = readEvent(form)
    id = slugify(field(form, 'slug') ?? data.title) || `tadbir-${Date.now()}`
    const db = await getDb()
    await db.insert(events).values({ id, ...data })
  } catch (error) {
    fail('/admin/events/new', isUniqueViolation(error) ? new Error('Bunday ID bilan tadbir mavjud — boshqa ID kiriting') : error)
  }
  await audit(actor.id, 'event.create', 'event', id)
  redirect(`/admin/events/${id}?ok=${encodeURIComponent('Tadbir yaratildi')}`)
}

export async function updateEvent(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  try {
    const data = readEvent(form)
    const db = await getDb()
    await db.update(events).set(data).where(eq(events.id, id))
  } catch (error) {
    fail(`/admin/events/${id}`, error)
  }
  await audit(actor.id, 'event.update', 'event', id)
  redirect(`/admin/events/${id}?ok=${encodeURIComponent('Saqlandi')}`)
}

export async function deleteEvent(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const db = await getDb()
  await db.delete(events).where(eq(events.id, id))
  await audit(actor.id, 'event.delete', 'event', id)
  redirect(`/admin/events?ok=${encodeURIComponent('Tadbir o‘chirildi')}`)
}

/** Ro‘yxatdan tezkor: e’lon qilish ↔ qoralamaga qaytarish */
export async function setEventStatus(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const status = form.get('status') === 'published' ? 'published' : 'draft'
  const db = await getDb()
  await db.update(events).set({ status }).where(eq(events.id, id))
  await audit(actor.id, `event.${status}`, 'event', id)
  redirect(`/admin/events?ok=${encodeURIComponent(status === 'published' ? 'Tadbir e’lon qilindi' : 'Tadbir qoralamaga o‘tkazildi')}`)
}

/** Nusxa: qoralama sifatida, ro‘yxat va ko‘rishlar nolga tushadi */
export async function duplicateEvent(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const db = await getDb()
  const [source] = await db.select().from(events).where(eq(events.id, id)).limit(1)
  if (!source) fail('/admin/events', new Error('Tadbir topilmadi'))
  const copyId = `${id}-nusxa-${Date.now().toString(36)}`
  const { createdAt: _c, updatedAt: _u, ...rest } = source!
  await db.insert(events).values({ ...rest, id: copyId, title: `${source!.title} (nusxa)`, status: 'draft', registered: 0, views: 0 })
  await audit(actor.id, 'event.create', 'event', copyId)
  redirect(`/admin/events/${copyId}?ok=${encodeURIComponent('Nusxa qoralama sifatida yaratildi')}`)
}
