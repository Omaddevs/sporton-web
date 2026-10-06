'use server'

import { and, eq, ne } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { news } from '@/db/schema'
import { field, lines, requireStaff, slugify } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { isUniqueViolation } from '@/lib/booking'
import { normalizeMedia } from '@/lib/media'
import { kickScheduler } from '@/lib/scheduler'
import { broadcasts } from '@/db/schema'

function readNews(form: FormData) {
  const title = field(form, 'title')
  const category = field(form, 'category')
  if (!title || title.length < 5) throw new Error('Sarlavha kamida 5 belgi bo‘lsin')
  if (!category) throw new Error('Kategoriyani kiriting')
  const paragraphs = lines(form, 'paragraphs')
  const quoteText = field(form, 'quoteText')
  const publishedAt = field(form, 'publishedAt')
  const image = field(form, 'image')
  if (image && ((!/^https:\/\//.test(image) && !/^\/(images|api\/v1\/files)\/[\w./-]+$/.test(image)) || image.includes('..'))) {
    throw new Error('Muqova rasmi manzili noto‘g‘ri')
  }
  let gallery: unknown = []
  try {
    gallery = JSON.parse(String(form.get('gallery') ?? '[]'))
  } catch {
    throw new Error('Galereya ro‘yxati noto‘g‘ri')
  }
  return {
    title,
    category,
    excerpt: field(form, 'excerpt') ?? '',
    image,
    imageCaption: field(form, 'imageCaption'),
    gallery: normalizeMedia(gallery),
    tags: String(form.get('tags') ?? '')
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`)),
    body: {
      lead: field(form, 'lead') ?? field(form, 'excerpt') ?? '',
      paragraphs,
      quote: quoteText ? { text: quoteText, author: field(form, 'quoteAuthor') ?? '' } : null,
    },
    featured: form.get('featured') === 'on',
    status: form.get('status') === 'draft' ? ('draft' as const) : ('published' as const),
    authorName: field(form, 'authorName') ?? 'SportON tahririyati',
    // Forma Toshkent vaqtida (UTC+5) ko‘rsatadi — server vaqt zonasidan qat’i nazar shunday o‘qiymiz
    publishedAt: publishedAt ? new Date(`${publishedAt}:00+05:00`) : new Date(),
  }
}

const fail = (path: string, error: unknown): never =>
  redirect(`${path}?error=${encodeURIComponent(error instanceof Error ? error.message : 'Xatolik')}`)

/** «Foydalanuvchilarga xabar berish» belgilangan bo‘lsa — yangilik haqida jo‘natma (bir maqolaga bir marta) */
async function announce(form: FormData, id: string, actorId: string) {
  if (form.get('notify') !== 'on' || form.get('status') === 'draft') return false
  const db = await getDb()
  const link = `/yangilik/${id}`
  const [existing] = await db.select({ id: broadcasts.id }).from(broadcasts).where(eq(broadcasts.link, link)).limit(1)
  if (existing) return false
  const [item] = await db.select().from(news).where(eq(news.id, id)).limit(1)
  if (!item) return false
  const at = item.publishedAt.getTime() > Date.now() ? item.publishedAt : new Date()
  await db.insert(broadcasts).values({
    type: 'news',
    title: item.title.slice(0, 80),
    body: (item.excerpt || item.body?.lead || '').slice(0, 300) || 'Yangi maqola e’lon qilindi',
    link,
    audience: { kind: 'all' },
    channels: { telegram: false, push: true },
    status: 'scheduled',
    scheduledAt: at,
    createdBy: actorId,
  })
  kickScheduler()
  return true
}

async function unsetOtherFeatured(id: string) {
  const db = await getDb()
  await db.update(news).set({ featured: false }).where(and(eq(news.featured, true), ne(news.id, id)))
}

export async function createNews(form: FormData) {
  const actor = await requireStaff()
  let id = ''
  try {
    const data = readNews(form)
    id = slugify(field(form, 'id') ?? data.title) || `yangilik-${Date.now()}`
    const db = await getDb()
    await db.insert(news).values({ id, ...data })
    if (data.featured) await unsetOtherFeatured(id)
  } catch (error) {
    fail('/admin/news/new', isUniqueViolation(error) ? new Error('Bunday ID bilan yangilik mavjud') : error)
  }
  await audit(actor.id, 'news.create', 'news', id)
  const announced = await announce(form, id, actor.id)
  redirect(`/admin/news/${id}?ok=${encodeURIComponent(announced ? 'Yangilik yaratildi, foydalanuvchilarga xabar yuborilmoqda' : 'Yangilik yaratildi')}`)
}

export async function updateNews(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  try {
    const data = readNews(form)
    const db = await getDb()
    await db.update(news).set(data).where(eq(news.id, id))
    if (data.featured) await unsetOtherFeatured(id)
  } catch (error) {
    fail(`/admin/news/${id}`, error)
  }
  await audit(actor.id, 'news.update', 'news', id)
  const announced = await announce(form, id, actor.id)
  redirect(`/admin/news/${id}?ok=${encodeURIComponent(announced ? 'Saqlandi, foydalanuvchilarga xabar yuborilmoqda' : 'Saqlandi')}`)
}

export async function deleteNews(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const db = await getDb()
  await db.delete(news).where(eq(news.id, id))
  await audit(actor.id, 'news.delete', 'news', id)
  redirect(`/admin/news?ok=${encodeURIComponent('Yangilik o‘chirildi')}`)
}

/** Ro‘yxatdan tezkor: e’lon qilish ↔ qoralamaga qaytarish */
export async function setNewsStatus(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const status = form.get('status') === 'published' ? 'published' : 'draft'
  const db = await getDb()
  await db.update(news).set({ status }).where(eq(news.id, id))
  await audit(actor.id, `news.${status}`, 'news', id)
  redirect(`/admin/news?ok=${encodeURIComponent(status === 'published' ? 'Yangilik e’lon qilindi' : 'Yangilik qoralamaga o‘tkazildi')}`)
}
