import Link from 'next/link'
import { notFound } from 'next/navigation'
import { asc, eq } from 'drizzle-orm'
import { ExternalLink, Eye, Plus } from 'lucide-react'
import { getDb } from '@/db'
import { complexes, services, users } from '@/db/schema'
import ComplexForm from '@/components/admin/ComplexForm'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Badge, Empty, Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { BOOKING_MODE_SHORT, SERVICE_TYPE_LABELS } from '@/lib/constants'
import { formatPhone } from '@/lib/phone'
import { previewToken } from '@/lib/preview'
import { deleteComplex, setComplexOwner, setComplexStatus, updateComplex } from '../actions'

export default async function EditComplexPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const user = await requireStaff()
  const { id } = await params
  const db = await getDb()
  const [complex] = await db.select().from(complexes).where(eq(complexes.id, decodeURIComponent(id))).limit(1)
  if (!complex) notFound()
  const list = await db.select().from(services).where(eq(services.complexId, complex.id)).orderBy(asc(services.id))
  const [owner] = complex.ownerId ? await db.select().from(users).where(eq(users.id, complex.ownerId)).limit(1) : []
  const siteUrl = process.env.PUBLIC_SITE_URL
  const live = complex.status === 'published'
  const liveServices = list.filter((s) => s.status === 'published').length
  const back = `/admin/complexes/${encodeURIComponent(complex.id)}?ok=${encodeURIComponent('Holat o‘zgartirildi')}`

  return (
    <>
      <PageHeader
        title={complex.name}
        description={<>ID: <code>{complex.id}</code> · <StatusBadge status={complex.status} /></>}
        crumbs={[{ href: '/admin/complexes', label: 'Majmualar' }]}
        actions={
          <>
            {siteUrl && live && (
              <a className="btn" href={`${siteUrl}/sport-majmua/${complex.id}`} target="_blank" rel="noreferrer">
                <ExternalLink /> Saytda ko‘rish
              </a>
            )}
            {siteUrl && !live && (
              <a className="btn" href={`${siteUrl}/sport-majmua/${complex.id}?preview=${previewToken(complex.id)}`} target="_blank" rel="noreferrer">
                <Eye /> Oldindan ko‘rish
              </a>
            )}
            <form action={setComplexStatus}>
              <input type="hidden" name="id" value={complex.id} />
              <input type="hidden" name="back" value={back} />
              {live ? (
                <ConfirmButton className="btn" name="status" value="hidden" confirm="Majmua saytdan olib qo‘yilsinmi?">Yashirish</ConfirmButton>
              ) : (
                <ConfirmButton className="btn btn--success" name="status" value="published">E’lon qilish</ConfirmButton>
              )}
            </form>
          </>
        }
      />
      <Flash params={await searchParams} />
      {!live && (
        <div className="card card-pad" style={{ marginBottom: 16, background: 'var(--primary-soft)' }}>
          {complex.status === 'draft' ? 'Qoralama' : 'Yashirin'} — majmua saytda ko‘rinmaydi va bron qabul qilinmaydi.
          Ma’lumotlarni to‘ldirib, «E’lon qilish» ni bosing.
        </div>
      )}
      {live && liveServices === 0 && (
        <div className="card card-pad" style={{ marginBottom: 16, background: 'var(--danger-soft)' }}>
          Majmua e’lon qilingan, lekin e’lon qilingan xizmati yo‘q — saytda xizmatlar va bron ko‘rinmaydi.
        </div>
      )}

      <div className="grid-main">
        <ComplexForm complex={complex} action={updateComplex} submitLabel="Saqlash" />

        <div className="stack">
          <section className="card">
            <div className="card-head">
              <h2>Xizmatlar ({list.length})</h2>
              <Link href={`/admin/services/new?complex=${complex.id}`}>
                <Plus size={14} style={{ verticalAlign: -2 }} /> Qo‘shish
              </Link>
            </div>
            {list.length ? (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {list.map((s) => (
                  <li key={s.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                    <Link href={`/admin/services/${s.id}`} className="cell-main">{s.title}</Link>
                    <span className="cell-sub">
                      {s.category} · {SERVICE_TYPE_LABELS[s.type]} · {s.price}
                    </span>
                    <span style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      <Badge tone={s.bookingMode === 'call' ? 'neutral' : 'primary'}>{BOOKING_MODE_SHORT[s.bookingMode]}</Badge>
                      {s.status !== 'published' && <StatusBadge status={s.status} />}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="Xizmat yo‘q">Bron qilish uchun kamida bitta xizmat qo‘shing.</Empty>
            )}
          </section>

          <section className="card card-pad">
            <h2 className="section-title" style={{ marginBottom: 10 }}>Majmua egasi</h2>
            {owner ? (
              <>
                <p style={{ margin: '0 0 10px' }}>
                  <b>{`${owner.firstName} ${owner.lastName}`.trim()}</b>
                  <br />
                  <span className="muted">{owner.phone ? formatPhone(owner.phone) : '—'} · kabinetga telefon va parol bilan kiradi</span>
                </p>
                {user.role === 'admin' && (
                  <form action={setComplexOwner}>
                    <input type="hidden" name="id" value={complex.id} />
                    <ConfirmButton className="btn btn--sm btn--danger" name="op" value="remove" confirm="Egasining kabinetga kirish huquqi olib tashlansinmi?">
                      Egasini olib tashlash
                    </ConfirmButton>
                  </form>
                )}
              </>
            ) : (
              <p className="muted" style={{ marginTop: 0 }}>Biriktirilmagan. Ariza tasdiqlanganda ariza muallifi avtomatik egasi bo‘ladi.</p>
            )}
            {user.role === 'admin' && (
              <form action={setComplexOwner} className="form" style={{ marginTop: 12 }}>
                <input type="hidden" name="id" value={complex.id} />
                <label className="fld">
                  <span>{owner ? 'Boshqa foydalanuvchiga o‘tkazish' : 'Egasini biriktirish'} (telefon)</span>
                  <div className="phone-input">
                    <span>+998</span>
                    <input className="input" name="phone" inputMode="numeric" placeholder="90 123 45 67" required />
                  </div>
                  <small>Foydalanuvchi saytda ro‘yxatdan o‘tgan bo‘lishi kerak.</small>
                </label>
                <ConfirmButton className="btn btn--sm" name="op" value="set">Biriktirish</ConfirmButton>
              </form>
            )}
          </section>

          {user.role === 'admin' && (
            <section className="card card-pad">
              <h2 className="section-title" style={{ marginBottom: 10 }}>Xavfli hudud</h2>
              <p className="muted" style={{ marginTop: 0 }}>
                O‘chirilganda barcha xizmatlar, bronlar va sharhlar ham o‘chadi. Odatda «Yashirin» holati yetarli.
              </p>
              <form action={deleteComplex}>
                <input type="hidden" name="id" value={complex.id} />
                <ConfirmButton className="btn btn--danger" confirm={`«${complex.name}» butunlay o‘chirilsinmi? Bu amalni qaytarib bo‘lmaydi.`}>
                  Majmuani o‘chirish
                </ConfirmButton>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  )
}
