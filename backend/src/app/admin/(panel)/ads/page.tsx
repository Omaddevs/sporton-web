import { getDb } from '@/db'
import { ads } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import CoverImageField from '@/components/admin/CoverImageField'
import { Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { saveAd } from './actions'
import { AD_SLOTS } from './slots'

export const metadata = { title: 'Reklama' }

export default async function AdsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireStaff()
  const db = await getDb()
  const rows = new Map((await db.select().from(ads)).map((a) => [a.slot, a]))
  const isAdmin = user.role === 'admin'

  return (
    <>
      <PageHeader
        title="Reklama"
        description="Rasm va tugma havolasi kiritilmaguncha (yoki «Faol» o‘chirilgan bo‘lsa) reklama saytda ko‘rinmaydi."
      />
      <Flash params={await searchParams} />
      {AD_SLOTS.map((slot) => {
        const ad = rows.get(slot.id)
        const live = Boolean(ad?.active && ad.image && ad.link)
        return (
          <section key={slot.id} className="card card-pad" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 className="section-title">{slot.title}</h2>
              <StatusBadge status={live ? 'active' : 'hidden'} />
            </div>
            <p className="muted" style={{ marginBottom: 16 }}>{slot.description}</p>

            <div style={{ marginBottom: 16, background: 'var(--primary-soft)', color: 'inherit', borderRadius: 12, padding: '12px 14px', lineHeight: 1.6 }}>
              <b>Rasm o‘lchami:</b>
              <br />• Kompyuter uchun: <b>{slot.desktop.width} × {slot.desktop.height} px</b> (nisbat {slot.desktop.aspect}) — majburiy
              <br />• Telefon uchun: <b>{slot.mobile.width} × {slot.mobile.height} px</b> (nisbat {slot.mobile.aspect}) — ixtiyoriy, bo‘lmasa kompyuter rasmi ishlatiladi
              <br />Format: JPG, PNG yoki WebP. Muhim matn va logotipni chetlardan kamida 40 px ichkarida joylashtiring; o‘ng yuqori burchakda yopish (×) tugmasi turadi.
            </div>

            {isAdmin ? (
              <form action={saveAd} className="form-grid">
                <input type="hidden" name="slot" value={slot.id} />
                <div className="fld span-2">
                  <span>Kompyuter rasmi — {slot.desktop.width} × {slot.desktop.height} px</span>
                  <CoverImageField name="image" initial={ad?.image} aspect={slot.desktop.aspect} />
                </div>
                <div className="fld span-2">
                  <span>Telefon rasmi — {slot.mobile.width} × {slot.mobile.height} px (ixtiyoriy)</span>
                  <CoverImageField name="mobileImage" initial={ad?.mobileImage} aspect={slot.mobile.aspect} />
                </div>
                <label className="fld">
                  <span>Tugma havolasi</span>
                  <input className="input" name="link" defaultValue={ad?.link ?? ''} placeholder="https://… yoki /majmua-qoshish" />
                  <small>Tashqi sayt yoki sayt ichidagi sahifa</small>
                </label>
                <label className="fld">
                  <span>Tugma matni (ixtiyoriy)</span>
                  <input className="input" name="ctaLabel" defaultValue={ad?.ctaLabel ?? ''} placeholder="Batafsil" />
                  <small>Bo‘sh qoldirilsa tugma chiqmaydi, butun banner bosiladi</small>
                </label>
                <label className="fld span-2">
                  <span>Rasm tavsifi (ixtiyoriy)</span>
                  <input className="input" name="alt" defaultValue={ad?.alt ?? ''} placeholder="Ekran o‘quvchilar uchun qisqa tavsif" />
                </label>
                <label className="check span-2"><input type="checkbox" name="active" defaultChecked={ad?.active ?? true} /> Faol (saytda ko‘rsatish)</label>
                <div className="form-actions span-2"><ConfirmButton className="btn btn--primary">Saqlash</ConfirmButton></div>
              </form>
            ) : (
              ad?.image && <img src={ad.image} alt={ad.alt ?? ''} style={{ width: '100%', borderRadius: 12 }} />
            )}
          </section>
        )
      })}
    </>
  )
}
