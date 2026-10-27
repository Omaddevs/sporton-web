import type { SportEvent } from '@/db/schema'
import ConfirmButton from './ConfirmButton'
import CoverImageField from './CoverImageField'
import ListField from './ListField'

// Forma Toshkent vaqtida (UTC+5) ko‘rsatadi
const toLocalInput = (d: Date) => new Date(d.getTime() + 5 * 3_600_000).toISOString().slice(0, 16)

function defaultStart() {
  const d = new Date(Date.now() + 7 * 86_400_000)
  d.setUTCHours(4, 0, 0, 0) // 09:00 Toshkent
  return d
}

export default function EventForm({
  item,
  action,
  submitLabel,
  categories,
}: {
  item?: SportEvent
  action: (f: FormData) => Promise<void>
  submitLabel: string
  categories: string[]
}) {
  const e = item
  const start = e?.startsAt ?? defaultStart()
  const end = e?.endsAt ?? new Date(start.getTime() + 4 * 3_600_000)

  return (
    <form action={action} className="form">
      {e && <input type="hidden" name="id" value={e.id} />}

      <section className="card card-pad form">
        <h2 className="section-title">Asosiy ma’lumotlar</h2>
        <div className="form-grid">
          <label className="fld span-2">
            <span>Tadbir nomi *</span>
            <input className="input" name="title" defaultValue={e?.title} required minLength={5} maxLength={140} placeholder="Toshkent xalqaro marafoni — 2026" />
          </label>
          {!e && (
            <label className="fld">
              <span>ID (URL)</span>
              <input className="input" name="slug" placeholder="nomidan avtomatik" pattern="[a-z0-9-]*" />
              <small>Saytdagi manzil: /tadbir/<b>id</b></small>
            </label>
          )}
          <label className="fld">
            <span>Sport turi / kategoriya *</span>
            <input className="input" name="category" defaultValue={e?.category} list="event-categories" required placeholder="Futbol" />
            <datalist id="event-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </label>
          <label className="fld">
            <span>Holat</span>
            <select className="select" name="status" defaultValue={e?.status ?? 'published'}>
              <option value="published">E’lon qilingan</option>
              <option value="draft">Qoralama (saytda ko‘rinmaydi)</option>
            </select>
          </label>
          <label className="fld span-2">
            <span>Qisqa tavsif *</span>
            <textarea className="textarea" name="excerpt" defaultValue={e?.excerpt} rows={2} required maxLength={300} />
            <small>Sahifa sarlavhasi ostida va kartochkalarda chiqadi (300 belgigacha).</small>
          </label>
          <div className="fld span-2">
            <span>Muqova rasmi</span>
            <CoverImageField name="image" initial={e?.image} aspect="16:9" />
            <small>Tavsiya: 1600 × 900 px (16:9). Rasm bo‘lmasa, sport turiga mos standart rasm qo‘yiladi.</small>
          </div>
        </div>
      </section>

      <section className="card card-pad form">
        <h2 className="section-title">Sana va joy</h2>
        <div className="form-grid">
          <label className="fld">
            <span>Boshlanish (Toshkent vaqti) *</span>
            <input className="input" type="datetime-local" name="startsAt" defaultValue={toLocalInput(start)} required />
          </label>
          <label className="fld">
            <span>Tugash (Toshkent vaqti) *</span>
            <input className="input" type="datetime-local" name="endsAt" defaultValue={toLocalInput(end)} required />
          </label>
          <label className="fld">
            <span>Qisqa manzil *</span>
            <input className="input" name="location" defaultValue={e?.location} required placeholder="Goal Arena, Toshkent" />
            <small>Kartochkada ko‘rinadi.</small>
          </label>
          <label className="fld">
            <span>O‘tkaziladigan joy nomi</span>
            <input className="input" name="venueName" defaultValue={e?.venueName ?? ''} placeholder="Goal Arena" />
          </label>
          <label className="fld span-2">
            <span>To‘liq manzil</span>
            <input className="input" name="venueAddress" defaultValue={e?.venueAddress ?? ''} placeholder="Toshkent sh., Chilonzor tumani, Bunyodkor ko‘chasi 12" />
            <small>Xaritada «Yo‘nalish» tugmasi shu manzil bo‘yicha ochiladi.</small>
          </label>
        </div>
      </section>

      <section className="card card-pad form">
        <h2 className="section-title">Ishtirok shartlari</h2>
        <div className="form-grid">
          <label className="fld">
            <span>Ishtirok to‘lovi *</span>
            <input className="input" name="fee" defaultValue={e?.fee ?? 'Bepul'} required placeholder="120 000 so‘m" />
          </label>
          <label className="fld">
            <span>Sovrin jamg‘armasi</span>
            <input className="input" name="prize" defaultValue={e?.prize ?? ''} placeholder="30 000 000 so‘m" />
          </label>
          <label className="fld">
            <span>Daraja</span>
            <input className="input" name="level" defaultValue={e?.level ?? 'Barcha darajalar'} placeholder="Havaskor" />
          </label>
          <label className="fld">
            <span>Yosh chegarasi</span>
            <input className="input" name="age" defaultValue={e?.age ?? 'Cheklovsiz'} placeholder="16+" />
          </label>
          <label className="fld">
            <span>Joylar soni *</span>
            <input className="input" type="number" name="capacity" min={1} defaultValue={e?.capacity || 100} required />
          </label>
          <label className="fld">
            <span>Oflayn ro‘yxatdan o‘tganlar</span>
            <input className="input" type="number" name="registered" min={0} defaultValue={e?.registered ?? 0} />
            <small>Saytdan tashqari (telefon, joyida) yozilganlar. Saytdan ro‘yxatdan o‘tganlar avtomatik qo‘shiladi.</small>
          </label>
          <label className="fld">
            <span>Tashkilotchi</span>
            <input className="input" name="organizerName" defaultValue={e?.organizerName ?? 'SportON'} />
          </label>
          <label className="fld">
            <span>Tashkilotchi roli</span>
            <input className="input" name="organizerRole" defaultValue={e?.organizerRole ?? 'Tashkilotchi'} placeholder="Rasmiy tashkilotchi" />
          </label>
        </div>
      </section>

      <section className="card card-pad form">
        <h2 className="section-title">Tadbir sahifasi</h2>
        <div className="form-grid">
          <div className="fld span-2">
            <span>Tadbir haqida</span>
            <ListField
              name="about"
              initial={e?.about ?? []}
              columns={[{ key: 'text', label: 'Abzats', multiline: true }]}
              addLabel="Abzats qo‘shish"
              emptyText="Birinchi abzats kattaroq (lid) bo‘lib ko‘rsatiladi."
            />
          </div>
          <div className="fld span-2">
            <span>Ishtirokchilar uchun (nimalar kiradi)</span>
            <ListField name="includes" initial={e?.includes ?? []} columns={[{ key: 'text', label: 'Masalan: Finishchi medali' }]} />
          </div>
          <div className="fld span-2">
            <span>Dastur</span>
            <ListField
              name="schedule"
              initial={e?.schedule ?? []}
              columns={[
                { key: 'time', label: 'Vaqt', placeholder: '07:00 yoki 1-noyabr', width: 150 },
                { key: 'label', label: 'Nima bo‘ladi' },
                { key: 'note', label: 'Izoh (ixtiyoriy)' },
              ]}
              addLabel="Dastur bandi"
            />
          </div>
          <div className="fld span-2">
            <span>Shartlar va talablar</span>
            <ListField name="rules" initial={e?.rules ?? []} columns={[{ key: 'text', label: 'Masalan: Tibbiy ma’lumotnoma talab qilinadi' }]} addLabel="Shart qo‘shish" />
          </div>
          <div className="fld span-2">
            <span>Ko‘p beriladigan savollar</span>
            <ListField
              name="faq"
              initial={e?.faq ?? []}
              columns={[
                { key: 'q', label: 'Savol' },
                { key: 'a', label: 'Javob', multiline: true },
              ]}
              addLabel="Savol qo‘shish"
            />
          </div>
        </div>
      </section>

      <div className="form-actions">
        <ConfirmButton className="btn btn--primary">{submitLabel}</ConfirmButton>
      </div>
    </form>
  )
}
