import Link from 'next/link'
import { and, asc, count, desc, eq, gt, ilike, lt, lte, gte, or, type SQL } from 'drizzle-orm'
import { Copy, ExternalLink, Eye, EyeOff, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { getDb } from '@/db'
import { events } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Badge, Empty, Flash, PageHeader, Pagination, Tabs, type Tone } from '@/components/admin/ui'
import { PAGE_SIZE, formatDateTime, pageParam, requireStaff, str } from '@/lib/admin'
import { deleteEvent, duplicateEvent, setEventStatus } from './actions'

export const metadata = { title: 'Sport tadbirlari' }

const MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek']
const tashkent = (d: Date) => new Date(d.getTime() + 5 * 3_600_000)

function phase(e: { startsAt: Date; endsAt: Date; status: string }, now: Date): { label: string; tone: Tone } {
  if (e.status === 'draft') return { label: 'Qoralama', tone: 'neutral' }
  if (now > e.endsAt) return { label: 'Yakunlangan', tone: 'info' }
  if (now >= e.startsAt) return { label: 'Davom etmoqda', tone: 'warning' }
  return { label: 'Kelgusi', tone: 'success' }
}

export default async function EventsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireStaff()
  const params = await searchParams
  const tab = str(params.tab)
  const q = str(params.q)
  const page = pageParam(params.page)
  const now = new Date()
  const db = await getDb()

  const published = eq(events.status, 'published')
  const tabs: Record<string, SQL | undefined> = {
    '': undefined,
    upcoming: and(published, gt(events.startsAt, now)),
    live: and(published, lte(events.startsAt, now), gte(events.endsAt, now)),
    past: and(published, lt(events.endsAt, now)),
    draft: eq(events.status, 'draft'),
  }
  const search = q ? or(ilike(events.title, `%${q}%`), ilike(events.category, `%${q}%`), ilike(events.location, `%${q}%`)) : undefined
  const where = and(tabs[tab] ?? undefined, search)
  const order = tab === 'upcoming' || tab === 'live' ? asc(events.startsAt) : desc(events.startsAt)

  const [rows, [{ total }], counts] = await Promise.all([
    db.select().from(events).where(where).orderBy(order).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(events).where(where),
    Promise.all(Object.entries(tabs).map(async ([id, cond]) => [id, (await db.select({ n: count() }).from(events).where(cond))[0].n] as const)),
  ])
  const countOf = Object.fromEntries(counts)
  const siteUrl = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '')

  return (
    <>
      <PageHeader
        title="Sport tadbirlari"
        description="Turnirlar, marafonlar va ochiq mashg‘ulotlar. E’lon qilinganlari bosh sahifada va /tadbir sahifasida ko‘rinadi."
        actions={
          <Link className="btn btn--primary" href="/admin/events/new">
            <Plus /> Yangi tadbir
          </Link>
        }
      />
      <Flash params={params} />
      <section className="card">
        <div className="toolbar">
          <Tabs
            base="/admin/events"
            params={{ q: q || undefined }}
            name="tab"
            current={tab}
            items={[
              { id: '', label: 'Barchasi', count: countOf[''] },
              { id: 'upcoming', label: 'Kelgusi', count: countOf.upcoming },
              { id: 'live', label: 'Davom etmoqda', count: countOf.live },
              { id: 'past', label: 'Yakunlangan', count: countOf.past },
              { id: 'draft', label: 'Qoralama', count: countOf.draft },
            ]}
          />
          <form style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {tab && <input type="hidden" name="tab" value={tab} />}
            <input className="input" name="q" defaultValue={q} placeholder="Nomi, sport turi yoki manzil…" />
            <button className="btn">Qidirish</button>
          </form>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl tbl--news">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>Sana</th>
                  <th style={{ width: 96 }}>Rasm</th>
                  <th>Tadbir</th>
                  <th>Vaqti</th>
                  <th>Joylar</th>
                  <th>Holat</th>
                  <th className="num">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const edit = `/admin/events/${e.id}`
                  const isPublished = e.status === 'published'
                  const local = tashkent(e.startsAt)
                  const ph = phase(e, now)
                  const fill = e.capacity ? Math.min(100, Math.round((e.registered / e.capacity) * 100)) : 0
                  return (
                    <tr key={e.id}>
                      <td>
                        <span className="event-date">
                          <b>{local.getUTCDate()}</b>
                          <small>{MONTHS[local.getUTCMonth()]}</small>
                        </span>
                      </td>
                      <td>
                        <Link href={edit} aria-label={`«${e.title}» ni tahrirlash`}>
                          {e.image ? <img src={e.image} alt="" className="tbl-thumb" loading="lazy" /> : <span className="tbl-thumb tbl-thumb--empty" />}
                        </Link>
                      </td>
                      <td>
                        <Link className="cell-main cell-link" href={edit}>
                          {e.title}
                        </Link>
                        <span className="cell-sub">
                          {e.category} · {e.location}
                        </span>
                      </td>
                      <td className="nowrap">
                        {formatDateTime(e.startsAt)}
                        <span className="cell-sub">gacha {formatDateTime(e.endsAt)}</span>
                      </td>
                      <td className="nowrap">
                        <span className="stat" style={{ marginLeft: 0 }} title="Ro‘yxatdan o‘tganlar / joylar">
                          <Users size={14} /> {e.registered} / {e.capacity}
                        </span>
                        <span className="seat-bar" aria-hidden="true">
                          <span style={{ width: `${fill}%` }} />
                        </span>
                        <span className="cell-sub">
                          <Eye size={12} style={{ verticalAlign: -2 }} /> {e.views} ko‘rish
                        </span>
                      </td>
                      <td>
                        <Badge tone={ph.tone}>{ph.label}</Badge>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link href={edit} className="btn btn--sm btn--primary">
                            <Pencil /> Tahrirlash
                          </Link>
                          {siteUrl && isPublished && (
                            <a href={`${siteUrl}/tadbir/${e.id}`} target="_blank" rel="noreferrer" className="btn btn--sm btn--icon" title="Saytda ko‘rish" aria-label="Saytda ko‘rish">
                              <ExternalLink />
                            </a>
                          )}
                          <form action={duplicateEvent}>
                            <input type="hidden" name="id" value={e.id} />
                            <ConfirmButton className="btn btn--sm btn--icon">
                              <span title="Nusxa olish" aria-label="Nusxa olish" style={{ display: 'inline-flex' }}>
                                <Copy />
                              </span>
                            </ConfirmButton>
                          </form>
                          <form action={setEventStatus}>
                            <input type="hidden" name="id" value={e.id} />
                            <input type="hidden" name="status" value={isPublished ? 'draft' : 'published'} />
                            <ConfirmButton
                              className={`btn btn--sm btn--icon ${isPublished ? '' : 'btn--success'}`}
                              confirm={isPublished ? 'Tadbir saytdan olinib, qoralamaga o‘tkazilsinmi?' : undefined}
                            >
                              <span title={isPublished ? 'Saytdan olish' : 'E’lon qilish'} aria-label={isPublished ? 'Saytdan olish' : 'E’lon qilish'} style={{ display: 'inline-flex' }}>
                                {isPublished ? <EyeOff /> : <Eye />}
                              </span>
                            </ConfirmButton>
                          </form>
                          <form action={deleteEvent}>
                            <input type="hidden" name="id" value={e.id} />
                            <ConfirmButton className="btn btn--sm btn--icon btn--danger" confirm={`«${e.title}» o‘chirilsinmi? Bu amalni qaytarib bo‘lmaydi.`}>
                              <span title="O‘chirish" aria-label="O‘chirish" style={{ display: 'inline-flex' }}>
                                <Trash2 />
                              </span>
                            </ConfirmButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title={q || tab ? 'Hech narsa topilmadi' : 'Tadbirlar yo‘q'}>
            {!q && !tab && (
              <Link href="/admin/events/new" className="btn btn--primary" style={{ marginTop: 12 }}>
                <Plus /> Birinchi tadbirni yaratish
              </Link>
            )}
          </Empty>
        )}
        <Pagination base="/admin/events" params={{ tab: tab || undefined, q: q || undefined }} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
