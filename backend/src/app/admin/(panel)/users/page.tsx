import { and, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm'
import Link from 'next/link'
import { BellRing } from 'lucide-react'
import { getDb } from '@/db'
import { bookings, users } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import { Badge, Empty, Flash, PageHeader, Pagination, StatusBadge, Tabs, withQuery } from '@/components/admin/ui'
import { formatDateTime, PAGE_SIZE, pageParam, requireStaff, str } from '@/lib/admin'
import { formatPhone, toLocalDigits } from '@/lib/phone'
import { updateUser } from './actions'

export const metadata = { title: 'Foydalanuvchilar' }

const ROLE_LABEL = { user: 'Foydalanuvchi', moderator: 'Moderator', admin: 'Admin' } as const
const PROVIDER_LABEL = { phone: 'Telefon', google: 'Google', telegram: 'Telegram' } as const

export default async function UsersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const me = await requireStaff()
  const params = await searchParams
  const q = str(params.q)
  const role = str(params.role)
  const page = pageParam(params.page)
  const db = await getDb()
  const isAdmin = me.role === 'admin'

  const filters: SQL[] = []
  if (role === 'staff') filters.push(or(eq(users.role, 'admin'), eq(users.role, 'moderator'))!)
  if (role === 'blocked') filters.push(eq(users.status, 'blocked'))
  if (q) {
    const digits = toLocalDigits(q)
    filters.push(
      or(
        ilike(users.firstName, `%${q}%`),
        ilike(users.lastName, `%${q}%`),
        ilike(users.email, `%${q}%`),
        ...(digits.length >= 3 ? [ilike(users.phone, `%${digits}%`)] : []),
      )!,
    )
  }
  const where = filters.length ? and(...filters) : undefined

  const [rows, [{ total }], bookingCounts] = await Promise.all([
    db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(users).where(where),
    db.select({ id: bookings.userId, n: count() }).from(bookings).groupBy(bookings.userId),
  ])
  const byUser = new Map(bookingCounts.map((b) => [b.id, b.n]))
  const back = withQuery('/admin/users', params, {})

  return (
    <>
      <PageHeader title="Foydalanuvchilar" description={isAdmin ? 'Rollar va kirish huquqlarini boshqaring.' : 'Faqat ko‘rish (o‘zgartirish uchun admin huquqi kerak).'} />
      <Flash params={params} />
      <section className="card">
        <div className="toolbar">
          <Tabs
            base="/admin/users"
            params={params}
            name="role"
            current={role}
            items={[
              { id: '', label: 'Barchasi' },
              { id: 'staff', label: 'Xodimlar' },
              { id: 'blocked', label: 'Bloklangan' },
            ]}
          />
          <form style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {role && <input type="hidden" name="role" value={role} />}
            <input className="input" name="q" defaultValue={q} placeholder="Ism, telefon yoki email…" />
            <button className="btn">Qidirish</button>
          </form>
        </div>
        {rows.length ? (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Foydalanuvchi</th>
                  <th>Aloqa</th>
                  <th>Rol</th>
                  <th className="num">Bronlar</th>
                  <th>Ro‘yxatdan / oxirgi kirish</th>
                  <th>Holat</th>
                  <th className="num">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <span className="cell-main">{u.firstName} {u.lastName}</span>
                      <span className="cell-sub">{PROVIDER_LABEL[u.provider]}</span>
                    </td>
                    <td>
                      {u.phone ? formatPhone(u.phone) : '—'}
                      {u.email && <span className="cell-sub">{u.email}</span>}
                    </td>
                    <td>{u.role === 'user' ? ROLE_LABEL.user : <Badge tone="primary">{ROLE_LABEL[u.role]}</Badge>}</td>
                    <td className="num">{byUser.get(u.id) ?? 0}</td>
                    <td className="nowrap">
                      {formatDateTime(u.createdAt)}
                      <span className="cell-sub">{formatDateTime(u.lastLoginAt)}</span>
                    </td>
                    <td><StatusBadge status={u.status} /></td>
                    <td>
                      <div className="row-actions">
                        <Link href={`/admin/notifications/new?user=${u.id}`} className="btn btn--sm" title="Bildirishnoma yuborish">
                          <BellRing size={14} /> Xabar
                        </Link>
                        {isAdmin && u.id === me.id && <span className="muted">Siz</span>}
                        {isAdmin && u.id !== me.id && (
                          <form action={updateUser} className="row-actions">
                            <input type="hidden" name="id" value={u.id} />
                            <input type="hidden" name="back" value={back} />
                            <select className="select" name="role" defaultValue={u.role} style={{ height: 30, width: 'auto' }} aria-label="Rol">
                              <option value="user">Foydalanuvchi</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                            <ConfirmButton name="op" value="role" confirm="Rol o‘zgartirilsinmi?">Rolni saqlash</ConfirmButton>
                            {u.status === 'active' ? (
                              <ConfirmButton className="btn btn--sm btn--danger" name="op" value="block" confirm={`${u.firstName} bloklansinmi?`}>Bloklash</ConfirmButton>
                            ) : (
                              <ConfirmButton className="btn btn--sm btn--success" name="op" value="unblock">Blokdan chiqarish</ConfirmButton>
                            )}
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty title="Foydalanuvchi topilmadi" />
        )}
        <Pagination base="/admin/users" params={params} page={page} pageSize={PAGE_SIZE} total={total} />
      </section>
    </>
  )
}
