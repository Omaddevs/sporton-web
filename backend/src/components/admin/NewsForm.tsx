import type { News } from '@/db/schema'
import ConfirmButton from './ConfirmButton'
import CoverImageField from './CoverImageField'
import MediaManager from './MediaManager'

const toLocalInput = (d: Date) => new Date(d.getTime() + 5 * 3_600_000).toISOString().slice(0, 16)

export default function NewsForm({
  item,
  action,
  submitLabel,
  announced = false,
}: {
  item?: News
  action: (f: FormData) => Promise<void>
  submitLabel: string
  announced?: boolean
}) {
  const n = item
  return (
    <form action={action} className="form">
      {n && <input type="hidden" name="id" value={n.id} />}
      <section className="card card-pad form">
        <div className="form-grid">
          <label className="fld span-2">
            <span>Sarlavha *</span>
            <input className="input" name="title" defaultValue={n?.title} required minLength={5} />
          </label>
          {!n && (
            <label className="fld">
              <span>ID (URL)</span>
              <input className="input" name="id" placeholder="sarlavhadan avtomatik" />
            </label>
          )}
          <label className="fld">
            <span>Kategoriya *</span>
            <input className="input" name="category" defaultValue={n?.category} placeholder="Futbol" required />
          </label>
          <label className="fld">
            <span>Holat</span>
            <select className="select" name="status" defaultValue={n?.status ?? 'published'}>
              <option value="published">E’lon qilingan</option>
              <option value="draft">Qoralama</option>
            </select>
          </label>
          <label className="fld">
            <span>E’lon vaqti (Toshkent)</span>
            <input className="input" type="datetime-local" name="publishedAt" defaultValue={toLocalInput(n?.publishedAt ?? new Date())} />
          </label>
          <label className="fld span-2">
            <span>Qisqa matn (kartochkada)</span>
            <textarea className="textarea" name="excerpt" defaultValue={n?.excerpt} rows={2} />
          </label>
          <div className="fld span-2">
            <span>Muqova rasmi</span>
            <CoverImageField name="image" initial={n?.image} aspect="16:9" />
            <small>Yuklangan rasmni kesish oynasida kerakli qismini tanlaysiz. Saytda 21:9 va kartochkalarda 16:9 ko‘rinadi.</small>
          </div>
          <label className="fld span-2">
            <span>Rasm izohi</span>
            <input className="input" name="imageCaption" defaultValue={n?.imageCaption ?? ''} maxLength={200} placeholder="Masalan: O‘yindan lavha. Foto: SportON" />
          </label>
          <label className="fld span-2">
            <span>Lid (kirish abzatsi)</span>
            <textarea className="textarea" name="lead" defaultValue={n?.body?.lead ?? ''} rows={3} />
          </label>
          <label className="fld span-2">
            <span>Maqola matni</span>
            <textarea className="textarea" name="paragraphs" defaultValue={(n?.body?.paragraphs ?? []).join('\n')} rows={10} />
            <small>Har bir qator — alohida abzats.</small>
          </label>
          <div className="fld span-2">
            <span>Maqola galereyasi</span>
            <MediaManager name="gallery" initial={n?.gallery ?? []} emptyText="Maqola ichida ko‘rsatiladigan qo‘shimcha rasm yoki videolar (ixtiyoriy)." />
          </div>
          <label className="fld">
            <span>Iqtibos</span>
            <textarea className="textarea" name="quoteText" defaultValue={n?.body?.quote?.text ?? ''} rows={2} />
          </label>
          <label className="fld">
            <span>Iqtibos muallifi</span>
            <input className="input" name="quoteAuthor" defaultValue={n?.body?.quote?.author ?? ''} />
          </label>
          <label className="fld">
            <span>Teglar</span>
            <input className="input" name="tags" defaultValue={(n?.tags ?? []).join(' ')} placeholder="#Futbol #TermaJamoa" />
          </label>
          <label className="fld">
            <span>Muallif</span>
            <input className="input" name="authorName" defaultValue={n?.authorName ?? 'SportON tahririyati'} />
          </label>
          <label className="check span-2">
            <input type="checkbox" name="featured" defaultChecked={n?.featured} /> Bosh yangilik (faqat bittasi bo‘ladi)
          </label>
          {!announced && (
            <label className="check span-2">
              <input type="checkbox" name="notify" defaultChecked={!n} /> Foydalanuvchilarga bildirishnoma yuborish
              <small className="muted"> — e’lon qilinganda (yangiliklarni o‘chirib qo‘yganlarga yuborilmaydi)</small>
            </label>
          )}
        </div>
      </section>
      <div className="form-actions">
        <ConfirmButton className="btn btn--primary">{submitLabel}</ConfirmButton>
      </div>
    </form>
  )
}
