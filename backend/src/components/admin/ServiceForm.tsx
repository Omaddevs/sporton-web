import type { Service } from '@/db/schema'
import { SERVICE_TYPE_LABELS } from '@/lib/constants'
import ConfirmButton from './ConfirmButton'

export default function ServiceForm({
  service,
  complexId,
  sports,
  action,
  submitLabel,
}: {
  service?: Service
  complexId: string
  sports: Array<{ id: string; title: string }>
  action: (form: FormData) => Promise<void>
  submitLabel: string
}) {
  const s = service
  return (
    <form action={action} className="form">
      {s && <input type="hidden" name="id" value={s.id} />}
      <input type="hidden" name="complexId" value={complexId} />
      <section className="card card-pad form">
        <div className="form-grid">
          <label className="fld span-2">
            <span>Xizmat nomi *</span>
            <input className="input" name="title" defaultValue={s?.title} required minLength={3} />
          </label>
          <label className="fld">
            <span>Sport turi *</span>
            <select className="select" name="sportId" defaultValue={s?.sportId ?? ''} required>
              <option value="" disabled>Tanlang</option>
              {sports.map((sp) => (
                <option key={sp.id} value={sp.id}>{sp.title}</option>
              ))}
            </select>
          </label>
          <label className="fld">
            <span>Turi *</span>
            <select className="select" name="type" defaultValue={s?.type ?? 'full'}>
              {Object.entries(SERVICE_TYPE_LABELS).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </label>
          <label className="fld">
            <span>Narx *</span>
            <input className="input" name="price" defaultValue={s?.price} placeholder="250 000 so‘m / soat" required />
            <small>Raqam + «so‘m» bo‘lsa saralash va filtrlarda ishlatiladi.</small>
          </label>
          <label className="fld">
            <span>Ish vaqti</span>
            <input className="input" name="hours" defaultValue={s?.hours ?? ''} placeholder="07:00 - 23:00" />
            <small>«07:00 - 23:00» formatida bo‘lsa, saytda soat bo‘yicha bron ochiladi.</small>
          </label>
          <label className="fld">
            <span>Shahar</span>
            <input className="input" name="location" defaultValue={s?.location ?? 'Toshkent'} />
          </label>
          <label className="fld">
            <span>Kategoriya nomi</span>
            <input className="input" name="category" defaultValue={s?.category ?? ''} placeholder="sport turidan avtomatik" />
          </label>
          <label className="fld">
            <span>Lat</span>
            <input className="input" name="lat" inputMode="decimal" defaultValue={s?.lat ?? ''} />
          </label>
          <label className="fld">
            <span>Lng</span>
            <input className="input" name="lng" inputMode="decimal" defaultValue={s?.lng ?? ''} />
          </label>
          <label className="fld">
            <span>Format</span>
            <input className="input" name="workMode" defaultValue={s?.workMode ?? ''} placeholder="Guruh, Yakka…" />
          </label>
          <label className="fld">
            <span>Daraja</span>
            <input className="input" name="experience" defaultValue={s?.experience ?? ''} placeholder="Barcha darajalar" />
          </label>
          <label className="fld">
            <span>Asosiy qulaylik</span>
            <input className="input" name="level" defaultValue={s?.level ?? ''} />
          </label>
          <label className="fld">
            <span>Holat</span>
            <select className="select" name="status" defaultValue={s?.status ?? 'published'}>
              <option value="published">E’lon qilingan</option>
              <option value="hidden">Yashirin</option>
            </select>
          </label>
          <label className="fld span-2">
            <span>Tavsif</span>
            <textarea className="textarea" name="description" defaultValue={s?.description ?? ''} rows={4} />
          </label>
          <label className="fld span-2">
            <span>Narxga kiradi (har qatorda bittadan)</span>
            <textarea className="textarea" name="tasks" defaultValue={(s?.tasks ?? []).join('\n')} rows={4} />
          </label>
          <label className="fld span-2">
            <span>Qoidalar</span>
            <textarea className="textarea" name="requirements" defaultValue={(s?.requirements ?? []).join('\n')} rows={4} />
          </label>
          <label className="fld span-2">
            <span>Afzalliklar / aksiyalar</span>
            <textarea className="textarea" name="offers" defaultValue={(s?.offers ?? []).join('\n')} rows={4} />
          </label>
        </div>
      </section>
      <div className="form-actions">
        <ConfirmButton className="btn btn--primary">{submitLabel}</ConfirmButton>
      </div>
    </form>
  )
}
