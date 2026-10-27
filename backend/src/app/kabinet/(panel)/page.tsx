import Link from 'next/link'
import { and, count, desc, eq, gte, inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings, complexes, services } from '@/db/schema'
import OwnerBookingRow from '@/components/admin/OwnerBookingRow'
import { Empty, Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { ratingsByComplex } from '@/lib/catalog'
import { requireOwner } from '@/lib/owner'

export const metadata = { title: 'Bosh sahifa' }

export default async function OwnerDashboard({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const { user, complexIds } = await requireOwner()
  const params = await searchParams
  const db = await getDb()
  const monthAgo = new Date(Date.now() - 30 * 86_400_000)
  const mine = inArray(bookings.complexId, complexIds)

  const [list, [pending], [month], [done], serviceCounts, recent, ratings] = await Promise.all([
    db.select().from(complexes).where(inArray(complexes.id, complexIds)).orderBy(complexes.name),
    db.select({ n: count() }).from(bookings).where(and(mine, eq(bookings.status, 'pending'))),
    db.select({ n: count() }).from(bookings).where(and(mine, gte(bookings.createdAt, monthAgo))),
    db.select({ n: count() }).from(bookings).where(and(mine, eq(bookings.status, 'completed'), gte(bookings.createdAt, monthAgo))),
    db.select({ id: services.complexId, n: count() }).from(services).where(inArray(services.complexId, complexIds)).groupBy(services.complexId),
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
      .where(and(mine, eq(bookings.status, 'pending')))
      .orderBy(desc(bookings.createdAt))
      .limit(10),
    ratingsByComplex(complexIds),
  ])
  const svc = new Map(serviceCounts.map((s) => [s.id, s.n]))
  const views = list.reduce((sum, c) => sum + c.views, 0)

  return (
    <>
      <PageHeader title={`Xush kelibsiz, ${user.firstName}!`} description="Bronlar, majmua ma’lumotlari va sharhlar — barchasi shu yerda." />
      <Flash params={params} />
      {!user.telegramChatId && (
        <div className="alert alert--warning">
          Yangi bronlar haqida darhol xabar olish uchun Telegram botni ulang: saytda Profil → Bildirishnomalar → Telegram.
        </div>
      )}

      <section className="kpis">
        <Link href="/kabinet/bronlar?status=pending" className={`card kpi ${pending.n ? 'kpi--alert' : ''}`}>
          <span>Yangi bronlar</span>
          <strong>{pending.n}</strong>
          <em>Tasdiqlashingizni kutmoqda</em>
        </Link>
        <Link href="/kabinet/bronlar" className="card kpi">
          <span>30 kunda bronlar</span>
          <strong>{month.n}</strong>
          <em>shundan {done.n} ta yakunlangan</em>
        </Link>
        <div className="card kpi">
          <span>Sahifa ko‘rishlari</span>
          <strong>{views.toLocaleString('ru-RU')}</strong>
          <em>Barcha majmualaringiz</em>
        </div>
      </section>

      <div className="grid-main">
        <section className="card">
          <div className="card-head">
            <h2>Yangi bronlar</h2>
            <Link href="/kabinet/bronlar?status=pending">Barchasi</Link>
          </div>
          {recent.length ? (
            <div className="table-wrap">
              <table className="tbl">
                <tbody>
                  {recent.map((b) => (
                    <OwnerBookingRow key={b.id} b={b} back="/kabinet" showComplex={list.length > 1} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="Yangi bron yo‘q">Mijoz bron qilganda shu yerda chiqadi.</Empty>
          )}
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Majmualarim</h2>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {list.map((c) => {
              const r = ratings.get(c.id)
              return (
                <li key={c.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <Link href={`/kabinet/majmua/${c.id}`} className="cell-main">
                    {c.name}
                  </Link>
                  <span className="cell-sub">
                    {svc.get(c.id) ?? 0} ta xizmat · {r?.rating ? `★ ${r.rating} (${r.reviewsCount})` : 'sharh yo‘q'} · {c.views} ko‘rish
                  </span>
                  <span style={{ display: 'inline-block', marginTop: 4 }}>
                    <StatusBadge status={c.status} />
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </>
  )
}
