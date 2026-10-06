import { asc } from 'drizzle-orm'
import { getDb } from '@/db'
import { partners } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import CoverImageField from '@/components/admin/CoverImageField'
import { Empty, Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { deletePartner, savePartner } from './actions'

export const metadata = { title: 'Hamkorlar' }

export default async function PartnersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireStaff()
  const db = await getDb()
  const rows = await db.select().from(partners).orderBy(asc(partners.sortOrder), asc(partners.createdAt))
  const isAdmin = user.role === 'admin'
  const visible = rows.filter((p) => p.active).length

  return (
    <>
      <PageHeader
        title="Hamkorlar"
        description={`Bosh sahifadagi «Hamkorlar» bo‘limi. Faol hamkor bo‘lmasa, bo‘lim saytda ko‘rinmaydi. Hozir saytda: ${visible} ta.`}
      />
      <Flash params={await searchParams} />
      <section className="card">
        {rows.length === 0 ? (
          <Empty title="Hamkorlar hali kiritilmagan">Quyidagi forma orqali birinchi hamkorni qo‘shing.</Empty>
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Logotip</th><th>Ma’lumotlar</th>{!isAdmin && <th>Holat</th>}</tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td style={{ width: 72 }}>
                      <img src={p.logo} alt={p.name} style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 12, background: '#fff', border: '1px solid var(--border)' }} />
                    </td>
                    {isAdmin ? (
                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                          <form action={savePartner} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
                            <input type="hidden" name="id" value={p.id} />
                            <input className="input" name="name" defaultValue={p.name} placeholder="Nomi" style={{ flex: 1, minWidth: 140, height: 34 }} aria-label="Nomi" />
                            <input className="input" name="logo" defaultValue={p.logo} placeholder="https://…/logo.png" style={{ flex: 2, minWidth: 200, height: 34 }} aria-label="Logotip havolasi" />
                            <input className="input" name="link" defaultValue={p.link ?? ''} placeholder="https://sayt.uz" style={{ flex: 1.5, minWidth: 160, height: 34 }} aria-label="Sayt havolasi" />
                            <input className="input" name="sortOrder" type="number" defaultValue={p.sortOrder} style={{ width: 70, height: 34 }} aria-label="Tartib" />
                            <label className="check"><input type="checkbox" name="active" defaultChecked={p.active} /> Faol</label>
                            <ConfirmButton>Saqlash</ConfirmButton>
                          </form>
                          <form action={deletePartner}>
                            <input type="hidden" name="id" value={p.id} />
                            <ConfirmButton className="btn btn--sm btn--danger" confirm={`«${p.name}» o‘chirilsinmi?`}>O‘chirish</ConfirmButton>
                          </form>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td>
                          <div className="cell-main">{p.name}</div>
                          {p.link && <a className="muted" href={p.link} target="_blank" rel="noreferrer">{p.link}</a>}
                        </td>
                        <td><StatusBadge status={p.active ? 'active' : 'hidden'} /></td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {isAdmin && (
        <section className="card card-pad" style={{ marginTop: 20 }}>
          <h2 className="section-title" style={{ marginBottom: 12 }}>Yangi hamkor</h2>
          <form action={savePartner} className="form-grid">
            <label className="fld"><span>Nomi</span><input className="input" name="name" required placeholder="Masalan: Bunyodkor SK" /></label>
            <label className="fld"><span>Sayt havolasi (ixtiyoriy)</span><input className="input" name="link" type="url" placeholder="https://sayt.uz" /></label>
            <label className="fld"><span>Tartib</span><input className="input" name="sortOrder" type="number" defaultValue={rows.length} /></label>
            <div className="fld span-2">
              <span>Logotip (yuklang yoki «Havola» orqali rasm linkini qo‘ying)</span>
              <CoverImageField name="logo" aspect="1:1" />
            </div>
            <input type="hidden" name="active" value="on" />
            <div className="form-actions span-2"><ConfirmButton className="btn btn--primary">Qo‘shish</ConfirmButton></div>
          </form>
        </section>
      )}
    </>
  )
}
