'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { partners } from '@/db/schema'
import { field, requireStaff } from '@/lib/admin'
import { audit } from '@/lib/audit'

const fail = (message: string) => redirect(`/admin/partners?error=${encodeURIComponent(message)}`)

const isImageUrl = (url: string) => /^https:\/\//.test(url) || /^\/(images|api\/v1\/files)\//.test(url)

export async function savePartner(form: FormData) {
  const actor = await requireStaff('admin')
  const existing = field(form, 'id')
  const name = field(form, 'name')
  const logo = field(form, 'logo')
  const link = field(form, 'link')
  if (!name) fail('Hamkor nomini kiriting')
  if (!logo || !isImageUrl(logo)) fail('Logotip rasmini yuklang yoki https:// havola kiriting')
  if (link && !/^https?:\/\//.test(link)) fail('Sayt havolasi http:// yoki https:// bilan boshlanishi kerak')

  const data = {
    name: name!,
    logo: logo!,
    link,
    sortOrder: Number(field(form, 'sortOrder') ?? 0) || 0,
    active: form.get('active') === 'on',
  }
  const db = await getDb()
  let id = existing
  try {
    if (existing) await db.update(partners).set(data).where(eq(partners.id, existing))
    else [{ id }] = await db.insert(partners).values(data).returning({ id: partners.id })
  } catch {
    fail('Saqlab bo‘lmadi')
  }
  await audit(actor.id, existing ? 'partner.update' : 'partner.create', 'partner', id ?? name!)
  redirect(`/admin/partners?ok=${encodeURIComponent('Saqlandi')}`)
}

export async function deletePartner(form: FormData) {
  const actor = await requireStaff('admin')
  const id = String(form.get('id'))
  const db = await getDb()
  await db.delete(partners).where(eq(partners.id, id))
  await audit(actor.id, 'partner.delete', 'partner', id)
  redirect(`/admin/partners?ok=${encodeURIComponent('Hamkor o‘chirildi')}`)
}
