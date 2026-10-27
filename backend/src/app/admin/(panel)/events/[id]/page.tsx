import { notFound } from 'next/navigation'
import { desc, eq } from 'drizzle-orm'
import { Copy, ExternalLink } from 'lucide-react'
import { getDb } from '@/db'
import { eventRegistrations, events, users } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import EventForm from '@/components/admin/EventForm'
import { Empty, Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { formatDateTime, requireStaff } from '@/lib/admin'
import { formatPhone } from '@/lib/phone'
import { deleteEvent, duplicateEvent, updateEvent } from '../actions'
import { eventCategories } from '../categories'

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  await requireStaff()
  const { id } = await params
  const db = await getDb()
  const [item] = await db.select().from(events).where(eq(events.id, decodeURIComponent(id))).limit(1)
  if (!item) notFound()
  const participants = await db
    .select({ at: eventRegistrations.createdAt, firstName: users.firstName, lastName: users.lastName, phone: users.phone })
    .from(eventRegistrations)
    .innerJoin(users, eq(users.id, eventRegistrations.userId))
    .where(eq(eventRegistrations.eventId, item.id))
    .orderBy(desc(eventRegistrations.createdAt))
  const siteUrl = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '')

  return (
    <>
      <PageHeader
        title={item.title}
        description={
          <>
            <StatusBadge status={item.status} /> · {item.views} ko‘rish · Oxirgi o‘zgarish: {formatDateTime(item.updatedAt)}
          </>
        }
        crumbs={[{ href: '/admin/events', label: 'Sport tadbirlari' }]}
        actions={
          <>
            {siteUrl && item.status === 'published' && (
              <a className="btn" href={`${siteUrl}/tadbir/${item.id}`} target="_blank" rel="noreferrer">
                <ExternalLink /> Saytda ko‘rish
              </a>
            )}
            <form action={duplicateEvent}>
              <input type="hidden" name="id" value={item.id} />
              <ConfirmButton className="btn">
                <Copy /> Nusxa
              </ConfirmButton>
            </form>
            <form action={deleteEvent}>
              <input type="hidden" name="id" value={item.id} />
              <ConfirmButton className="btn btn--danger" confirm="Tadbir o‘chirilsinmi? Bu amalni qaytarib bo‘lmaydi.">
                O‘chirish
              </ConfirmButton>
            </form>
          </>
        }
      />
      <Flash params={await searchParams} />
      <section className="card" style={{ marginBottom: 20 }}>
        <div className="card-head">
          <h2>Saytdan ro‘yxatdan o‘tganlar ({participants.length})</h2>
          <span className="muted">
            Jami: {item.registered + participants.length} / {item.capacity} (oflayn: {item.registered})
          </span>
        </div>
        {participants.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Ishtirokchi</th>
                  <th>Telefon</th>
                  <th>Ro‘yxatdan o‘tgan</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={i}>
                    <td className="cell-main">{`${p.firstName} ${p.lastName}`.trim()}</td>
                    <td>{p.phone ? <a href={`tel:+998${p.phone}`}>{formatPhone(p.phone)}</a> : '—'}</td>
                    <td className="nowrap">{formatDateTime(p.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Hali hech kim yozilmagan">Saytdagi «Ro‘yxatdan o‘tish» tugmasi orqali yozilganlar shu yerda chiqadi.</Empty>
        )}
      </section>
      <EventForm item={item} action={updateEvent} submitLabel="Saqlash" categories={await eventCategories()} />
    </>
  )
}
