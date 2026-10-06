import Link from 'next/link'
import { and, asc, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm'
import { Plus } from 'lucide-react'
import { getDb } from '@/db'
import { complexes, services } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Badge, Empty, Flash, PageHeader, Pagination, StatusBadge, Tabs, withQuery } from '@/components/admin/ui'
import { PAGE_SIZE, pageParam, requireStaff, str } from '@/lib/admin'
import { ratingsByComplex } from '@/lib/catalog'
import { hideDemoComplexes, setComplexStatus } from './actions'

export const metadata = { title: 'Majmualar' }

export default async function ComplexesPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireStaff()
  const params = await searchParams
  const q = str(params.q)
  const status = str(params.status)
  const demo = str(params.demo)
  const page = pageParam(params.page)
  const db = await getDb()

  const filters: SQL[] = []
  if (status === 'published' || status === 'hidden') filters.push(eq(complexes.status, status))
  if (demo === '1') filters.push(eq(complexes.isDemo, true))
  if (demo === '0') filters.push(eq(complexes.isDemo, false))
  if (q) filters.push(or(ilike(complexes.name, `%${q}%`), ilike(complexes.id, `%${q}%`), ilike(complexes.location, `%${q}%`))!)
  const where = filters.length ? and(...filters) : undefined

  const [rows, [{ total }], serviceCounts, [{ demoPublished }]] = await Promise.all([
    db
      .select()
      .from(complexes)
      .where(where)
      .orderBy(desc(complexes.listed), asc(complexes.isDemo), asc(complexes.sortOrder), desc(complexes.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(complexes).where(where),
    db.select({ id: services.complexId, n: count() }).from(services).groupBy(services.complexId),
    db
      .select({ demoPublished: count() })
      .from(complexes)
      .where(and(eq(complexes.isDemo, true), eq(complexes.status, 'published'))),
  ])
  const ratings = await ratingsByComplex(rows.map((r) => r.id))
  const counts = new Map(serviceCounts.map((s) => [s.id, s.n]))
  const back = withQuery('/admin/complexes', params, {})

  return (
    <>
      <PageHeader
        title="Sport majmualari"
        description="Saytdagi barcha majmualar, ularning xizmatlari va ko‘rinishi."
        actions={
          <>
            {user.role === 'admin' && demoPublished > 0 && (
              <form action={hideDemoComplexes}>
                <ConfirmButton className="btn" confirm={`${demoPublished} ta demo majmua saytdan yashirilsinmi?`}>
                  Demo’larni yashirish ({demoPublished})
                </ConfirmButton>
              </form>
            )}
            <Link href="/admin/complexes/new" className="btn btn--primary">
              <Plus /> Yangi majmua
            </Link>
          </>
        }
      />
      <Flash params={params} />
      <section className="card">
        <div className="toolbar">
          <Tabs
            base="/admin/complexes"
            params={params}
            name="status"
            current={status}
            items={[
              { id: '', label: 'Barchasi' },
              { id: 'published', label: 'E’lon qilingan' },
              { id: 'hidden', label: 'Yashirin' },
            ]}
          />
          <Tabs
            base="/admin/complexes"
            params={params}
            name="demo"
            current={demo}
            items={[
              { id: '', label: 'Hammasi' },
              { id: '0', label: 'Haqiqiy' },
              { id: '1', label: 'Demo' },
            ]}
          />
          <form style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {status && <input type="hidden" name="status" value={status} />}
            {demo && <input type="hidden" name="demo" value={demo} />}
            <input className="input" name="q" defaultValue={q} placeholder="Nomi, ID yoki manzil…" />
            <button className="btn">Qidirish</button>
          </form>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Majmua</th>
                  <th>Manzil</th>
                  <th className="num">Xizmatlar</th>
                  <th className="num">Reyting</th>
                  <th className="num">Ko‘rishlar</th>
                  <th>Holat</th>
                  <th className="num">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const r = ratings.get(c.id)
                  return (
                    <tr key={c.id}>
                      <td>
                        <span className="cell-main">
                          <span className="swatch" style={{ background: c.color }} />
                          <Link href={`/admin/complexes/${c.id}`}>{c.name}</Link>
                        </span>
                        <span className="cell-sub">
                          {c.id} {c.verified && <Badge tone="primary">Tasdiqlangan</Badge>} {c.isDemo && <Badge>Demo</Badge>}
                        </span>
                      </td>
                      <td><span className="cell-clip">{c.location ?? c.city ?? '—'}</span></td>
                      <td className="num">{counts.get(c.id) ?? 0}</td>
                      <td className="num">{r?.rating ? `${r.rating} (${r.reviewsCount})` : '—'}</td>
                      <td className="num">{c.views.toLocaleString('ru-RU')}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        <form action={setComplexStatus} className="row-actions">
                          <input type="hidden" name="id" value={c.id} />
                          <input type="hidden" name="back" value={back} />
                          <Link href={`/admin/complexes/${c.id}`} className="btn btn--sm">Tahrirlash</Link>
                          {c.status === 'published' ? (
                            <ConfirmButton name="status" value="hidden">Yashirish</ConfirmButton>
                          ) : (
                            <ConfirmButton className="btn btn--sm btn--success" name="status" value="published">E’lon qilish</ConfirmButton>
                          )}
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Majmua topilmadi" />
        )}
        <Pagination base="/admin/complexes" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
