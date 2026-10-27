import type { Complex } from '@/db/schema'
import { AMENITIES, LISTING_STATUS_LABELS, REGIONS } from '@/lib/constants'
import ConfirmButton from './ConfirmButton'
import CoverImageField from './CoverImageField'
import MediaManager from './MediaManager'

export default function ComplexForm({
  complex,
  action,
  submitLabel,
  variant = 'admin',
}: {
  complex?: Complex
  action: (form: FormData) => Promise<void>
  submitLabel: string
  /** owner — majmua egasi kabineti: holat, tasdiq belgilari va tartib maydonlari ko‘rinmaydi */
  variant?: 'admin' | 'owner'
}) {
  const c = complex
  const admin = variant === 'admin'
  return (
    <form action={action} className="form">
      {c && <input type="hidden" name="originalId" value={c.id} />}

      <section className="card card-pad form">
        <h2 className="section-title">Asosiy</h2>
        <div className="form-grid">
          <label className="fld">
            <span>Nomi *</span>
            <input className="input" name="name" defaultValue={c?.name} required minLength={2} maxLength={120} />
          </label>
          {admin && !c && (
            <label className="fld">
              <span>ID (URL)</span>
              <input className="input" name="id" placeholder="avtomatik: nomidan" pattern="[a-z0-9-]*" />
              <small>Saytda: /sport-majmua/&lt;id&gt;. Keyin o‘zgartirilmaydi.</small>
            </label>
          )}
          {admin && (
          <label className="fld">
            <span>Holat</span>
            <select className="select" name="status" defaultValue={c?.status ?? 'draft'}>
              {Object.entries(LISTING_STATUS_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            <small>Qoralamani to‘ldirib bo‘lgach «E’lon qilingan» ni tanlang — shundan keyin saytda chiqadi.</small>
          </label>
          )}
          <label className="fld">
            <span>Faoliyat turi</span>
            <input className="input" name="industry" defaultValue={c?.industry ?? ''} placeholder="Sport majmuasi, Dzyudo klubi…" />
          </label>
          <label className="fld span-2">
            <span>Qisqa shior (tagline)</span>
            <input className="input" name="tagline" defaultValue={c?.tagline ?? ''} maxLength={160} />
          </label>
          <label className="fld span-2">
            <span>Batafsil ma’lumot</span>
            <textarea className="textarea" name="about" defaultValue={c?.about ?? ''} rows={5} />
          </label>
          {admin && (
            <div className="checks span-2">
              <label className="check"><input type="checkbox" name="verified" defaultChecked={c?.verified} /> Tasdiqlangan</label>
              <label className="check"><input type="checkbox" name="listed" defaultChecked={c?.listed ?? true} /> Ro‘yxat boshida</label>
              <label className="check"><input type="checkbox" name="isDemo" defaultChecked={c?.isDemo} /> Namuna (demo)</label>
            </div>
          )}
        </div>
      </section>

      <section className="card card-pad form">
        <h2 className="section-title">Manzil va aloqa</h2>
        <div className="form-grid">
          <label className="fld">
            <span>Hudud</span>
            <select className="select" name="region" defaultValue={c?.region ?? 'toshkent-shahar'}>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>{r.label}</option>
              ))}
            </select>
          </label>
          <label className="fld">
            <span>Shahar</span>
            <input className="input" name="city" defaultValue={c?.city ?? ''} placeholder="hududdan avtomatik" />
          </label>
          <label className="fld span-2">
            <span>To‘liq manzil (saytda ko‘rinadi)</span>
            <input className="input" name="location" defaultValue={c?.location ?? ''} placeholder="Toshkent, Yunusobod tumani, …" />
          </label>
          <label className="fld">
            <span>Mo‘ljal</span>
            <input className="input" name="landmark" defaultValue={c?.landmark ?? ''} />
          </label>
          <label className="fld">
            <span>Ish vaqti</span>
            <input className="input" name="hours" defaultValue={c?.hours ?? ''} placeholder="07:00 - 23:00" />
          </label>
          <label className="fld">
            <span>Kenglik (lat)</span>
            <input className="input" name="lat" inputMode="decimal" defaultValue={c?.lat ?? ''} placeholder="41.2995" />
          </label>
          <label className="fld">
            <span>Uzunlik (lng)</span>
            <input className="input" name="lng" inputMode="decimal" defaultValue={c?.lng ?? ''} placeholder="69.2401" />
            <small>Google Maps’da nuqtani bosib, koordinatani nusxalang.</small>
          </label>
          <label className="fld">
            <span>Telefon</span>
            <input className="input" name="phone" defaultValue={c?.phone ?? ''} placeholder="+998 90 123 45 67" />
          </label>
          <label className="fld">
            <span>Telegram</span>
            <input className="input" name="telegram" defaultValue={c?.telegram ?? ''} placeholder="@username" />
          </label>
          <label className="fld">
            <span>Veb-sayt</span>
            <input className="input" name="website" type="url" defaultValue={c?.website ?? ''} placeholder="https://" />
          </label>
          <label className="fld">
            <span>Narx izohi</span>
            <input className="input" name="priceNote" defaultValue={c?.priceNote ?? ''} placeholder="Narxi kelishiladi" />
          </label>
        </div>
      </section>

      <section className="card card-pad form">
        <h2 className="section-title">Ko‘rinish</h2>
        <div className="form-grid">
          <label className="fld">
            <span>Brend rangi</span>
            <input className="input" name="color" type="color" defaultValue={c?.color ?? '#1e6ff5'} style={{ padding: 4 }} />
          </label>
          <label className="fld">
            <span>Banner shiori</span>
            <input className="input" name="bannerSlogan" defaultValue={c?.bannerSlogan ?? ''} />
          </label>
          <div className="fld">
            <span>Logotip (kvadrat)</span>
            <CoverImageField name="logo" initial={c?.logo} aspect="1:1" />
            <small>Bo‘lmasa brend rangi va nomning bosh harfi ko‘rsatiladi.</small>
          </div>
          <div className="fld">
            <span>Muqova rasmi (16:9)</span>
            <CoverImageField name="bannerImage" initial={c?.bannerImage} aspect="16:9" />
            <small>Galereyada birinchi chiqadi.</small>
          </div>
          <div className="fld span-2">
            <span>Rasm va videolar</span>
            <MediaManager
              initial={
                c?.media?.length
                  ? c.media
                  : (c?.images ?? []).map((url) => ({ type: 'image' as const, url, provider: url.startsWith('/api/v1/files/') ? ('file' as const) : ('link' as const) }))
              }
            />
          </div>
          <label className="fld">
            <span>Tajriba (yil)</span>
            <input className="input" name="years" defaultValue={c?.years ?? ''} placeholder="5+" />
          </label>
          <label className="fld">
            <span>Murabbiylar soni</span>
            <input className="input" name="employees" defaultValue={c?.employees ?? ''} placeholder="10+" />
          </label>
          {admin && (
            <label className="fld span-2">
              <span>O‘xshash majmualar (ID, vergul bilan)</span>
              <input className="input" name="similarIds" defaultValue={(c?.similarIds ?? []).join(', ')} />
            </label>
          )}
          <fieldset className="fld span-2" style={{ border: 0, padding: 0, margin: 0 }}>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Qulayliklar</span>
            <div className="checks">
              {AMENITIES.map((a) => (
                <label key={a.id} className="check">
                  <input type="checkbox" name="amenities" value={a.id} defaultChecked={c?.amenities.includes(a.id)} /> {a.label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <div className="form-actions">
        <ConfirmButton className="btn btn--primary">{submitLabel}</ConfirmButton>
      </div>
    </form>
  )
}
