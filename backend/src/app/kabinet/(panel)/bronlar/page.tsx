import { and, count, desc, eq, ilike, inArray, or, type SQL } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings, complexes, services } from '@/db/schema'
import OwnerBookingRow from '@/components/admin/OwnerBookingRow'
import { Empty, Flash, PageHeader, Pagination, Tabs, withQuery } from '@/components/admin/ui'
import { PAGE_SIZE, pageParam, str } from '@/lib/admin'
import { requireOwner } from '@/lib/owner'
import { toLocalDigits } from '@/lib/phone'

export const metadata = { title: 'Bronlar' }

const STATUS_TABS = [
  { id: '', label: 'Barchasi' },
  { id: 'pending', label: 'Yangi' },
  { id: 'confirmed', label: 'Tasdiqlangan' },
  { id: 'completed', label: 'Yakunlangan' },
  { id: 'cancelled', label: 'Bekor qilingan' },
]

export default async function OwnerBookingsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const { owned, complexIds } = await requireOwner()
  const params = await searchParams
  const status = str(params.status)
  const complex = str(params.complex)
  const q = str(params.q)
  const page = pageParam(params.page)
  const db = await getDb()

  const ids = complex && complexIds.includes(complex) ? [complex] : complexIds
  const filters: SQL[] = [inArray(bookings.complexId, ids)]
  if (STATUS_TABS.some((t) => t.id && t.id === status)) filters.push(eq(bookings.status, status as 'pending'))
  if (q) {
    const digits = toLocalDigits(q)
    filters.push(
      or(
        ilike(bookings.code, `%${q}%`),
        ilike(bookings.customerName, `%${q}%`),
        ...(digits.length >= 3 ? [ilike(bookings.customerPhone, `%${digits}%`)] : []),
      )!,
    )
  }
  const where = and(...filters)

  const [rows, [{ total }]] = await Promise.all([
    db
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
        complexName: complexes.name,
      })
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .innerJoin(complexes, eq(complexes.id, bookings.complexId))
      .where(where)
      .orderBy(desc(bookings.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(bookings).where(where),
  ])
  const back = withQuery('/kabinet/bronlar', params, {})

  return (
    <>
      <PageHeader title="Bronlar" description="Yangi bronlarni tasdiqlang yoki bekor qiling — mijozga sayt va Telegram orqali xabar boradi." />
      <Flash params={params} />
      <section className="card">
        <div className="toolbar">
          <Tabs base="/kabinet/bronlar" params={params} name="status" current={status} items={STATUS_TABS} />
          {owned.length > 1 && (
            <Tabs
              base="/kabinet/bronlar"
              params={params}
              name="complex"
              current={complex}
              items={[{ id: '', label: 'Barcha majmualar' }, ...owned.map((c) => ({ id: c.id, label: c.name }))]}
            />
          )}
          <form style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {status && <input type="hidden" name="status" value={status} />}
            {complex && <input type="hidden" name="complex" value={complex} />}
            <input className="input" name="q" defaultValue={q} placeholder="Kod, ism yoki telefon…" />
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
                  <th>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <OwnerBookingRow key={b.id} b={b} back={back} showComplex={owned.length > 1} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Bron topilmadi">Yangi bronlar shu yerda chiqadi va Telegram’ga ham xabar keladi.</Empty>
        )}
        <Pagination base="/kabinet/bronlar" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
