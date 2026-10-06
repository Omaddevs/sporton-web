import { count, desc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { supportTickets } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Empty, Flash, PageHeader, Pagination, StatusBadge, Tabs, withQuery } from '@/components/admin/ui'
import { formatDateTime, PAGE_SIZE, pageParam, requireStaff, str } from '@/lib/admin'
import { setTicketStatus } from './actions'

export const metadata = { title: 'Murojaatlar' }

export default async function TicketsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff()
  const params = await searchParams
  const status = str(params.status) || 'open'
  const page = pageParam(params.page)
  const db = await getDb()
  const where = status === 'all' ? undefined : eq(supportTickets.status, status as 'open')
  const [rows, [{ total }]] = await Promise.all([
    db.select().from(supportTickets).where(where).orderBy(desc(supportTickets.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(supportTickets).where(where),
  ])
  const back = withQuery('/admin/tickets', params, {})

  return (
    <>
      <PageHeader title="Murojaatlar" description="Foydalanuvchilarning qo‘llab-quvvatlash xizmatiga yozgan xabarlari." />
      <Flash params={params} />
      <section className="card">
        <div className="toolbar">
          <Tabs base="/admin/tickets" params={params} name="status" current={status} items={[
            { id: 'open', label: 'Ochiq' },
            { id: 'closed', label: 'Yopilgan' },
            { id: 'all', label: 'Barchasi' },
          ]} />
        </div>
        {rows.length ? (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {rows.map((t) => (
              <li key={t.id} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <span className="cell-main">{t.topic}</span>
                    <span className="cell-sub">{t.name} · {t.contact} · {formatDateTime(t.createdAt)}</span>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{t.message}</p>
                <form action={setTicketStatus} style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="back" value={back} />
                  <input className="input" name="adminNote" defaultValue={t.adminNote ?? ''} placeholder={t.userId ? 'Javob — «Hal qilindi» bosilganda foydalanuvchiga yuboriladi' : 'Izoh (foydalanuvchi hisobsiz — javob yuborilmaydi)'} style={{ flex: 1, minWidth: 200, height: 32 }} />
                  {t.status === 'open' ? (
                    <ConfirmButton className="btn btn--sm btn--success" name="status" value="closed">Hal qilindi</ConfirmButton>
                  ) : (
                    <ConfirmButton name="status" value="open">Qayta ochish</ConfirmButton>
                  )}
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="Murojaat yo‘q" />
        )}
        <Pagination base="/admin/tickets" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
