import Link from 'next/link'
import { count, desc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { submissions, users } from '@/db/schema'
import { Empty, Flash, PageHeader, Pagination, StatusBadge, Tabs } from '@/components/admin/ui'
import { formatDateTime, PAGE_SIZE, pageParam, requireStaff, str } from '@/lib/admin'
import { formatPhone } from '@/lib/phone'

export const metadata = { title: 'Arizalar' }

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff()
  const params = await searchParams
  const status = str(params.status) || 'pending'
  const page = pageParam(params.page)
  const db = await getDb()
  const where = status === 'all' ? undefined : eq(submissions.status, status as 'pending')

  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ s: submissions, firstName: users.firstName, lastName: users.lastName })
      .from(submissions)
      .leftJoin(users, eq(users.id, submissions.userId))
      .where(where)
      .orderBy(desc(submissions.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(submissions).where(where),
  ])

  return (
    <>
      <PageHeader title="Majmua arizalari" description="Foydalanuvchilar yuborgan yangi majmualarni tekshiring va tasdiqlang." />
      <Flash params={params} />
      <section className="card">
        <div className="toolbar">
          <Tabs
            base="/admin/submissions"
            params={params}
            name="status"
            current={status}
            items={[
              { id: 'pending', label: 'Kutilmoqda' },
              { id: 'approved', label: 'Tasdiqlangan' },
              { id: 'rejected', label: 'Rad etilgan' },
              { id: 'all', label: 'Barchasi' },
            ]}
          />
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Majmua</th>
                  <th>Yuboruvchi</th>
                  <th>Sport turlari</th>
                  <th>Sana</th>
                  <th>Holat</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map(({ s, firstName, lastName }) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/admin/submissions/${s.id}`} className="cell-main">{s.name}</Link>
                      <span className="cell-sub">{s.payload.address}</span>
                    </td>
                    <td>
                      <span className="cell-main">{firstName ? `${firstName} ${lastName}` : '—'}</span>
                      <span className="cell-sub">{formatPhone(s.payload.phone)}</span>
                    </td>
                    <td><div className="chips">{s.payload.sports.map((sp) => <span key={sp} className="chip">{sp}</span>)}</div></td>
                    <td className="nowrap">{formatDateTime(s.createdAt)}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className="num"><Link className="btn btn--sm" href={`/admin/submissions/${s.id}`}>Ko‘rish</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Ariza yo‘q" />
        )}
        <Pagination base="/admin/submissions" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
