import { notFound, redirect } from 'next/navigation'
import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, services, sports } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import ServiceForm from '@/components/admin/ServiceForm'
import { Flash, PageHeader } from '@/components/admin/ui'
import { requireOwner } from '@/lib/owner'
import { ownerDeleteService, ownerUpdateService } from '../../actions'

export default async function OwnerServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { complexIds } = await requireOwner()
  const id = Number((await params).id)
  if (!Number.isInteger(id)) notFound()
  const db = await getDb()
  const [row] = await db
    .select({ service: services, complexName: complexes.name })
    .from(services)
    .innerJoin(complexes, eq(complexes.id, services.complexId))
    .where(eq(services.id, id))
    .limit(1)
  if (!row || !complexIds.includes(row.service.complexId)) redirect('/kabinet?error=forbidden')
  const sportList = await db.select({ id: sports.id, title: sports.title }).from(sports).orderBy(asc(sports.sortOrder))
  const { service } = row

  return (
    <>
      <PageHeader
        title={service.title}
        description={`${service.views} marta ko‘rilgan`}
        crumbs={[
          { href: '/kabinet', label: 'Kabinet' },
          { href: `/kabinet/majmua/${encodeURIComponent(service.complexId)}`, label: row.complexName },
        ]}
        actions={
          <form action={ownerDeleteService}>
            <input type="hidden" name="id" value={service.id} />
            <ConfirmButton className="btn btn--danger" confirm="Xizmat va unga bog‘liq bronlar o‘chirilsinmi? Odatda «Yashirin» holati yetarli.">
              O‘chirish
            </ConfirmButton>
          </form>
        }
      />
      <Flash params={await searchParams} />
      <ServiceForm service={service} complexId={service.complexId} sports={sportList} action={ownerUpdateService} submitLabel="Saqlash" />
    </>
  )
}
