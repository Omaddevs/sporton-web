import { asc } from 'drizzle-orm'
import { getDb } from '@/db'
import { REEL_TONES, reels, type Reel } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import CoverImageField from '@/components/admin/CoverImageField'
import { Empty, Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { deleteReel, saveReel, toggleReel } from './actions'

export const metadata = { title: 'Reels' }

const TONE_LABEL: Record<string, string> = {
  blue: 'Ko‘k',
  orange: 'To‘q sariq',
  purple: 'Binafsha',
  pink: 'Pushti',
  teal: 'Zangori',
  green: 'Yashil',
}

function ReelFields({ reel, nextOrder }: { reel?: Reel; nextOrder: number }) {
  return (
    <>
      {reel ? (
        <input type="hidden" name="original" value={reel.code} />
      ) : (
        <label className="fld span-2">
          <span>Instagram reel havolasi *</span>
          <input className="input" name="code" required placeholder="https://www.instagram.com/reel/DR_fqnciKP9/" />
          <small>Saytda shu reel Instagram orqali o‘ynatiladi (o‘z videongiz bo‘lsa — pastda «Video» maydoni).</small>
        </label>
      )}
      <label className="fld span-2">
        <span>Sarlavha *</span>
        <input className="input" name="title" defaultValue={reel?.title} maxLength={160} required />
      </label>
      <label className="fld">
        <span>Teg</span>
        <input className="input" name="tag" defaultValue={reel?.tag ?? 'SportON'} maxLength={40} placeholder="Musobaqa, Yakkakurash…" />
      </label>
      <label className="fld">
        <span>Teg rangi</span>
        <select className="select" name="tagTone" defaultValue={reel?.tagTone ?? 'blue'}>
          {REEL_TONES.map((t) => (
            <option key={t} value={t}>
              {TONE_LABEL[t]}
            </option>
          ))}
        </select>
      </label>
      <div className="fld span-2">
        <span>Muqova (vertikal, 9:16) *</span>
        <CoverImageField name="cover" initial={reel?.cover} aspect="9:16" />
      </div>
      <label className="fld span-2">
        <span>Video (ixtiyoriy)</span>
        <input className="input" name="video" defaultValue={reel?.video ?? ''} placeholder="https://…/video.mp4 yoki /videos/reels/kod.mp4" />
        <small>Bo‘lsa — saytda o‘zimizning pleyerda o‘ynaydi; bo‘lmasa Instagram oynasi ochiladi.</small>
      </label>
      <label className="fld">
        <span>Sana</span>
        <input className="input" type="date" name="publishedOn" defaultValue={reel?.publishedOn ?? ''} />
      </label>
      <label className="fld">
        <span>Tartib</span>
        <input className="input" type="number" name="sortOrder" defaultValue={reel?.sortOrder ?? nextOrder} />
      </label>
      <label className="check span-2">
        <input type="checkbox" name="active" defaultChecked={reel?.active ?? true} /> Saytda ko‘rsatish
      </label>
    </>
  )
}

export default async function ReelsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireStaff()
  const db = await getDb()
  const rows = await db.select().from(reels).orderBy(asc(reels.sortOrder), asc(reels.createdAt))
  const live = rows.filter((r) => r.active).length

  return (
    <>
      <PageHeader
        title="Reels"
        description={`Bosh sahifadagi «Reels» lentasi va «Reels» bo‘limi. Faol reel bo‘lmasa bo‘lim ko‘rinmaydi. Hozir saytda: ${live} ta.`}
      />
      <Flash params={await searchParams} />

      <section className="card card-pad" style={{ marginBottom: 20 }}>
        {rows.length === 0 ? (
          <Empty title="Reels yo‘q">Quyidagi forma orqali birinchi reelni qo‘shing.</Empty>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {rows.map((r) => (
              <div key={r.code} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <img
                    src={r.cover}
                    alt=""
                    style={{ width: 54, aspectRatio: '9 / 16', objectFit: 'cover', borderRadius: 8, background: 'var(--border)', opacity: r.active ? 1 : 0.45 }}
                  />
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div className="cell-main">{r.title}</div>
                    <span className="cell-sub">
                      {r.tag} · <a href={`https://www.instagram.com/reel/${r.code}/`} target="_blank" rel="noreferrer">{r.code}</a>
                      {r.video ? ' · o‘z videosi' : ' · Instagram embed'}
                    </span>
                  </div>
                  <StatusBadge status={r.active ? 'active' : 'hidden'} />
                  <form action={toggleReel}>
                    <input type="hidden" name="code" value={r.code} />
                    {!r.active && <input type="hidden" name="active" value="on" />}
                    <ConfirmButton className={`btn btn--sm ${r.active ? '' : 'btn--success'}`}>{r.active ? 'Yashirish' : 'Ko‘rsatish'}</ConfirmButton>
                  </form>
                  {user.role === 'admin' && (
                    <form action={deleteReel}>
                      <input type="hidden" name="code" value={r.code} />
                      <ConfirmButton className="btn btn--sm btn--danger" confirm="Reel butunlay o‘chirilsinmi?">
                        O‘chirish
                      </ConfirmButton>
                    </form>
                  )}
                </div>
                <details style={{ marginTop: 10 }}>
                  <summary style={{ cursor: 'pointer' }}>Tahrirlash</summary>
                  <form action={saveReel} className="form-grid" style={{ marginTop: 12 }}>
                    <ReelFields reel={r} nextOrder={rows.length} />
                    <div className="form-actions span-2">
                      <ConfirmButton className="btn btn--primary">Saqlash</ConfirmButton>
                    </div>
                  </form>
                </details>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card card-pad">
        <h2 className="section-title" style={{ marginBottom: 12 }}>Yangi reel</h2>
        <form action={saveReel} className="form-grid">
          <ReelFields nextOrder={rows.length} />
          <div className="form-actions span-2">
            <ConfirmButton className="btn btn--primary">Qo‘shish</ConfirmButton>
          </div>
        </form>
      </section>
    </>
  )
}
