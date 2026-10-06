import Link from 'next/link'
import { and, count, desc, eq, inArray, isNotNull } from 'drizzle-orm'
import { Plus, Send } from 'lucide-react'
import { getDb } from '@/db'
import { broadcasts, notifications } from '@/db/schema'
import { Badge, Empty, Flash, PageHeader, Pagination, type Tone } from '@/components/admin/ui'
import { formatDateTime, PAGE_SIZE, pageParam, requireStaff } from '@/lib/admin'
import { AUDIENCE_LABEL, BROADCAST_STATUS, TYPE_LABEL } from './labels'

export const metadata = { title: 'Bildirishnomalar' }
export const dynamic = 'force-dynamic'

export default async function BroadcastsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff()
  const params = await searchParams
  const page = pageParam(params.page)
  const db = await getDb()
  const [rows, [{ total }], [{ sentTotal }]] = await Promise.all([
    db.select().from(broadcasts).orderBy(desc(broadcasts.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(broadcasts),
    db.select({ sentTotal: count() }).from(notifications),
  ])
  const ids = rows.map((r) => r.id)
  const reads = ids.length
    ? await db
        .select({ id: notifications.broadcastId, n: count() })
        .from(notifications)
        .where(and(inArray(notifications.broadcastId, ids), isNotNull(notifications.readAt)))
        .groupBy(notifications.broadcastId)
    : []
  const readBy = new Map(reads.map((r) => [r.id, r.n]))
  const [{ scheduled }] = await db.select({ scheduled: count() }).from(broadcasts).where(eq(broadcasts.status, 'scheduled'))

  return (
    <>
      <PageHeader
        title="Bildirishnomalar"
        description={
          <>
            Foydalanuvchilarga xabar yuboring: saytda, Telegram va brauzer push orqali. Jami yetkazilgan: {sentTotal}
            {scheduled > 0 && ` · rejalashtirilgan: ${scheduled}`}
          </>
        }
        actions={
          <Link href="/admin/notifications/new" className="btn btn--primary">
            <Plus /> Yangi xabar
          </Link>
        }
      />
      <Flash params={params} />
      <section className="card">
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Xabar</th>
                  <th>Kimga</th>
                  <th>Kanallar</th>
                  <th className="num">Yetkazildi</th>
                  <th className="num">O‘qildi</th>
                  <th>Vaqt</th>
                  <th>Holat</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => {
                  const read = readBy.get(b.id) ?? 0
                  const pct = b.recipients ? Math.round((read / b.recipients) * 100) : 0
                  const st = BROADCAST_STATUS[b.status]
                  return (
                    <tr key={b.id}>
                      <td>
                        <Link href={`/admin/notifications/${b.id}`} className="cell-main cell-link">
                          {b.title}
                        </Link>
                        <span className="cell-sub cell-clip">{TYPE_LABEL[b.type]} · {b.body}</span>
                      </td>
                      <td>
                        {AUDIENCE_LABEL[b.audience.kind]}
                        {b.audience.kind === 'users' && <span className="cell-sub">{b.audience.userIds.length} kishi</span>}
                      </td>
                      <td className="nowrap">
                        Sayt{b.channels.telegram && ' · Telegram'}{b.channels.push && ' · Push'}
                      </td>
                      <td className="num">{b.recipients}</td>
                      <td className="num nowrap">
                        {b.status === 'sent' ? (
                          <>
                            {read} <span className="muted">({pct}%)</span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="nowrap">{formatDateTime(b.sentAt ?? b.scheduledAt ?? b.createdAt)}</td>
                      <td>
                        <Badge tone={st.tone as Tone}>{st.label}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Hali xabar yuborilmagan">
            <Link href="/admin/notifications/new" className="btn btn--primary" style={{ marginTop: 12 }}>
              <Send /> Birinchi xabarni yuborish
            </Link>
          </Empty>
        )}
        <Pagination base="/admin/notifications" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
