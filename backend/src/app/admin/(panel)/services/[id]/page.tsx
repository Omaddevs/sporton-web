import { notFound } from 'next/navigation'
import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, services, sports } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import ServiceForm from '@/components/admin/ServiceForm'
import { Flash, PageHeader } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { deleteService, updateService } from '../actions'

export default async function EditServicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const user = await requireStaff()
  const id = Number((await params).id)
  if (!Number.isInteger(id)) notFound()
  const db = await getDb()
  const [row] = await db
    .select({ service: services, complexName: complexes.name })
    .from(services)
    .innerJoin(complexes, eq(complexes.id, services.complexId))
    .where(eq(services.id, id))
    .limit(1)
  if (!row) notFound()
  const sportList = await db.select({ id: sports.id, title: sports.title }).from(sports).orderBy(asc(sports.sortOrder))
  const { service } = row

  return (
    <>
      <PageHeader
        title={service.title}
        description={`#${service.id} · ${service.views} marta ko‘rilgan`}
        crumbs={[
          { href: '/admin/complexes', label: 'Majmualar' },
          { href: `/admin/complexes/${service.complexId}`, label: row.complexName },
        ]}
        actions={
          user.role === 'admin' ? (
            <form action={deleteService}>
              <input type="hidden" name="id" value={service.id} />
              <ConfirmButton className="btn btn--danger" confirm="Xizmat va unga bog‘liq bronlar o‘chirilsinmi?">
                O‘chirish
              </ConfirmButton>
            </form>
          ) : null
        }
      />
      <Flash params={await searchParams} />
      <ServiceForm service={service} complexId={service.complexId} sports={sportList} action={updateService} submitLabel="Saqlash" />
    </>
  )
}
