import Link from 'next/link'
import { count, desc } from 'drizzle-orm'
import { ExternalLink, Eye, EyeOff, MessageSquare, Pencil, Plus, Trash2 } from 'lucide-react'
import { getDb } from '@/db'
import { news, newsComments } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Badge, Empty, Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { formatDateTime, requireStaff } from '@/lib/admin'
import { deleteNews, setNewsStatus } from './actions'

export const metadata = { title: 'Yangiliklar' }

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff()
  const db = await getDb()
  const [rows, comments] = await Promise.all([
    db.select().from(news).orderBy(desc(news.publishedAt)),
    db.select({ id: newsComments.newsId, n: count() }).from(newsComments).groupBy(newsComments.newsId),
  ])
  const byNews = new Map(comments.map((c) => [c.id, c.n]))
  const siteUrl = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '')

  return (
    <>
      <PageHeader
        title="Yangiliklar"
        description="Sport yangiliklarini yozing, tahrirlang va e’lon qiling."
        actions={
          <Link className="btn btn--primary" href="/admin/news/new">
            <Plus /> Yangi maqola
          </Link>
        }
      />
      <Flash params={await searchParams} />
      <section className="card">
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl tbl--news">
              <thead>
                <tr>
                  <th style={{ width: 96 }}>Rasm</th>
                  <th>Sarlavha</th>
                  <th>E’lon vaqti</th>
                  <th className="num">Statistika</th>
                  <th>Holat</th>
                  <th className="num">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((n) => {
                  const edit = `/admin/news/${n.id}`
                  const published = n.status === 'published'
                  return (
                    <tr key={n.id}>
                      <td>
                        <Link href={edit} aria-label={`«${n.title}» ni tahrirlash`}>
                          {n.image ? (
                            <img src={n.image} alt="" className="tbl-thumb" loading="lazy" />
                          ) : (
                            <span className="tbl-thumb tbl-thumb--empty" />
                          )}
                        </Link>
                      </td>
                      <td>
                        <Link className="cell-main cell-link" href={edit}>
                          {n.title}
                        </Link>
                        <span className="cell-sub">
                          {n.category}
                          {n.featured && (
                            <>
                              {' '}· <Badge tone="primary">Bosh yangilik</Badge>
                            </>
                          )}
                          {n.gallery.length > 0 && ` · Galereya: ${n.gallery.length}`}
                        </span>
                      </td>
                      <td className="nowrap">{formatDateTime(n.publishedAt)}</td>
                      <td className="num nowrap">
                        <span className="stat" title="Ko‘rishlar">
                          <Eye size={14} /> {n.views}
                        </span>
                        <span className="stat" title="Izohlar">
                          <MessageSquare size={14} /> {byNews.get(n.id) ?? 0}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={n.status} />
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link href={edit} className="btn btn--sm btn--primary">
                            <Pencil /> Tahrirlash
                          </Link>
                          {siteUrl && published && (
                            <a
                              href={`${siteUrl}/yangilik/${n.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn--sm btn--icon"
                              title="Saytda ko‘rish"
                              aria-label="Saytda ko‘rish"
                            >
                              <ExternalLink />
                            </a>
                          )}
                          <form action={setNewsStatus}>
                            <input type="hidden" name="id" value={n.id} />
                            <input type="hidden" name="status" value={published ? 'draft' : 'published'} />
                            <ConfirmButton
                              className={`btn btn--sm btn--icon ${published ? '' : 'btn--success'}`}
                              confirm={published ? 'Yangilik saytdan olinib, qoralamaga o‘tkazilsinmi?' : undefined}
                            >
                              <span title={published ? 'Saytdan olish' : 'E’lon qilish'} aria-label={published ? 'Saytdan olish' : 'E’lon qilish'} style={{ display: 'inline-flex' }}>
                                {published ? <EyeOff /> : <Eye />}
                              </span>
                            </ConfirmButton>
                          </form>
                          <form action={deleteNews}>
                            <input type="hidden" name="id" value={n.id} />
                            <ConfirmButton className="btn btn--sm btn--icon btn--danger" confirm={`«${n.title}» va uning izohlari o‘chirilsinmi?`}>
                              <span title="O‘chirish" aria-label="O‘chirish" style={{ display: 'inline-flex' }}>
                                <Trash2 />
                              </span>
                            </ConfirmButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Yangilik yo‘q">
            <Link href="/admin/news/new" className="btn btn--primary" style={{ marginTop: 12 }}>
              <Plus /> Birinchi maqolani yozish
            </Link>
          </Empty>
        )}
      </section>
    </>
  )
}
