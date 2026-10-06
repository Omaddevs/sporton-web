import { count, desc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, news, newsComments, reviews } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Empty, Flash, PageHeader, Pagination, StatusBadge, Stars, Tabs, withQuery } from '@/components/admin/ui'
import { formatDateTime, PAGE_SIZE, pageParam, requireStaff, str } from '@/lib/admin'
import { moderate } from './actions'

export const metadata = { title: 'Sharh va izohlar' }

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff()
  const params = await searchParams
  const tab = str(params.tab) === 'comments' ? 'comments' : 'reviews'
  const page = pageParam(params.page)
  const db = await getDb()
  const back = withQuery('/admin/reviews', params, {})

  const [[rc], [cc]] = await Promise.all([
    db.select({ n: count() }).from(reviews),
    db.select({ n: count() }).from(newsComments),
  ])

  const items =
    tab === 'reviews'
      ? (
          await db
            .select({ r: reviews, target: complexes.name })
            .from(reviews)
            .innerJoin(complexes, eq(complexes.id, reviews.complexId))
            .orderBy(desc(reviews.createdAt))
            .limit(PAGE_SIZE)
            .offset((page - 1) * PAGE_SIZE)
        ).map(({ r, target }) => ({ ...r, target, kind: 'review' as const }))
      : (
          await db
            .select({ c: newsComments, target: news.title })
            .from(newsComments)
            .innerJoin(news, eq(news.id, newsComments.newsId))
            .orderBy(desc(newsComments.createdAt))
            .limit(PAGE_SIZE)
            .offset((page - 1) * PAGE_SIZE)
        ).map(({ c, target }) => ({ ...c, target, rating: null as number | null, kind: 'comment' as const }))

  return (
    <>
      <PageHeader title="Sharh va izohlar" description="Nomaqbul kontentni yashiring yoki o‘chiring. Yangi sharhlar darhol e’lon qilinadi." />
      <Flash params={params} />
      <section className="card">
        <div className="toolbar">
          <Tabs
            base="/admin/reviews"
            params={params}
            name="tab"
            current={tab === 'reviews' ? '' : 'comments'}
            items={[
              { id: '', label: 'Majmua sharhlari', count: rc.n },
              { id: 'comments', label: 'Yangilik izohlari', count: cc.n },
            ]}
          />
        </div>
        {items.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Muallif</th>
                  <th>Matn</th>
                  <th>{tab === 'reviews' ? 'Majmua' : 'Yangilik'}</th>
                  <th>Holat</th>
                  <th className="num">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="nowrap">
                      <span className="cell-main">{item.authorName}</span>
                      <span className="cell-sub">{formatDateTime(item.createdAt)}</span>
                    </td>
                    <td>
                      {item.rating != null && <Stars value={item.rating} />}
                      <span className="cell-clip">{item.text}</span>
                    </td>
                    <td><span className="cell-clip">{item.target}</span></td>
                    <td><StatusBadge status={item.status} /></td>
                    <td>
                      <form action={moderate} className="row-actions">
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="kind" value={item.kind} />
                        <input type="hidden" name="back" value={back} />
                        {item.status === 'published' ? (
                          <ConfirmButton name="op" value="hide">Yashirish</ConfirmButton>
                        ) : (
                          <ConfirmButton className="btn btn--sm btn--success" name="op" value="publish">Ko‘rsatish</ConfirmButton>
                        )}
                        <ConfirmButton className="btn btn--sm btn--danger" name="op" value="delete" confirm="Butunlay o‘chirilsinmi?">O‘chirish</ConfirmButton>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Hozircha bo‘sh" />
        )}
        <Pagination base="/admin/reviews" params={params} page={page} pageSize={PAGE_SIZE} total={tab === 'reviews' ? rc.n : cc.n} />
      </section>
    </>
  )
}
