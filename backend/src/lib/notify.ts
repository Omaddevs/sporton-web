import 'server-only'
import { and, count, eq, exists, gte, inArray, isNull, lte, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import {
  bookings,
  broadcasts,
  complexes,
  DEFAULT_NOTIFY_PREFS,
  notifications,
  services,
  users,
  type BroadcastAudience,
  type Notification,
  type NotificationType,
  type NotifyPrefs,
  type User,
} from '@/db/schema'
import { publish } from './events'
import { sendPush } from './push'
import { sendTelegram } from './telegram'

export type NotifyInput = { type: NotificationType; title: string; body: string; link?: string | null }

export const prefsOf = (user: Pick<User, 'notifyPrefs'>): NotifyPrefs => ({ ...DEFAULT_NOTIFY_PREFS, ...user.notifyPrefs })

/** Reklama va yangiliklar — foydalanuvchi o‘chirib qo‘ygan bo‘lsa yuborilmaydi; bron/tizim — doim */
export function allowedByPrefs(type: NotificationType, prefs: NotifyPrefs) {
  if (type === 'promo') return prefs.promotions
  if (type === 'news') return prefs.news
  return true
}

export function serializeNotification(n: Notification) {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link,
    read: Boolean(n.readAt),
    createdAt: n.createdAt,
  }
}

export async function unreadCount(userId: string) {
  const db = await getDb()
  const [row] = await db
    .select({ n: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))
  return row.n
}

const siteUrl = () => (process.env.PUBLIC_SITE_URL || '').replace(/\/$/, '')

const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function telegramText(input: NotifyInput) {
  const url = input.link ? (input.link.startsWith('http') ? input.link : `${siteUrl()}${input.link}`) : ''
  return [`<b>${escapeHtml(input.title)}</b>`, escapeHtml(input.body), url.startsWith('http') ? url : '']
    .filter(Boolean)
    .join('\n\n')
}

// Telegram cheklovi ~30 xabar/soniya — navbat bilan yuboramiz
let telegramQueue: Promise<unknown> = Promise.resolve()
function queueTelegram(chatId: string, text: string) {
  const job = telegramQueue.then(async () => {
    const ok = await sendTelegram(chatId, text, { parseMode: 'HTML' })
    await new Promise((r) => setTimeout(r, 40))
    return ok
  })
  telegramQueue = job.catch(() => null)
  return job
}

/**
 * Bitta foydalanuvchiga bildirishnoma: bazaga yoziladi, ochiq vkladkalarga darhol (SSE),
 * sozlamalarga ko‘ra Telegram va brauzer push orqali ham yuboriladi. Kanallar javobni kutmaydi.
 */
export async function notifyUser(
  userId: string,
  input: NotifyInput,
  options: { telegram?: boolean; push?: boolean } = {},
) {
  const db = await getDb()
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user || user.status !== 'active') return null
  const prefs = prefsOf(user)
  if (!allowedByPrefs(input.type, prefs)) return null

  const [row] = await db
    .insert(notifications)
    .values({ userId, type: input.type, title: input.title.slice(0, 120), body: input.body.slice(0, 1000), link: input.link ?? null })
    .returning()

  publish(userId, { kind: 'notification', notification: serializeNotification(row), unread: await unreadCount(userId) })

  if ((options.telegram ?? true) && prefs.telegram && user.telegramChatId) {
    void queueTelegram(user.telegramChatId, telegramText(input))
  }
  if ((options.push ?? true) && prefs.push) {
    void sendPush([userId], { title: input.title, body: input.body, url: input.link, tag: row.id }).catch(() => 0)
  }
  return row
}

/** Xatoni yutib yuboradigan variant — asosiy amal (bron, ariza) bildirishnoma tufayli buzilmasin */
export function notifyUserSafe(userId: string | null | undefined, input: NotifyInput, options?: { telegram?: boolean; push?: boolean }) {
  if (!userId) return
  void notifyUser(userId, input, options).catch((error) => console.error('[notify]', error))
}

// ── Ommaviy jo‘natmalar ────────────────────────────────────────────

function audienceWhere(audience: BroadcastAudience) {
  const active = eq(users.status, 'active')
  switch (audience.kind) {
    case 'bookers':
      return and(
        active,
        exists(sql`(select 1 from ${bookings} where ${bookings.userId} = ${users.id})`),
      )
    case 'active30':
      return and(active, gte(users.lastLoginAt, new Date(Date.now() - 30 * 86_400_000)))
    case 'users':
      return and(active, inArray(users.id, audience.userIds.length ? audience.userIds : ['00000000-0000-0000-0000-000000000000']))
    default:
      return active
  }
}

export async function resolveAudience(audience: BroadcastAudience, type: NotificationType) {
  const db = await getDb()
  const rows = await db
    .select({ id: users.id, telegramChatId: users.telegramChatId, notifyPrefs: users.notifyPrefs })
    .from(users)
    .where(audienceWhere(audience))
  return rows
    .map((r) => ({ ...r, prefs: prefsOf(r) }))
    .filter((r) => audience.kind === 'users' || allowedByPrefs(type, r.prefs))
}

/** Admin formasi uchun taxminiy qabul qiluvchilar soni */
export async function audienceCounts() {
  const db = await getDb()
  const kinds: BroadcastAudience[] = [{ kind: 'all' }, { kind: 'bookers' }, { kind: 'active30' }]
  const result: Record<string, number> = {}
  for (const a of kinds) {
    const [row] = await db.select({ n: count() }).from(users).where(audienceWhere(a))
    result[a.kind] = row.n
  }
  return result
}

/**
 * Jo‘natmani bajarish. Bir vaqtda faqat bitta jarayon oladi (status atomik o‘zgaradi).
 * Ilovadagi bildirishnoma — hammaga; Telegram/push — tanlangan bo‘lsa va foydalanuvchi ruxsat bergan bo‘lsa.
 */
export async function runBroadcast(id: string) {
  const db = await getDb()
  const [b] = await db
    .update(broadcasts)
    .set({ status: 'sending', error: null })
    .where(and(eq(broadcasts.id, id), inArray(broadcasts.status, ['draft', 'scheduled'])))
    .returning()
  if (!b) return

  try {
    const recipients = await resolveAudience(b.audience, b.type)
    let inserted = 0
    for (let i = 0; i < recipients.length; i += 500) {
      const chunk = recipients.slice(i, i + 500)
      const rows = await db
        .insert(notifications)
        .values(chunk.map((r) => ({ userId: r.id, type: b.type, title: b.title, body: b.body, link: b.link, broadcastId: b.id })))
        .returning()
      inserted += rows.length
      for (const row of rows) publish(row.userId, { kind: 'notification', notification: serializeNotification(row), unread: -1 })
    }
    await db.update(broadcasts).set({ recipients: inserted }).where(eq(broadcasts.id, b.id))

    let telegramSent = 0
    if (b.channels.telegram) {
      const text = telegramText(b)
      const targets = recipients.filter((r) => r.telegramChatId && r.prefs.telegram)
      const results = await Promise.all(targets.map((r) => queueTelegram(r.telegramChatId!, text)))
      telegramSent = results.filter(Boolean).length
    }

    let pushSent = 0
    if (b.channels.push) {
      const ids = recipients.filter((r) => r.prefs.push).map((r) => r.id)
      pushSent = await sendPush(ids, { title: b.title, body: b.body, url: b.link, tag: b.id })
    }

    await db
      .update(broadcasts)
      .set({ status: 'sent', sentAt: new Date(), recipients: inserted, telegramSent, pushSent })
      .where(eq(broadcasts.id, b.id))
  } catch (error) {
    console.error('[broadcast]', error)
    await db
      .update(broadcasts)
      .set({ status: 'failed', error: (error as Error).message?.slice(0, 500) ?? 'Xatolik' })
      .where(eq(broadcasts.id, b.id))
  }
}

/** Vaqti kelgan rejalashtirilgan jo‘natmalar */
export async function dispatchDueBroadcasts() {
  const db = await getDb()
  const due = await db
    .select({ id: broadcasts.id })
    .from(broadcasts)
    .where(and(eq(broadcasts.status, 'scheduled'), lte(broadcasts.scheduledAt, new Date())))
    .limit(10)
  for (const b of due) await runBroadcast(b.id)
}

// ── Bron eslatmalari ───────────────────────────────────────────────

const REMIND_BEFORE_MS = 2 * 60 * 60_000
const pad = (n: number) => String(n).padStart(2, '0')

/** Tasdiqlangan bron boshlanishiga 2 soat qolganda — bir marta eslatma */
export async function sendBookingReminders() {
  const db = await getDb()
  const now = Date.now()
  const today = new Date(now + 5 * 3_600_000).toISOString().slice(0, 10)
  const tomorrow = new Date(now + 5 * 3_600_000 + 86_400_000).toISOString().slice(0, 10)

  const rows = await db
    .select({ booking: bookings, serviceTitle: services.title, complexName: complexes.name, complexId: complexes.id })
    .from(bookings)
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(complexes, eq(complexes.id, bookings.complexId))
    .where(
      and(
        eq(bookings.status, 'confirmed'),
        isNull(bookings.remindedAt),
        inArray(bookings.date, [today, tomorrow]),
      ),
    )

  for (const { booking, serviceTitle, complexName, complexId } of rows) {
    if (booking.hour == null || !booking.date || !booking.userId) continue
    const start = Date.parse(`${booking.date}T${pad(booking.hour)}:00:00+05:00`)
    const left = start - now
    if (left <= 0 || left > REMIND_BEFORE_MS) continue

    // Avval belgilaymiz — ikki parallel tekshiruv ikki marta yubormasin
    const claimed = await db
      .update(bookings)
      .set({ remindedAt: new Date() })
      .where(and(eq(bookings.id, booking.id), isNull(bookings.remindedAt)))
      .returning({ id: bookings.id })
    if (!claimed.length) continue

    const [user] = await db.select({ notifyPrefs: users.notifyPrefs }).from(users).where(eq(users.id, booking.userId)).limit(1)
    if (!user || !prefsOf(user).bookingReminders) continue

    const minutes = Math.round(left / 60_000)
    notifyUserSafe(booking.userId, {
      type: 'booking',
      title: 'Mashg‘ulot eslatmasi',
      body: `«${serviceTitle}» — ${complexName}, ${booking.date === today ? "bugun" : "ertaga"} ${pad(booking.hour)}:00 da (${minutes >= 60 ? `${Math.round(minutes / 60)} soatdan` : `${minutes} daqiqadan`} keyin). Kechikmang!`,
      link: `/sport-majmua/${complexId}`,
    })
  }
}
