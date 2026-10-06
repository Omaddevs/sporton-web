import { count, desc } from 'drizzle-orm'
import { Download } from 'lucide-react'
import { getDb } from '@/db'
import { subscribers } from '@/db/schema'
import { Empty, PageHeader, Pagination, StatusBadge } from '@/components/admin/ui'
import { formatDateTime, PAGE_SIZE, pageParam, requireStaff } from '@/lib/admin'

export const metadata = { title: 'Obunachilar' }

export default async function SubscribersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff()
  const params = await searchParams
  const page = pageParam(params.page)
  const db = await getDb()
  const [rows, [{ total }]] = await Promise.all([
    db.select().from(subscribers).orderBy(desc(subscribers.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(subscribers),
  ])
  return (
    <>
      <PageHeader
        title="Email obunachilar"
        description="Sayt pastidagi forma orqali obuna bo‘lganlar."
        actions={<a className="btn" href="/admin/subscribers/export"><Download /> CSV yuklab olish</a>}
      />
      <section className="card">
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Email</th><th>Sana</th><th>Holat</th></tr></thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td className="cell-main">{s.email}</td>
                    <td>{formatDateTime(s.createdAt)}</td>
                    <td><StatusBadge status={s.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Obunachi yo‘q" />
        )}
        <Pagination base="/admin/subscribers" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
