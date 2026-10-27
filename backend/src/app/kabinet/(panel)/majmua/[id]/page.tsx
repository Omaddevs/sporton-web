import Link from 'next/link'
import { asc, eq } from 'drizzle-orm'
import { ExternalLink, Eye, Plus } from 'lucide-react'
import { getDb } from '@/db'
import { complexes, services } from '@/db/schema'
import ComplexForm from '@/components/admin/ComplexForm'
import { Badge, Empty, Flash, PageHeader, StatusBadge } from '@/components/admin/ui'
import { BOOKING_MODE_SHORT } from '@/lib/constants'
import { requireOwnedComplex } from '@/lib/owner'
import { previewToken } from '@/lib/preview'
import { ownerUpdateComplex } from '../../actions'

export default async function OwnerComplexPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const id = decodeURIComponent((await params).id)
  await requireOwnedComplex(id)
  const db = await getDb()
  const [complex] = await db.select().from(complexes).where(eq(complexes.id, id)).limit(1)
  const list = await db.select().from(services).where(eq(services.complexId, id)).orderBy(asc(services.id))
  const site = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '') ?? ''
  const live = complex.status === 'published'
  const pageUrl = `${site}/sport-majmua/${encodeURIComponent(id)}`

  return (
    <>
      <PageHeader
        title={complex.name}
        description={<StatusBadge status={complex.status} />}
        crumbs={[{ href: '/kabinet', label: 'Kabinet' }]}
        actions={
          live ? (
            <a className="btn" href={pageUrl} target="_blank" rel="noreferrer">
              <ExternalLink /> Saytda ko‘rish
            </a>
          ) : (
            <a className="btn" href={`${pageUrl}?preview=${previewToken(id)}`} target="_blank" rel="noreferrer">
              <Eye /> Oldindan ko‘rish
            </a>
          )
        }
      />
      <Flash params={await searchParams} />
      {!live && (
        <div className="alert alert--warning">
          Majmua hozir saytda ko‘rinmaydi ({complex.status === 'draft' ? 'admin tekshiruvida' : 'vaqtincha yashirilgan'}). Ma’lumotlarni
          to‘ldiring — admin tekshirib e’lon qiladi.
        </div>
      )}

      <div className="grid-main">
        <ComplexForm complex={complex} action={ownerUpdateComplex} submitLabel="Saqlash" variant="owner" />

        <section className="card">
          <div className="card-head">
            <h2>Xizmatlar ({list.length})</h2>
            <Link href={`/kabinet/xizmat/new?complex=${encodeURIComponent(id)}`}>
              <Plus size={14} style={{ verticalAlign: -2 }} /> Qo‘shish
            </Link>
          </div>
          {list.length ? (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {list.map((s) => (
                <li key={s.id} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                  <Link href={`/kabinet/xizmat/${s.id}`} className="cell-main">
                    {s.title}
                  </Link>
                  <span className="cell-sub">
                    {s.category} · {s.price}
                  </span>
                  <span style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                    <Badge tone={s.bookingMode === 'call' ? 'neutral' : 'primary'}>{BOOKING_MODE_SHORT[s.bookingMode]}</Badge>
                    {s.status !== 'published' && <StatusBadge status={s.status} />}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="Xizmat yo‘q">Mijozlar bron qilishi uchun kamida bitta xizmat qo‘shing.</Empty>
          )}
        </section>
      </div>
    </>
  )
}
