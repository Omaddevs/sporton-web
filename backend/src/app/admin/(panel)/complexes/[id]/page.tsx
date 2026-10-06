import Link from 'next/link'
import { notFound } from 'next/navigation'
import { asc, eq } from 'drizzle-orm'
import { ExternalLink, Plus } from 'lucide-react'
import { getDb } from '@/db'
import { complexes, services } from '@/db/schema'
import ComplexForm from '@/components/admin/ComplexForm'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Empty, Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { SERVICE_TYPE_LABELS } from '@/lib/constants'
import { deleteComplex, updateComplex } from '../actions'

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
  const siteUrl = process.env.PUBLIC_SITE_URL

  return (
    <>
      <PageHeader
        title={complex.name}
        description={<>ID: <code>{complex.id}</code> · <StatusBadge status={complex.status} /></>}
        crumbs={[{ href: '/admin/complexes', label: 'Majmualar' }]}
        actions={
          siteUrl ? (
            <a className="btn" href={`${siteUrl}/sport-majmua/${complex.id}`} target="_blank" rel="noreferrer">
              <ExternalLink /> Saytda ko‘rish
            </a>
          ) : null
        }
      />
      <Flash params={await searchParams} />

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
                    {s.status === 'hidden' && <StatusBadge status="hidden" />}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="Xizmat yo‘q">Bron qilish uchun kamida bitta xizmat qo‘shing.</Empty>
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
