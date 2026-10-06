import { and, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings, complexes, services } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Empty, Flash, PageHeader, Pagination, StatusBadge, Tabs, withQuery } from '@/components/admin/ui'
import { formatDateTime, PAGE_SIZE, pageParam, requireStaff, str } from '@/lib/admin'
import { formatPhone, toLocalDigits } from '@/lib/phone'
import { setBookingStatus } from './actions'

export const metadata = { title: 'Bronlar' }

const STATUS_TABS = [
  { id: '', label: 'Barchasi' },
  { id: 'pending', label: 'Kutilmoqda' },
  { id: 'confirmed', label: 'Tasdiqlangan' },
  { id: 'completed', label: 'Yakunlangan' },
  { id: 'cancelled', label: 'Bekor qilingan' },
] as const

export default async function BookingsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff()
  const params = await searchParams
  const status = str(params.status)
  const q = str(params.q)
  const page = pageParam(params.page)
  const db = await getDb()

  const filters: SQL[] = []
  if (STATUS_TABS.some((t) => t.id === status && status)) filters.push(eq(bookings.status, status as 'pending'))
  if (q) {
    const digits = toLocalDigits(q)
    filters.push(
      or(
        ilike(bookings.code, `%${q}%`),
        ilike(bookings.customerName, `%${q}%`),
        ilike(complexes.name, `%${q}%`),
        ...(digits.length >= 3 ? [ilike(bookings.customerPhone, `%${digits}%`)] : []),
      )!,
    )
  }
  const where = filters.length ? and(...filters) : undefined

  const base = db
    .select({
      id: bookings.id,
      code: bookings.code,
      status: bookings.status,
      date: bookings.date,
      hour: bookings.hour,
      customerName: bookings.customerName,
      customerPhone: bookings.customerPhone,
      priceLabel: bookings.priceLabel,
      note: bookings.note,
      createdAt: bookings.createdAt,
      serviceTitle: services.title,
      complexId: bookings.complexId,
      complexName: complexes.name,
    })
    .from(bookings)
    .innerJoin(services, eq(services.id, bookings.serviceId))
    .innerJoin(complexes, eq(complexes.id, bookings.complexId))

  const [rows, [{ total }]] = await Promise.all([
    base.where(where).orderBy(desc(bookings.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db
      .select({ total: count() })
      .from(bookings)
      .innerJoin(complexes, eq(complexes.id, bookings.complexId))
      .where(where),
  ])

  const back = withQuery('/admin/bookings', params, {})

  return (
    <>
      <PageHeader title="Bronlar" description="Mijozlar bronlarini tasdiqlang, bekor qiling yoki yakunlang." />
      <Flash params={params} />
      <section className="card">
        <div className="toolbar">
          <Tabs base="/admin/bookings" params={params} name="status" current={status} items={[...STATUS_TABS]} />
          <form style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {status && <input type="hidden" name="status" value={status} />}
            <input className="input" name="q" defaultValue={q} placeholder="Kod, ism, telefon yoki majmua…" />
            <button className="btn">Qidirish</button>
          </form>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Kod</th>
                  <th>Mijoz</th>
                  <th>Xizmat</th>
                  <th>Vaqt</th>
                  <th>Narx</th>
                  <th>Holat</th>
                  <th className="num">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr key={b.id}>
                    <td className="nowrap">
                      <span className="cell-main">{b.code}</span>
                      <span className="cell-sub">{formatDateTime(b.createdAt)}</span>
                    </td>
                    <td>
                      <span className="cell-main">{b.customerName}</span>
                      <a className="cell-sub" href={`tel:+998${b.customerPhone}`}>{formatPhone(b.customerPhone)}</a>
                    </td>
                    <td>
                      <span className="cell-main">{b.serviceTitle}</span>
                      <span className="cell-sub">{b.complexName}</span>
                      {b.note && <span className="cell-sub">💬 {b.note}</span>}
                    </td>
                    <td className="nowrap">
                      {b.date ? (
                        <>
                          <span className="cell-main">{b.date}</span>
                          <span className="cell-sub">{String(b.hour).padStart(2, '0')}:00</span>
                        </>
                      ) : (
                        <span className="muted">Kelishiladi</span>
                      )}
                    </td>
                    <td>{b.priceLabel}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <form action={setBookingStatus} className="row-actions">
                        <input type="hidden" name="id" value={b.id} />
                        <input type="hidden" name="back" value={back} />
                        {b.status === 'pending' && (
                          <ConfirmButton className="btn btn--sm btn--success" name="status" value="confirmed">
                            Tasdiqlash
                          </ConfirmButton>
                        )}
                        {b.status === 'confirmed' && (
                          <ConfirmButton className="btn btn--sm" name="status" value="completed">
                            Yakunlash
                          </ConfirmButton>
                        )}
                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <ConfirmButton className="btn btn--sm btn--danger" name="status" value="cancelled" confirm={`${b.code} bronini bekor qilasizmi?`}>
                            Bekor qilish
                          </ConfirmButton>
                        )}
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Bron topilmadi">Filtr yoki qidiruvni o‘zgartirib ko‘ring.</Empty>
        )}
        <Pagination base="/admin/bookings" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
