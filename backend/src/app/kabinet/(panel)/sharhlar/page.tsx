import { count, desc, eq, inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, reviews } from '@/db/schema'
import { Empty, PageHeader, Pagination, StatusBadge } from '@/components/admin/ui'
import { formatDateTime, PAGE_SIZE, pageParam } from '@/lib/admin'
import { requireOwner } from '@/lib/owner'

export const metadata = { title: 'Sharhlar' }

export default async function OwnerReviewsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const { complexIds, owned } = await requireOwner()
  const params = await searchParams
  const page = pageParam(params.page)
  const db = await getDb()
  const where = inArray(reviews.complexId, complexIds)
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ review: reviews, complexName: complexes.name })
      .from(reviews)
      .innerJoin(complexes, eq(complexes.id, reviews.complexId))
      .where(where)
      .orderBy(desc(reviews.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(reviews).where(where),
  ])

  return (
    <>
      <PageHeader
        title="Sharhlar"
        description="Mijozlar fikri. Noto‘g‘ri yoki haqoratli sharh bo‘lsa — SportON qo‘llab-quvvatlash xizmatiga yozing, moderator ko‘rib chiqadi."
      />
      <section className="card">
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Muallif</th>
                  <th>Baho</th>
                  <th>Sharh</th>
                  <th>Holat</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ review: r, complexName }) => (
                  <tr key={r.id}>
                    <td>
                      <span className="cell-main">{r.authorName}</span>
                      <span className="cell-sub">{formatDateTime(r.createdAt)}</span>
                      {owned.length > 1 && <span className="cell-sub">{complexName}</span>}
                    </td>
                    <td className="nowrap stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                    <td style={{ maxWidth: 520 }}>{r.text}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Hali sharh yo‘q">Mashg‘ulot yakunlangach mijozlarga sharh qoldirish taklif qilinadi.</Empty>
        )}
        <Pagination base="/kabinet/sharhlar" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
