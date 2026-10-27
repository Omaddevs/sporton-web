import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, sports } from '@/db/schema'
import ServiceForm from '@/components/admin/ServiceForm'
import { Flash, PageHeader } from '@/components/admin/ui'
import { requireOwnedComplex } from '@/lib/owner'
import { ownerCreateService } from '../../actions'

export const metadata = { title: 'Yangi xizmat' }

export default async function OwnerNewServicePage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const complexId = params.complex ?? ''
  await requireOwnedComplex(complexId)
  const db = await getDb()
  const [complex] = await db.select({ name: complexes.name }).from(complexes).where(eq(complexes.id, complexId)).limit(1)
  const sportList = await db.select({ id: sports.id, title: sports.title }).from(sports).orderBy(asc(sports.sortOrder))
  return (
    <>
      <PageHeader
        title="Yangi xizmat"
        description={complex.name}
        crumbs={[
          { href: '/kabinet', label: 'Kabinet' },
          { href: `/kabinet/majmua/${encodeURIComponent(complexId)}`, label: complex.name },
        ]}
      />
      <Flash params={params} />
      <ServiceForm complexId={complexId} sports={sportList} action={ownerCreateService} submitLabel="Qo‘shish" />
    </>
  )
}
