import { notFound } from 'next/navigation'
import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, sports } from '@/db/schema'
import ServiceForm from '@/components/admin/ServiceForm'
import { Flash, PageHeader } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { createService } from '../actions'

export const metadata = { title: 'Yangi xizmat' }

export default async function NewServicePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff()
  const params = await searchParams
  const db = await getDb()
  const [complex] = await db.select().from(complexes).where(eq(complexes.id, params.complex ?? '')).limit(1)
  if (!complex) notFound()
  const sportList = await db.select({ id: sports.id, title: sports.title }).from(sports).orderBy(asc(sports.sortOrder))
  return (
    <>
      <PageHeader
        title="Yangi xizmat"
        description={complex.name}
        crumbs={[{ href: '/admin/complexes', label: 'Majmualar' }, { href: `/admin/complexes/${complex.id}`, label: complex.name }]}
      />
      <Flash params={params} />
      <ServiceForm complexId={complex.id} sports={sportList} action={createService} submitLabel="Qo‘shish" />
    </>
  )
}
