import { notFound } from 'next/navigation'
import { and, count, desc, eq, isNotNull, sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { broadcasts, notifications, users } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Badge, Flash, PageHeader, type Tone } from '@/components/admin/ui'
import { formatDateTime, requireStaff } from '@/lib/admin'
import { formatPhone } from '@/lib/phone'
import { cancelBroadcast, deleteBroadcast, sendNow } from '../actions'
import { AUDIENCE_LABEL, BROADCAST_STATUS, TYPE_LABEL } from '../labels'
import AutoRefresh from './AutoRefresh'

export const dynamic = 'force-dynamic'

const RECIPIENTS_LIMIT = 200

export default async function BroadcastDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  await requireStaff()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const db = await getDb()
  const [b] = await db.select().from(broadcasts).where(eq(broadcasts.id, id)).limit(1)
  if (!b) notFound()
  const [[{ read }], [author], recipients] = await Promise.all([
    db.select({ read: count() }).from(notifications).where(and(eq(notifications.broadcastId, id), isNotNull(notifications.readAt))),
    b.createdBy ? db.select({ firstName: users.firstName }).from(users).where(eq(users.id, b.createdBy)).limit(1) : Promise.resolve([]),
    // Kimga yetdi va kim o‘qidi: avval o‘qimaganlar, keyin o‘qiganlar (yangi o‘qilgan tepada)
    db
      .select({
        id: notifications.id,
        readAt: notifications.readAt,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        telegram: users.telegramChatId,
      })
      .from(notifications)
      .innerJoin(users, eq(users.id, notifications.userId))
      .where(eq(notifications.broadcastId, id))
      .orderBy(sql`${notifications.readAt} is not null`, desc(notifications.readAt))
      .limit(RECIPIENTS_LIMIT),
  ])
  const st = BROADCAST_STATUS[b.status]
  const pct = b.recipients ? Math.round((read / b.recipients) * 100) : 0

  return (
    <>
      {(b.status === 'sending' || (b.status === 'scheduled' && b.scheduledAt && b.scheduledAt.getTime() < Date.now() + 60_000)) && (
        <AutoRefresh seconds={3} />
      )}
      <PageHeader
        title={b.title}
        description={
          <>
            <Badge tone={st.tone as Tone}>{st.label}</Badge> · {TYPE_LABEL[b.type]} · yaratdi: {author?.firstName ?? '—'},{' '}
            {formatDateTime(b.createdAt)}
          </>
        }
        crumbs={[{ href: '/admin/notifications', label: 'Bildirishnomalar' }]}
        actions={
          <>
            {['draft', 'scheduled', 'failed'].includes(b.status) && (
              <form action={sendNow}>
                <input type="hidden" name="id" value={b.id} />
                <ConfirmButton className="btn btn--primary" confirm="Hozir yuborilsinmi?">
                  Hozir yuborish
                </ConfirmButton>
              </form>
            )}
            {b.status === 'scheduled' && (
              <form action={cancelBroadcast}>
                <input type="hidden" name="id" value={b.id} />
                <ConfirmButton className="btn" confirm="Rejalashtirilgan jo‘natma bekor qilinsinmi?">
                  Bekor qilish
                </ConfirmButton>
              </form>
            )}
            {['draft', 'cancelled', 'failed'].includes(b.status) && (
              <form action={deleteBroadcast}>
                <input type="hidden" name="id" value={b.id} />
                <ConfirmButton className="btn btn--danger" confirm="O‘chirilsinmi?">
                  O‘chirish
                </ConfirmButton>
              </form>
            )}
          </>
        }
      />
      <Flash params={await searchParams} />
      {b.error && <div className="alert alert--danger">Xatolik: {b.error}</div>}

      <div className="grid-main">
        <div className="stack">
          <section className="card card-pad">
            <div className="stat-cards">
              <div className="stat-card">
                <span>Yetkazildi (saytda)</span>
                <b>{b.recipients}</b>
              </div>
              <div className="stat-card">
                <span>O‘qildi</span>
                <b>
                  {read} <small className="muted">{pct}%</small>
                </b>
                <div className="progress">
                  <span style={{ width: `${pct}%` }} />
                </div>
              </div>
              <div className="stat-card">
                <span>Telegram</span>
                <b>{b.channels.telegram ? b.telegramSent : '—'}</b>
              </div>
              <div className="stat-card">
                <span>Brauzer push</span>
                <b>{b.channels.push ? b.pushSent : '—'}</b>
              </div>
            </div>
          </section>
          {recipients.length > 0 && (
            <section className="card">
              <div className="card-head">
                <h2>Qabul qiluvchilar</h2>
                <span className="muted">
                  {b.recipients > RECIPIENTS_LIMIT ? `${RECIPIENTS_LIMIT} / ${b.recipients}` : b.recipients} kishi
                </span>
              </div>
              <div className="table-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Foydalanuvchi</th>
                      <th>Telegram</th>
                      <th>Holat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <span className="cell-main">{`${r.firstName} ${r.lastName}`.trim()}</span>
                          <span className="cell-sub">{r.phone ? formatPhone(r.phone) : '—'}</span>
                        </td>
                        <td>{r.telegram ? <Badge tone="info">Ulangan</Badge> : <span className="muted">—</span>}</td>
                        <td>
                          {r.readAt ? (
                            <Badge tone="success">O‘qidi · {formatDateTime(r.readAt)}</Badge>
                          ) : (
                            <Badge>O‘qilmagan</Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <section className="card card-pad">
            <dl className="dl">
              <dt>Kimga</dt>
              <dd>
                {AUDIENCE_LABEL[b.audience.kind]}
                {b.audience.kind === 'users' && ` (${b.audience.userIds.length} kishi)`}
              </dd>
              <dt>Kanallar</dt>
              <dd>Sayt{b.channels.telegram && ', Telegram'}{b.channels.push && ', brauzer push'}</dd>
              <dt>{b.sentAt ? 'Yuborilgan' : 'Rejalashtirilgan'}</dt>
              <dd>{formatDateTime(b.sentAt ?? b.scheduledAt)}</dd>
              <dt>Havola</dt>
              <dd>{b.link ?? '—'}</dd>
            </dl>
          </section>
        </div>
        <section className="card card-pad">
          <h2 className="section-title" style={{ marginBottom: 12 }}>Xabar</h2>
          <div className="notif-preview">
            <div>
              <b>{b.title}</b>
              <p>{b.body}</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
