'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { ads, promoSlides } from '@/db/schema'
import { field, requireStaff } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { AD_SLOTS } from './slots'

const fail = (message: string) => redirect(`/admin/ads?error=${encodeURIComponent(message)}`)

const isImageUrl = (url: string) => /^https:\/\//.test(url) || /^\/(images|api\/v1\/files)\//.test(url)
// Tashqi sayt (http/https) yoki sayt ichidagi sahifa (/majmua-qoshish, /#majmualar)
const isLink = (url: string) => /^https?:\/\//.test(url) || /^\/(?!\/)/.test(url)

export async function saveAd(form: FormData) {
  const actor = await requireStaff('admin')
  const slot = String(form.get('slot'))
  if (!AD_SLOTS.some((s) => s.id === slot)) fail('Noma’lum reklama joyi')

  const image = field(form, 'image')
  const mobileImage = field(form, 'mobileImage')
  const link = field(form, 'link')
  if (image && !isImageUrl(image)) fail('Rasm havolasi https:// bilan boshlanishi kerak')
  if (mobileImage && !isImageUrl(mobileImage)) fail('Mobil rasm havolasi https:// bilan boshlanishi kerak')
  if (link && !isLink(link)) fail('Havola https:// yoki / bilan boshlanishi kerak')

  const data = {
    image,
    mobileImage,
    link,
    ctaLabel: field(form, 'ctaLabel'),
    alt: field(form, 'alt'),
    active: form.get('active') === 'on',
  }
  const db = await getDb()
  try {
    await db.insert(ads).values({ slot, ...data }).onConflictDoUpdate({ target: ads.slot, set: data })
  } catch {
    fail('Saqlab bo‘lmadi')
  }
  await audit(actor.id, 'ad.update', 'ad', slot)
  redirect(`/admin/ads?ok=${encodeURIComponent('Saqlandi')}`)
}

export async function savePromoSlide(form: FormData) {
  const actor = await requireStaff('admin')
  const existing = field(form, 'id')
  const image = field(form, 'image')
  const mobileImage = field(form, 'mobileImage')
  const link = field(form, 'link')
  if (!image || !isImageUrl(image)) fail('Slayd rasmini yuklang yoki https:// havola kiriting')
  if (mobileImage && !isImageUrl(mobileImage)) fail('Mobil rasm havolasi https:// bilan boshlanishi kerak')
  if (link && !isLink(link)) fail('Havola https:// yoki / bilan boshlanishi kerak')

  const data = {
    image: image!,
    mobileImage,
    link,
    alt: field(form, 'alt'),
    sortOrder: Number(field(form, 'sortOrder') ?? 0) || 0,
    active: form.get('active') === 'on',
  }
  const db = await getDb()
  let id = existing
  try {
    if (existing) await db.update(promoSlides).set(data).where(eq(promoSlides.id, existing))
    else [{ id }] = await db.insert(promoSlides).values(data).returning({ id: promoSlides.id })
  } catch {
    fail('Saqlab bo‘lmadi')
  }
  await audit(actor.id, existing ? 'promo.update' : 'promo.create', 'promo', id ?? image!)
  redirect(`/admin/ads?ok=${encodeURIComponent('Saqlandi')}`)
}

/** Bitta tugma bilan slaydni yoqish/o‘chirish */
export async function togglePromoSlide(form: FormData) {
  const actor = await requireStaff('admin')
  const id = String(form.get('id'))
  const active = form.get('active') === 'on'
  const db = await getDb()
  await db.update(promoSlides).set({ active }).where(eq(promoSlides.id, id))
  await audit(actor.id, 'promo.update', 'promo', id)
  redirect(`/admin/ads?ok=${encodeURIComponent(active ? 'Slayd yoqildi' : 'Slayd o‘chirildi (yashirildi)')}`)
}

export async function deletePromoSlide(form: FormData) {
  const actor = await requireStaff('admin')
  const id = String(form.get('id'))
  const db = await getDb()
  await db.delete(promoSlides).where(eq(promoSlides.id, id))
  await audit(actor.id, 'promo.delete', 'promo', id)
  redirect(`/admin/ads?ok=${encodeURIComponent('Slayd o‘chirildi')}`)
}
