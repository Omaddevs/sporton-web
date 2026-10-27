import { asc } from 'drizzle-orm'
import { getDb } from '@/db'
import { ads, promoSlides } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import CoverImageField from '@/components/admin/CoverImageField'
import { Empty, Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { deletePromoSlide, saveAd, savePromoSlide, togglePromoSlide } from './actions'
import { AD_SLOTS } from './slots'

export const metadata = { title: 'Reklama' }

export default async function AdsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const user = await requireStaff()
  const db = await getDb()
  const rows = new Map((await db.select().from(ads)).map((a) => [a.slot, a]))
  const slides = await db.select().from(promoSlides).orderBy(asc(promoSlides.sortOrder), asc(promoSlides.createdAt))
  const isAdmin = user.role === 'admin'
  const liveSlides = slides.filter((s) => s.active).length

  return (
    <>
      <PageHeader
        title="Reklama"
        description="Rasm va tugma havolasi kiritilmaguncha (yoki «Faol» o‘chirilgan bo‘lsa) reklama saytda ko‘rinmaydi."
      />
      <Flash params={await searchParams} />
      <section className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h2 className="section-title">Promo karusel</h2>
          <StatusBadge status={liveSlides ? 'active' : 'hidden'} />
        </div>
        <p className="muted" style={{ marginBottom: 16 }}>
          Bosh sahifadagi aylanuvchi banner (kategoriyalardan keyin). Faol slayd bo‘lmasa karusel saytda ko‘rinmaydi.
          Hozir saytda: {liveSlides} ta.
        </p>
        <div style={{ marginBottom: 16, background: 'var(--primary-soft)', color: 'inherit', borderRadius: 12, padding: '12px 14px', lineHeight: 1.6 }}>
          <b>Rasm o‘lchami:</b>
          <br />• Kompyuter uchun: <b>1920 × 400 px</b> (nisbat 24:5) — majburiy
          <br />• Telefon uchun: <b>800 × 400 px</b> (nisbat 2:1) — ixtiyoriy, bo‘lmasa kompyuter rasmi o‘rtasidan kesib ko‘rsatiladi
          <br />Yuklangan rasm shu nisbatda kesiladi va bannerni to‘liq egallaydi. Format: JPG, PNG yoki WebP.
          Muhim matnni chetlardan kamida 40 px ichkarida, pastki o‘rtada esa nuqtalar uchun joy qoldiring.
        </div>

        {slides.length === 0 ? (
          <Empty title="Slaydlar yo‘q">Quyidagi forma orqali birinchi slaydni qo‘shing.</Empty>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {slides.map((s, i) => (
              <div key={s.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <img src={s.image} alt={s.alt ?? ''} style={{ width: 280, maxWidth: '100%', aspectRatio: '24 / 5', objectFit: 'cover', borderRadius: 8, background: 'var(--border)', opacity: s.active ? 1 : 0.45 }} />
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div className="cell-main">{s.alt || `Slayd ${i + 1}`}</div>
                    {s.link && <a className="muted" href={s.link} target="_blank" rel="noreferrer">{s.link}</a>}
                  </div>
                  <StatusBadge status={s.active ? 'active' : 'hidden'} />
                  {isAdmin && (
                    <>
                      <form action={togglePromoSlide}>
                        <input type="hidden" name="id" value={s.id} />
                        {!s.active && <input type="hidden" name="active" value="on" />}
                        <ConfirmButton className={`btn btn--sm ${s.active ? '' : 'btn--success'}`}>{s.active ? 'O‘chirish' : 'Yoqish'}</ConfirmButton>
                      </form>
                      <form action={deletePromoSlide}>
                        <input type="hidden" name="id" value={s.id} />
                        <ConfirmButton className="btn btn--sm btn--danger" confirm="Slayd butunlay o‘chirilsinmi?">Butunlay o‘chirish</ConfirmButton>
                      </form>
                    </>
                  )}
                </div>
                {isAdmin && (
                  <details style={{ marginTop: 10 }}>
                    <summary style={{ cursor: 'pointer' }}>Tahrirlash</summary>
                    <form action={savePromoSlide} className="form-grid" style={{ marginTop: 12 }}>
                      <input type="hidden" name="id" value={s.id} />
                      <div className="fld span-2">
                        <span>Kompyuter rasmi — 1920 × 400 px</span>
                        <CoverImageField name="image" initial={s.image} aspect="24:5" />
                      </div>
                      <div className="fld span-2">
                        <span>Telefon rasmi — 800 × 400 px (ixtiyoriy)</span>
                        <CoverImageField name="mobileImage" initial={s.mobileImage} aspect="2:1" />
                      </div>
                      <label className="fld">
                        <span>Havola (ixtiyoriy)</span>
                        <input className="input" name="link" defaultValue={s.link ?? ''} placeholder="https://… yoki /sahifa" />
                      </label>
                      <label className="fld">
                        <span>Tartib</span>
                        <input className="input" name="sortOrder" type="number" defaultValue={s.sortOrder} />
                      </label>
                      <label className="fld span-2">
                        <span>Rasm tavsifi (ixtiyoriy)</span>
                        <input className="input" name="alt" defaultValue={s.alt ?? ''} />
                      </label>
                      <label className="check span-2"><input type="checkbox" name="active" defaultChecked={s.active} /> Faol (saytda ko‘rsatish)</label>
                      <div className="form-actions span-2"><ConfirmButton className="btn btn--primary">Saqlash</ConfirmButton></div>
                    </form>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        {isAdmin && (
          <details style={{ marginTop: 16 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>+ Yangi slayd qo‘shish</summary>
            <form action={savePromoSlide} className="form-grid" style={{ marginTop: 12 }}>
              <div className="fld span-2">
                <span>Kompyuter rasmi — 1920 × 400 px</span>
                <CoverImageField name="image" aspect="24:5" />
              </div>
              <div className="fld span-2">
                <span>Telefon rasmi — 800 × 400 px (ixtiyoriy)</span>
                <CoverImageField name="mobileImage" aspect="2:1" />
              </div>
              <label className="fld">
                <span>Havola (ixtiyoriy)</span>
                <input className="input" name="link" placeholder="https://… yoki /sahifa" />
              </label>
              <label className="fld">
                <span>Tartib</span>
                <input className="input" name="sortOrder" type="number" defaultValue={slides.length} />
              </label>
              <label className="fld span-2">
                <span>Rasm tavsifi (ixtiyoriy)</span>
                <input className="input" name="alt" placeholder="Ekran o‘quvchilar uchun qisqa tavsif" />
              </label>
              <input type="hidden" name="active" value="on" />
              <div className="form-actions span-2"><ConfirmButton className="btn btn--primary">Qo‘shish</ConfirmButton></div>
            </form>
          </details>
        )}
      </section>
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
