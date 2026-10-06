import Link from 'next/link'
import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  actions,
  crumbs,
}: {
  title: string
  description?: ReactNode
  actions?: ReactNode
  crumbs?: Array<{ href: string; label: string }>
}) {
  return (
    <header className="adm-head">
      <div>
        {crumbs && (
          <nav className="adm-crumbs" aria-label="Breadcrumb">
            {crumbs.map((c) => (
              <span key={c.href}>
                <Link href={c.href}>{c.label}</Link> /
              </span>
            ))}
          </nav>
        )}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="adm-head__actions">{actions}</div>}
    </header>
  )
}

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary'

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>
}

export const STATUS_BADGES: Record<string, { label: string; tone: Tone }> = {
  pending: { label: 'Kutilmoqda', tone: 'warning' },
  confirmed: { label: 'Tasdiqlangan', tone: 'success' },
  completed: { label: 'Yakunlangan', tone: 'info' },
  cancelled: { label: 'Bekor qilingan', tone: 'neutral' },
  approved: { label: 'Tasdiqlangan', tone: 'success' },
  rejected: { label: 'Rad etilgan', tone: 'danger' },
  published: { label: 'E’lon qilingan', tone: 'success' },
  hidden: { label: 'Yashirin', tone: 'neutral' },
  draft: { label: 'Qoralama', tone: 'neutral' },
  active: { label: 'Faol', tone: 'success' },
  blocked: { label: 'Bloklangan', tone: 'danger' },
  open: { label: 'Ochiq', tone: 'warning' },
  closed: { label: 'Yopilgan', tone: 'neutral' },
  unsubscribed: { label: 'Obunadan chiqqan', tone: 'neutral' },
}

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_BADGES[status] ?? { label: status, tone: 'neutral' as Tone }
  return <Badge tone={meta.tone}>{meta.label}</Badge>
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <b>{title}</b>
      {children}
    </div>
  )
}

/** Server action’dan keyin ?ok= / ?error= orqali keladigan xabar */
export function Flash({ params }: { params: Record<string, string | string[] | undefined> }) {
  const ok = typeof params.ok === 'string' ? params.ok : null
  const error = typeof params.error === 'string' ? params.error : null
  if (error === 'forbidden') return <div className="alert alert--danger">Bu bo‘lim uchun admin huquqi kerak.</div>
  if (error) return <div className="alert alert--danger">{error}</div>
  if (ok) return <div className="alert alert--success">{ok}</div>
  return null
}

/** Joriy query’ni saqlab, bitta parametrni almashtiradi */
export function withQuery(base: string, params: Record<string, string | undefined>, patch: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries({ ...params, ...patch })) {
    if (v !== undefined && v !== '' && k !== 'ok' && k !== 'error') q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `${base}?${s}` : base
}

export function Pagination({
  base,
  params,
  page,
  pageSize,
  total,
}: {
  base: string
  params: Record<string, string | undefined>
  page: number
  pageSize: number
  total: number
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  return (
    <div className="pager">
      <span>
        {from}–{to} / {total}
      </span>
      <div>
        {page > 1 ? (
          <Link className="btn btn--sm" href={withQuery(base, params, { page: page - 1 })}>← Oldingi</Link>
        ) : (
          <button className="btn btn--sm" disabled>← Oldingi</button>
        )}
        {page < pages ? (
          <Link className="btn btn--sm" href={withQuery(base, params, { page: page + 1 })}>Keyingi →</Link>
        ) : (
          <button className="btn btn--sm" disabled>Keyingi →</button>
        )}
      </div>
    </div>
  )
}

export function Tabs({
  base,
  params,
  name,
  current,
  items,
}: {
  base: string
  params: Record<string, string | undefined>
  name: string
  current: string
  items: Array<{ id: string; label: string; count?: number }>
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((item) => (
        <Link key={item.id} href={withQuery(base, params, { [name]: item.id || undefined, page: undefined })} aria-current={current === item.id}>
          {item.label}
          {item.count != null && <span>{item.count}</span>}
        </Link>
      ))}
    </div>
  )
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-label={`${value} / 5`}>
      {'★'.repeat(value)}
      <span className="muted">{'★'.repeat(5 - value)}</span>
    </span>
  )
}
