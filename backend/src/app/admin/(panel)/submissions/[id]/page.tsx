import Link from 'next/link'
import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { submissions, users } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { formatDateTime, formatSum, requireStaff } from '@/lib/admin'
import { AMENITIES, REGIONS } from '@/lib/constants'
import { formatPhone } from '@/lib/phone'
import { approveSubmission, rejectSubmission } from '../actions'

export default async function SubmissionDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  await requireStaff()
  const { id } = await params
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound()
  const db = await getDb()
  const [row] = await db
    .select({ s: submissions, user: users })
    .from(submissions)
    .leftJoin(users, eq(users.id, submissions.userId))
    .where(eq(submissions.id, id))
    .limit(1)
  if (!row) notFound()
  const { s, user } = row
  const p = s.payload
  const media = p.media ?? (p.photos ?? []).map((url) => ({ type: 'image' as const, url, provider: 'file' as const }))

  return (
    <>
      <PageHeader
        title={s.name}
        description={<><StatusBadge status={s.status} /> · {formatDateTime(s.createdAt)}</>}
        crumbs={[{ href: '/admin/submissions', label: 'Arizalar' }]}
      />
      <Flash params={await searchParams} />
      <div className="grid-main">
        <div className="stack">
          <section className="card card-pad">
            <dl className="dl">
              <dt>Sport turlari</dt>
              <dd><div className="chips">{p.sports.map((x) => <span className="chip" key={x}>{x}</span>)}</div></dd>
              <dt>Hudud</dt>
              <dd>{REGIONS.find((r) => r.id === p.region)?.label ?? p.region}</dd>
              <dt>Manzil</dt>
              <dd>{p.address}</dd>
              {p.landmark && (<><dt>Mo‘ljal</dt><dd>{p.landmark}</dd></>)}
              <dt>Narx</dt>
              <dd>{formatSum(p.price)} / soat</dd>
              <dt>Ish vaqti</dt>
              <dd>{p.opens} – {p.closes}</dd>
              <dt>Telefon</dt>
              <dd><a href={`tel:+998${p.phone}`}>{formatPhone(p.phone)}</a></dd>
              {p.telegram && (<><dt>Telegram</dt><dd>{p.telegram}</dd></>)}
              <dt>Qulayliklar</dt>
              <dd>{p.amenities.map((a) => AMENITIES.find((x) => x.id === a)?.label ?? a).join(', ') || '—'}</dd>
              <dt>Tavsif</dt>
              <dd style={{ whiteSpace: 'pre-wrap', fontWeight: 500 }}>{p.description}</dd>
            </dl>
          </section>
          <section className="card card-pad">
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Rasm va videolar ({media.length})
            </h2>
            <div className="photos">
              {media.map((m) =>
                m.type === 'image' ? (
                  <a key={m.url} href={m.url} target="_blank" rel="noreferrer">
                    <img src={m.url} alt="" loading="lazy" />
                  </a>
                ) : m.provider === 'file' || m.provider === 'link' ? (
                  <video key={m.url} src={m.url} controls preload="metadata" />
                ) : (
                  <iframe key={m.url} src={m.url} title="Video" loading="lazy" allowFullScreen />
                ),
              )}
            </div>
          </section>
        </div>

        <div className="stack">
          <section className="card card-pad">
            <h2 className="section-title" style={{ marginBottom: 12 }}>Yuboruvchi</h2>
            {user ? (
              <dl className="dl" style={{ gridTemplateColumns: '90px 1fr' }}>
                <dt>Ism</dt>
                <dd>{user.firstName} {user.lastName}</dd>
                <dt>Telefon</dt>
                <dd>{formatPhone(user.phone)}</dd>
                <dt>Ro‘yxatdan</dt>
                <dd>{formatDateTime(user.createdAt)}</dd>
              </dl>
            ) : (
              <p className="muted">Hisob o‘chirilgan</p>
            )}
          </section>

          {s.status === 'pending' ? (
            <section className="card card-pad form">
              <h2 className="section-title">Qaror</h2>
              <form action={approveSubmission} className="form">
                <input type="hidden" name="id" value={s.id} />
                <label className="check">
                  <input type="checkbox" name="publish" /> Darhol saytda e’lon qilish
                </label>
                <small className="muted">Belgilanmasa, majmua «yashirin» holatda yaratiladi — tahrirlab, keyin e’lon qilasiz.</small>
                <ConfirmButton className="btn btn--primary btn--block">Tasdiqlash va majmua yaratish</ConfirmButton>
              </form>
              <form action={rejectSubmission} className="form" style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <input type="hidden" name="id" value={s.id} />
                <label className="fld">
                  <span>Rad etish sababi</span>
                  <textarea className="textarea" name="adminNote" rows={3} placeholder="Foydalanuvchiga yuboriladi" />
                </label>
                <ConfirmButton className="btn btn--danger btn--block" confirm="Ariza rad etilsinmi?">Rad etish</ConfirmButton>
              </form>
            </section>
          ) : (
            <section className="card card-pad">
              <h2 className="section-title" style={{ marginBottom: 8 }}>Ko‘rib chiqilgan</h2>
              <p className="muted" style={{ margin: 0 }}>{formatDateTime(s.reviewedAt)}</p>
              {s.adminNote && <p>{s.adminNote}</p>}
              {s.complexId && <Link className="btn" href={`/admin/complexes/${s.complexId}`}>Majmuani ochish</Link>}
            </section>
          )}
        </div>
      </div>
    </>
  )
}
