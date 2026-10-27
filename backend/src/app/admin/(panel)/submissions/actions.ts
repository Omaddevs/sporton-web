'use server'

import { panelUrl } from '@/lib/env'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { complexes, services, sports, submissions, users } from '@/db/schema'
import { requireStaff, slugify } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { invalidateCatalog } from '@/lib/catalog'
import { REGIONS } from '@/lib/constants'
import { imagesOf, type MediaItem } from '@/lib/media'
import { notifyUserSafe } from '@/lib/notify'
import { formatPhone } from '@/lib/phone'

/** Arizani tasdiqlash: majmua (yashirin holatda) + har bir sport turi uchun xizmat yaratiladi */
export async function approveSubmission(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const publish = form.get('publish') === 'on'
  const db = await getDb()
  const [sub] = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1)
  if (!sub || sub.status !== 'pending') redirect(`/admin/submissions/${id}?error=${encodeURIComponent('Ariza allaqachon ko‘rib chiqilgan')}`)

  const p = sub.payload
  const region = REGIONS.find((r) => r.id === p.region)
  let complexId = slugify(p.name) || `majmua-${Date.now()}`
  const [clash] = await db.select({ id: complexes.id }).from(complexes).where(eq(complexes.id, complexId)).limit(1)
  if (clash) complexId = `${complexId}-${Date.now().toString(36).slice(-4)}`

  const sportRows = await db.select().from(sports)
  const media: MediaItem[] = p.media ?? (p.photos ?? []).map((url) => ({ type: 'image' as const, url, provider: 'file' as const }))
  const images = imagesOf(media)
  const hours = `${p.opens} - ${p.closes}`
  const price = `${p.price.toLocaleString('ru-RU').replace(/\s/g, ' ')} so‘m / soat`

  await db.transaction(async (tx) => {
    await tx.insert(complexes).values({
      id: complexId,
      name: p.name,
      status: publish ? 'published' : 'draft',
      listed: true,
      region: p.region,
      city: region?.city ?? null,
      location: [region?.label, p.address].filter(Boolean).join(', '),
      address: p.address,
      landmark: p.landmark || null,
      phone: formatPhone(p.phone),
      telegram: p.telegram ? (p.telegram.startsWith('@') ? p.telegram : `@${p.telegram}`) : null,
      hours,
      about: p.description,
      amenities: p.amenities,
      images,
      media,
      bannerImage: images[0] ?? null,
      ownerId: sub.userId,
    })
    const rows = p.sports.map((sportId) => {
      const sport = sportRows.find((s) => s.id === sportId)
      return {
        complexId,
        title: `${sport?.title ?? sportId} — mashg‘ulot`,
        sportId,
        category: sport?.title ?? sportId,
        type: 'full' as const,
        location: region?.city ?? 'Toshkent',
        price,
        priceValue: p.price,
        hours,
        description: p.description,
        status: publish ? ('published' as const) : ('draft' as const),
      }
    })
    if (rows.length) await tx.insert(services).values(rows)
    await tx
      .update(submissions)
      .set({ status: 'approved', complexId, reviewedBy: actor.id, reviewedAt: new Date(), adminNote: String(form.get('adminNote') ?? '') || null })
      .where(eq(submissions.id, id))
  })

  await audit(actor.id, 'submission.approve', 'submission', id, { complexId })
  invalidateCatalog()
  notifyUserSafe(sub.userId, {
    type: 'submission',
    title: 'Arizangiz tasdiqlandi 🎉',
    body: publish
      ? `«${p.name}» saytda e’lon qilindi. Bronlar va ma’lumotlarni Majmua kabinetida (telefon raqam va parolingiz bilan) boshqaring.`
      : `«${p.name}» tasdiqlandi. Majmua kabinetida ma’lumotlarni to‘ldiring — tekshirilgach saytda e’lon qilinadi.`,
    link: panelUrl('/kabinet'),
  })
  redirect(`/admin/complexes/${complexId}?ok=${encodeURIComponent('Ariza tasdiqlandi. Ma’lumotlarni tekshirib, e’lon qiling.')}`)
}

export async function rejectSubmission(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const note = String(form.get('adminNote') ?? '').trim()
  if (!note) redirect(`/admin/submissions/${id}?error=${encodeURIComponent('Rad etish sababini yozing')}`)
  const db = await getDb()
  const [sub] = await db
    .update(submissions)
    .set({ status: 'rejected', adminNote: note, reviewedBy: actor.id, reviewedAt: new Date() })
    .where(eq(submissions.id, id))
    .returning()
  await audit(actor.id, 'submission.reject', 'submission', id)
  if (sub) {
    notifyUserSafe(sub.userId, {
      type: 'submission',
      title: 'Ariza rad etildi',
      body: `«${sub.name}»: ${note}. Kamchiliklarni tuzatib, qayta yuborishingiz mumkin.`,
      link: '/majmua-qoshish',
    })
  }
  redirect(`/admin/submissions?ok=${encodeURIComponent('Ariza rad etildi')}`)
}
