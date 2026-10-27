import { count, desc, eq, lt } from 'drizzle-orm'
import { getDb } from '@/db'
import { errorEvents } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Badge, Empty, Flash, PageHeader, Pagination, Tabs } from '@/components/admin/ui'
import { formatDateTime, PAGE_SIZE, pageParam, requireStaff, str } from '@/lib/admin'
import { clearOldErrors } from './actions'

export const metadata = { title: 'Xatolar' }
export const dynamic = 'force-dynamic'

export default async function ErrorsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff('admin')
  const params = await searchParams
  const source = str(params.source)
  const page = pageParam(params.page)
  const db = await getDb()
  const where = source === 'api' || source === 'client' ? eq(errorEvents.source, source) : undefined
  const [rows, [{ total }], [{ old }]] = await Promise.all([
    db.select().from(errorEvents).where(where).orderBy(desc(errorEvents.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(errorEvents).where(where),
    db.select({ old: count() }).from(errorEvents).where(lt(errorEvents.createdAt, new Date(Date.now() - 30 * 86_400_000))),
  ])

  return (
    <>
      <PageHeader
        title="Xatolar"
        description="Server (500) va brauzerdagi JavaScript xatolari. Yangi turdagi xato haqida adminlar Telegram chatiga ham xabar boradi."
        actions={
          old > 0 ? (
            <form action={clearOldErrors}>
              <ConfirmButton className="btn" confirm={`30 kundan eski ${old} ta yozuv o‘chirilsinmi?`}>
                Eskilarini tozalash ({old})
              </ConfirmButton>
            </form>
          ) : null
        }
      />
      <Flash params={params} />
      <section className="card">
        <div className="toolbar">
          <Tabs
            base="/admin/errors"
            params={params}
            name="source"
            current={source}
            items={[
              { id: '', label: 'Barchasi' },
              { id: 'api', label: 'Server' },
              { id: 'client', label: 'Brauzer' },
            ]}
          />
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Vaqt</th>
                  <th>Manba</th>
                  <th>Xato</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td className="nowrap">{formatDateTime(e.createdAt)}</td>
                    <td>
                      <Badge tone={e.source === 'api' ? 'danger' : 'warning'}>{e.source === 'api' ? 'Server' : 'Brauzer'}</Badge>
                    </td>
                    <td style={{ maxWidth: 720 }}>
                      <span className="cell-main" style={{ wordBreak: 'break-word' }}>{e.message}</span>
                      {e.url && <span className="cell-sub" style={{ wordBreak: 'break-all' }}>{e.url}</span>}
                      {e.stack && (
                        <details>
                          <summary className="muted" style={{ cursor: 'pointer', fontSize: 12 }}>Stack</summary>
                          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11.5, margin: '6px 0 0' }}>{e.stack}</pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Xato yo‘q">Hammasi joyida 👍</Empty>
        )}
        <Pagination base="/admin/errors" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
