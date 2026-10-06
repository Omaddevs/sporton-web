import { asc, count } from 'drizzle-orm'
import { getDb } from '@/db'
import { services, sports } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { saveSport } from './actions'

export const metadata = { title: 'Sport turlari' }

export default async function SportsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireStaff()
  const db = await getDb()
  const [rows, usage] = await Promise.all([
    db.select().from(sports).orderBy(asc(sports.sortOrder)),
    db.select({ id: services.sportId, n: count() }).from(services).groupBy(services.sportId),
  ])
  const used = new Map(usage.map((u) => [u.id, u.n]))
  const isAdmin = user.role === 'admin'

  return (
    <>
      <PageHeader title="Sport turlari" description="Xizmat qo‘shishda tanlanadigan sport turlari ro‘yxati." />
      <Flash params={await searchParams} />
      <section className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr><th>ID</th><th>Nomi</th><th>Rang</th><th>Tartib</th><th className="num">Xizmatlar</th><th>Holat</th>{isAdmin && <th />}</tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  {isAdmin ? (
                    <>
                      <td><code>{s.id}</code></td>
                      <td colSpan={6}>
                        <form action={saveSport} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <input type="hidden" name="originalId" value={s.id} />
                          <input className="input" name="title" defaultValue={s.title} style={{ flex: 2, minWidth: 160, height: 34 }} aria-label="Nomi" />
                          <input className="input" name="accent" defaultValue={s.accent ?? ''} placeholder="#hex" style={{ width: 100, height: 34 }} aria-label="Rang" />
                          <input className="input" name="sortOrder" type="number" defaultValue={s.sortOrder} style={{ width: 80, height: 34 }} aria-label="Tartib" />
                          <input type="hidden" name="image" value={s.image ?? ''} />
                          <span className="muted" style={{ width: 70, textAlign: 'right' }}>{used.get(s.id) ?? 0} ta</span>
                          <label className="check"><input type="checkbox" name="active" defaultChecked={s.active} /> Faol</label>
                          <ConfirmButton>Saqlash</ConfirmButton>
                        </form>
                      </td>
                    </>
                  ) : (
                    <>
                      <td><code>{s.id}</code></td>
                      <td className="cell-main">{s.title}</td>
                      <td>{s.accent && <span className="swatch" style={{ background: s.accent }} />}{s.accent}</td>
                      <td>{s.sortOrder}</td>
                      <td className="num">{used.get(s.id) ?? 0}</td>
                      <td><StatusBadge status={s.active ? 'active' : 'hidden'} /></td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {isAdmin && (
        <section className="card card-pad" style={{ marginTop: 20 }}>
          <h2 className="section-title" style={{ marginBottom: 12 }}>Yangi sport turi</h2>
          <form action={saveSport} className="form-grid">
            <label className="fld"><span>Nomi</span><input className="input" name="title" required /></label>
            <label className="fld"><span>ID</span><input className="input" name="id" placeholder="nomidan avtomatik" /></label>
            <label className="fld"><span>Rang</span><input className="input" name="accent" placeholder="#1e6ff5" /></label>
            <label className="fld"><span>Tartib</span><input className="input" name="sortOrder" type="number" defaultValue={rows.length} /></label>
            <input type="hidden" name="active" value="on" />
            <div className="form-actions span-2"><ConfirmButton className="btn btn--primary">Qo‘shish</ConfirmButton></div>
          </form>
        </section>
      )}
    </>
  )
}
