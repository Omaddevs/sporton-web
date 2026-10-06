import Link from 'next/link'
import { and, count, desc, eq, gte, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings, complexes, reviews, services, submissions, subscribers, users } from '@/db/schema'
import { Empty, Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { formatDateTime, requireStaff } from '@/lib/admin'
import { formatPhone } from '@/lib/phone'

export const metadata = { title: 'Boshqaruv paneli' }

const DAYS = 14

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireStaff()
  const params = await searchParams
  const db = await getDb()
  const weekAgo = new Date(Date.now() - 7 * 86_400_000)
  const since = new Date(Date.now() - (DAYS - 1) * 86_400_000)
  since.setHours(0, 0, 0, 0)

  const [
    [usersTotal],
    [usersNew],
    [complexTotal],
    [demoTotal],
    [bookingsPending],
    [bookingsWeek],
    [subsPending],
    [reviewsTotal],
    [subscribersTotal],
    perDay,
    recentBookings,
    recentSubmissions,
  ] = await Promise.all([
    db.select({ n: count() }).from(users),
    db.select({ n: count() }).from(users).where(gte(users.createdAt, weekAgo)),
    db.select({ n: count() }).from(complexes).where(eq(complexes.status, 'published')),
    db.select({ n: count() }).from(complexes).where(and(eq(complexes.isDemo, true), eq(complexes.status, 'published'))),
    db.select({ n: count() }).from(bookings).where(eq(bookings.status, 'pending')),
    db.select({ n: count() }).from(bookings).where(gte(bookings.createdAt, weekAgo)),
    db.select({ n: count() }).from(submissions).where(eq(submissions.status, 'pending')),
    db.select({ n: count() }).from(reviews),
    db.select({ n: count() }).from(subscribers).where(eq(subscribers.status, 'active')),
    db
      .select({
        day: sql<string>`to_char(${bookings.createdAt} at time zone 'Asia/Tashkent', 'YYYY-MM-DD')`,
        n: count(),
      })
      .from(bookings)
      .where(gte(bookings.createdAt, since))
      .groupBy(sql`1`),
    db
      .select({
        id: bookings.id,
        code: bookings.code,
        status: bookings.status,
        date: bookings.date,
        hour: bookings.hour,
        customerName: bookings.customerName,
        customerPhone: bookings.customerPhone,
        createdAt: bookings.createdAt,
        serviceTitle: services.title,
        complexName: complexes.name,
      })
      .from(bookings)
      .innerJoin(services, eq(services.id, bookings.serviceId))
      .innerJoin(complexes, eq(complexes.id, bookings.complexId))
      .orderBy(desc(bookings.createdAt))
      .limit(8),
    db.select().from(submissions).where(eq(submissions.status, 'pending')).orderBy(desc(submissions.createdAt)).limit(5),
  ])

  const byDay = new Map(perDay.map((r) => [r.day, r.n]))
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(since.getTime() + i * 86_400_000 + 5 * 3_600_000)
    const key = d.toISOString().slice(0, 10)
    return { key, label: `${key.slice(8, 10)}.${key.slice(5, 7)}`, n: byDay.get(key) ?? 0 }
  })
  const max = Math.max(1, ...days.map((d) => d.n))
  const totalPeriod = days.reduce((s, d) => s + d.n, 0)

  return (
    <>
      <PageHeader
        title={`Salom, ${user.firstName}!`}
        description="Platformadagi asosiy ko‘rsatkichlar va bajarilishi kerak bo‘lgan ishlar."
      />
      <Flash params={params} />

      {demoTotal.n > 0 && (
        <div className="alert alert--warning">
          Saytda {demoTotal.n} ta namuna (demo) majmua ko‘rinmoqda. Launchdan oldin ularni{' '}
          <Link href="/admin/complexes?demo=1" style={{ textDecoration: 'underline' }}>
            yashirishni
          </Link>{' '}
          unutmang.
        </div>
      )}

      <section className="kpis">
        <Link href="/admin/bookings?status=pending" className={`card kpi ${bookingsPending.n ? 'kpi--alert' : ''}`}>
          <span>Kutilayotgan bronlar</span>
          <strong>{bookingsPending.n}</strong>
          <em>7 kunda: {bookingsWeek.n} ta bron</em>
        </Link>
        <Link href="/admin/submissions" className={`card kpi ${subsPending.n ? 'kpi--alert' : ''}`}>
          <span>Yangi arizalar</span>
          <strong>{subsPending.n}</strong>
          <em>Moderatsiya kutmoqda</em>
        </Link>
        <Link href="/admin/users" className="card kpi">
          <span>Foydalanuvchilar</span>
          <strong>{usersTotal.n}</strong>
          <em>+{usersNew.n} so‘nggi 7 kunda</em>
        </Link>
        <Link href="/admin/complexes" className="card kpi">
          <span>Faol majmualar</span>
          <strong>{complexTotal.n}</strong>
          <em>{demoTotal.n ? `shundan ${demoTotal.n} demo` : 'barchasi haqiqiy'}</em>
        </Link>
        <Link href="/admin/reviews" className="card kpi">
          <span>Sharhlar</span>
          <strong>{reviewsTotal.n}</strong>
          <em>Jami qoldirilgan</em>
        </Link>
        <Link href="/admin/subscribers" className="card kpi">
          <span>Obunachilar</span>
          <strong>{subscribersTotal.n}</strong>
          <em>Email ro‘yxati</em>
        </Link>
      </section>

      <div className="grid-main">
        <div className="stack">
          <section className="card">
            <div className="card-head">
              <h2>Bronlar — so‘nggi {DAYS} kun</h2>
              <span className="muted">{totalPeriod} ta</span>
            </div>
            <div className="bars" role="img" aria-label={`So‘nggi ${DAYS} kunda ${totalPeriod} ta bron`}>
              {days.map((d) => (
                <div className="bars__col" key={d.key} title={`${d.label}: ${d.n} ta`}>
                  <div className={`bars__bar ${d.n ? '' : 'is-zero'}`} style={{ height: `${(d.n / max) * 100}%` }} />
                  <small>{d.label}</small>
                </div>
              ))}
            </div>
            <div className="bars__legend">Kun bo‘yicha yaratilgan bronlar soni (Toshkent vaqti)</div>
          </section>

          <section className="card">
            <div className="card-head">
              <h2>So‘nggi bronlar</h2>
              <Link href="/admin/bookings">Barchasi →</Link>
            </div>
            {recentBookings.length ? (
              <div className="table-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Mijoz</th>
                      <th>Xizmat</th>
                      <th>Vaqt</th>
                      <th>Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <span className="cell-main">{b.customerName}</span>
                          <span className="cell-sub">{formatPhone(b.customerPhone)}</span>
                        </td>
                        <td>
                          <span className="cell-main">{b.serviceTitle}</span>
                          <span className="cell-sub">{b.complexName}</span>
                        </td>
                        <td className="nowrap">
                          {b.date ? `${b.date} · ${String(b.hour).padStart(2, '0')}:00` : 'Kelishiladi'}
                          <span className="cell-sub">{b.code}</span>
                        </td>
                        <td><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty title="Hali bron yo‘q">Foydalanuvchilar bron qilganda shu yerda ko‘rinadi.</Empty>
            )}
          </section>
        </div>

        <section className="card">
          <div className="card-head">
            <h2>Moderatsiya navbati</h2>
            <Link href="/admin/submissions">Barchasi →</Link>
          </div>
          {recentSubmissions.length ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {recentSubmissions.map((s) => (
                <li key={s.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
                  <Link href={`/admin/submissions/${s.id}`} className="cell-main">{s.name}</Link>
                  <span className="cell-sub">{s.payload.address} · {formatDateTime(s.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="Navbat bo‘sh">Yangi majmua arizalari yo‘q.</Empty>
          )}
        </section>
      </div>
    </>
  )
}
