import 'server-only'
import { asc, eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { complexes } from '@/db/schema'
import { getCurrentUser } from './auth'

/**
 * Majmua egasi kabineti: admin tasdiqlagan (complexes.owner_id ga biriktirilgan) foydalanuvchi.
 * Qaytaradi: foydalanuvchi va uning majmualari. Egasi bo‘lmasa — kabinet kirish sahifasiga.
 */
export async function requireOwner() {
  const user = await getCurrentUser()
  if (!user) redirect('/kabinet/login')
  const db = await getDb()
  const owned = await db
    .select({ id: complexes.id, name: complexes.name, status: complexes.status })
    .from(complexes)
    .where(eq(complexes.ownerId, user.id))
    .orderBy(asc(complexes.name))
  if (!owned.length) redirect('/kabinet/login?error=not-owner')
  return { user, owned, complexIds: owned.map((c) => c.id) }
}

/** Bitta majmuaga ruxsat: egasi bo‘lmasa 404 o‘rniga kabinet bosh sahifasiga */
export async function requireOwnedComplex(id: string) {
  const ctx = await requireOwner()
  if (!ctx.complexIds.includes(id)) redirect('/kabinet?error=forbidden')
  return ctx
}
