'use server'

import { and, desc, eq, ilike, inArray, or } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { broadcasts, NOTIFICATION_TYPES, users, type BroadcastAudience, type NotificationType } from '@/db/schema'
import { field, requireStaff } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { notifyUser } from '@/lib/notify'
import { formatPhone, toLocalDigits } from '@/lib/phone'
import { kickScheduler } from '@/lib/scheduler'

const BASE = '/admin/notifications'
const go = (path: string, kind: 'ok' | 'error', message: string): never =>
  redirect(`${path}${path.includes('?') ? '&' : '?'}${kind}=${encodeURIComponent(message)}`)

/** Ichki yo‘l (/…) yoki https havola */
function validLink(link: string | null) {
  if (!link) return null
  if (/^\/(?!\/)[\w\-./?=&#%]*$/.test(link) || /^https:\/\/[^\s]+$/.test(link)) return link
  throw new Error('Havola «/» bilan boshlanadigan sayt sahifasi yoki https:// manzil bo‘lishi kerak')
}

async function readForm(form: FormData) {
  const type = String(form.get('type')) as NotificationType
  if (!NOTIFICATION_TYPES.includes(type)) throw new Error('Turini tanlang')
  const title = field(form, 'title')
  const body = field(form, 'body')
  if (!title || title.length < 3) throw new Error('Sarlavha kamida 3 belgi bo‘lsin')
  if (title.length > 80) throw new Error('Sarlavha 80 belgidan oshmasin')
  if (!body || body.length < 3) throw new Error('Matnni kiriting')
  if (body.length > 500) throw new Error('Matn 500 belgidan oshmasin')
  const link = validLink(field(form, 'link'))

  const kind = String(form.get('audience'))
  let audience: BroadcastAudience
  if (kind === 'users') {
    const db = await getDb()
    const ids = new Set(form.getAll('userIds').map(String).filter(Boolean))
    const phones = String(form.get('phones') ?? '')
      .split(/[\n,;]+/)
      .map((p) => toLocalDigits(p))
      .filter((p) => p.length === 9)
    if (phones.length) {
      const found = await db.select({ id: users.id, phone: users.phone }).from(users).where(inArray(users.phone, phones))
      const missing = phones.filter((p) => !found.some((f) => f.phone === p))
      if (missing.length) throw new Error(`Topilmadi: ${missing.map((p) => `+998${p}`).join(', ')}`)
      found.forEach((f) => ids.add(f.id))
    }
    if (!ids.size) throw new Error('Kamida bitta foydalanuvchini tanlang yoki telefon raqamini kiriting')
    audience = { kind: 'users', userIds: [...ids] }
  } else if (kind === 'bookers' || kind === 'active30' || kind === 'all') {
    audience = { kind }
  } else {
    // Hech qachon taxmin qilmaymiz — noto‘g‘ri forma hammaga yuborib yubormasin
    throw new Error('Kimga yuborishni tanlang')
  }

  const when = String(form.get('when') ?? '')
  if (when !== 'now' && when !== 'later') throw new Error('Yuborish vaqtini tanlang')
  let scheduledAt: Date | null = null
  if (when === 'later') {
    const raw = field(form, 'scheduledAt')
    if (!raw) throw new Error('Yuborish vaqtini tanlang')
    scheduledAt = new Date(`${raw}:00+05:00`)
    if (Number.isNaN(scheduledAt.getTime())) throw new Error('Vaqt noto‘g‘ri')
    if (scheduledAt.getTime() < Date.now() - 60_000) throw new Error('Yuborish vaqti o‘tib ketgan')
  }

  return {
    type,
    title,
    body,
    link,
    audience,
    channels: { telegram: form.get('telegram') === 'on', push: form.get('push') === 'on' },
    scheduledAt,
  }
}

export type FormState = { error?: string; at?: number }

export async function createBroadcast(_prev: FormState, form: FormData): Promise<FormState> {
  const actor = await requireStaff()
  const intent = String(form.get('intent') ?? 'send')
  let id = ''
  let data: Awaited<ReturnType<typeof readForm>>
  try {
    data = await readForm(form)
  } catch (error) {
    // Forma to‘ldirilgan holicha qoladi — faqat xato ko‘rsatiladi
    return { error: (error as Error).message, at: Date.now() }
  }
  const db = await getDb()
  const status = intent === 'draft' ? 'draft' : 'scheduled'
  const [row] = await db
    .insert(broadcasts)
    .values({ ...data, status, scheduledAt: status === 'scheduled' ? (data.scheduledAt ?? new Date()) : data.scheduledAt, createdBy: actor.id })
    .returning({ id: broadcasts.id })
  id = row.id
  await audit(actor.id, `broadcast.${status === 'draft' ? 'draft' : 'create'}`, 'broadcast', id, { audience: data.audience.kind })
  if (status === 'scheduled' && !data.scheduledAt) kickScheduler()
  return go(
    `${BASE}/${id}`,
    'ok',
    status === 'draft' ? 'Qoralama saqlandi' : data.scheduledAt ? 'Jo‘natma rejalashtirildi' : 'Yuborilmoqda…',
  )
}

export type TestState = { ok?: string; error?: string; at?: number }

/** Avval o‘zingizga sinab ko‘rish — forma tozalanmaydi (redirect yo‘q) */
export async function sendTest(_prev: TestState, form: FormData): Promise<TestState> {
  const actor = await requireStaff()
  try {
    const data = await readForm(form)
    const row = await notifyUser(
      actor.id,
      { type: data.type === 'promo' || data.type === 'news' ? 'system' : data.type, title: `[TEST] ${data.title}`, body: data.body, link: data.link },
      data.channels,
    )
    if (!row) return { error: 'Test yuborilmadi (hisobingiz faol emasmi?)', at: Date.now() }
    const parts = ['saytdagi qo‘ng‘iroqcha']
    if (data.channels.telegram) parts.push('Telegram (ulangan bo‘lsa)')
    if (data.channels.push) parts.push('brauzer push (yoqilgan bo‘lsa)')
    return { ok: `Test sizga yuborildi: ${parts.join(', ')}`, at: Date.now() }
  } catch (error) {
    return { error: (error as Error).message, at: Date.now() }
  }
}

export async function sendNow(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const db = await getDb()
  const [row] = await db
    .update(broadcasts)
    .set({ status: 'scheduled', scheduledAt: new Date() })
    .where(and(eq(broadcasts.id, id), inArray(broadcasts.status, ['draft', 'scheduled', 'failed'])))
    .returning({ id: broadcasts.id })
  if (!row) go(`${BASE}/${id}`, 'error', 'Bu jo‘natmani yuborib bo‘lmaydi')
  await audit(actor.id, 'broadcast.send', 'broadcast', id)
  kickScheduler()
  go(`${BASE}/${id}`, 'ok', 'Yuborilmoqda…')
}

export async function cancelBroadcast(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const db = await getDb()
  await db
    .update(broadcasts)
    .set({ status: 'cancelled' })
    .where(and(eq(broadcasts.id, id), eq(broadcasts.status, 'scheduled')))
  await audit(actor.id, 'broadcast.cancel', 'broadcast', id)
  go(`${BASE}/${id}`, 'ok', 'Rejalashtirilgan jo‘natma bekor qilindi')
}

export async function deleteBroadcast(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const db = await getDb()
  await db
    .delete(broadcasts)
    .where(and(eq(broadcasts.id, id), inArray(broadcasts.status, ['draft', 'cancelled', 'failed'])))
  await audit(actor.id, 'broadcast.delete', 'broadcast', id)
  go(BASE, 'ok', 'O‘chirildi')
}

export type Recipient = { id: string; name: string; phone: string; telegram: boolean }

/** Formadagi «Foydalanuvchini qidirish»: ism, familiya yoki telefon bo‘yicha (8 tagacha) */
export async function searchRecipients(query: string): Promise<Recipient[]> {
  await requireStaff()
  const q = query.trim().slice(0, 60)
  if (q.length < 2) return []
  const digits = toLocalDigits(q)
  const db = await getDb()
  const rows = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.status, 'active'),
        or(
          ilike(users.firstName, `%${q}%`),
          ilike(users.lastName, `%${q}%`),
          ...(digits.length >= 3 ? [ilike(users.phone, `%${digits}%`)] : []),
        ),
      ),
    )
    .orderBy(desc(users.lastLoginAt))
    .limit(8)
  return rows.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`.trim(),
    phone: u.phone ? formatPhone(u.phone) : '',
    telegram: Boolean(u.telegramChatId),
  }))
}
