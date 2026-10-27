'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { REEL_TONES, reels } from '@/db/schema'
import { field, requireStaff } from '@/lib/admin'
import { audit } from '@/lib/audit'

const go = (kind: 'ok' | 'error', message: string): never => redirect(`/admin/reels?${kind}=${encodeURIComponent(message)}`)

const isMediaUrl = (url: string) => /^https:\/\//.test(url) || /^\/(images|videos|api\/v1\/files)\//.test(url)

/** instagram.com/reel/<code>/ havolasi yoki kodning o‘zi → kod */
function parseCode(raw: string | null) {
  const value = (raw ?? '').trim()
  const fromUrl = /instagram\.com\/(?:reel|reels|p)\/([\w-]{5,40})/i.exec(value)?.[1]
  const code = fromUrl ?? value
  return /^[\w-]{5,40}$/.test(code) ? code : null
}

export async function saveReel(form: FormData) {
  const actor = await requireStaff()
  const original = field(form, 'original')
  const code = original ?? parseCode(field(form, 'code'))
  if (!code) go('error', 'Instagram reel havolasini yoki kodini kiriting (instagram.com/reel/<kod>/)')
  const title = field(form, 'title')
  if (!title || title.length < 3) go('error', 'Sarlavhani kiriting')
  const cover = field(form, 'cover')
  if (!cover || !isMediaUrl(cover)) go('error', 'Muqova rasmini yuklang')
  const video = field(form, 'video')
  if (video && !isMediaUrl(video)) go('error', 'Video havolasi https:// yoki /videos/ bilan boshlanishi kerak')
  const tone = String(form.get('tagTone'))
  const publishedOn = field(form, 'publishedOn')

  const data = {
    title: title!.slice(0, 160),
    tag: (field(form, 'tag') ?? 'SportON').slice(0, 40),
    tagTone: ((REEL_TONES as readonly string[]).includes(tone) ? tone : 'blue') as (typeof REEL_TONES)[number],
    cover: cover!,
    video,
    publishedOn: publishedOn && /^\d{4}-\d{2}-\d{2}$/.test(publishedOn) ? publishedOn : null,
    sortOrder: Number(field(form, 'sortOrder') ?? 0) || 0,
    active: form.get('active') === 'on',
  }
  const db = await getDb()
  try {
    if (original) await db.update(reels).set(data).where(eq(reels.code, original))
    else await db.insert(reels).values({ code: code!, ...data })
  } catch {
    go('error', original ? 'Saqlab bo‘lmadi' : 'Bu reel allaqachon qo‘shilgan')
  }
  await audit(actor.id, original ? 'reel.update' : 'reel.create', 'reel', code)
  go('ok', 'Saqlandi')
}

export async function toggleReel(form: FormData) {
  const actor = await requireStaff()
  const code = String(form.get('code'))
  const active = form.get('active') === 'on'
  const db = await getDb()
  await db.update(reels).set({ active }).where(eq(reels.code, code))
  await audit(actor.id, 'reel.update', 'reel', code)
  go('ok', active ? 'Reel saytda ko‘rsatildi' : 'Reel yashirildi')
}

export async function deleteReel(form: FormData) {
  const actor = await requireStaff('admin')
  const code = String(form.get('code'))
  const db = await getDb()
  await db.delete(reels).where(eq(reels.code, code))
  await audit(actor.id, 'reel.delete', 'reel', code)
  go('ok', 'Reel o‘chirildi')
}
