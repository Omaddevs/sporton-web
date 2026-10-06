'use server'

import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { ads } from '@/db/schema'
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
