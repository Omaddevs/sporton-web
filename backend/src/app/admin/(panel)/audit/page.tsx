import { count, desc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { auditLogs, users } from '@/db/schema'
import { Empty, PageHeader, Pagination } from '@/components/admin/ui'
import { formatDateTime, PAGE_SIZE, pageParam, requireStaff } from '@/lib/admin'

export const metadata = { title: 'Amallar jurnali' }

export default async function AuditPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff('admin')
  const params = await searchParams
  const page = pageParam(params.page)
  const db = await getDb()
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({ log: auditLogs, firstName: users.firstName, lastName: users.lastName })
      .from(auditLogs)
      .leftJoin(users, eq(users.id, auditLogs.actorId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(auditLogs),
  ])
  return (
    <>
      <PageHeader title="Amallar jurnali" description="Xodimlar admin panelda bajargan barcha amallar." />
      <section className="card">
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead><tr><th>Vaqt</th><th>Xodim</th><th>Amal</th><th>Obyekt</th><th>Qo‘shimcha</th></tr></thead>
              <tbody>
                {rows.map(({ log, firstName, lastName }) => (
                  <tr key={log.id}>
                    <td className="nowrap">{formatDateTime(log.createdAt)}</td>
                    <td>{firstName ? `${firstName} ${lastName}` : '—'}</td>
                    <td><code>{log.action}</code></td>
                    <td>{log.entity}{log.entityId ? <span className="cell-sub">{log.entityId}</span> : null}</td>
                    <td className="muted">{log.meta ? JSON.stringify(log.meta) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Jurnal bo‘sh" />
        )}
        <Pagination base="/admin/audit" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
