import { count, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings, submissions, supportTickets } from '@/db/schema'
import Sidebar from '@/components/admin/Sidebar'
import { requireStaff } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff()
  const db = await getDb()
  const [[b], [s], [t]] = await Promise.all([
    db.select({ n: count() }).from(bookings).where(eq(bookings.status, 'pending')),
    db.select({ n: count() }).from(submissions).where(eq(submissions.status, 'pending')),
    db.select({ n: count() }).from(supportTickets).where(eq(supportTickets.status, 'open')),
  ])

  return (
    <div className="adm">
      <Sidebar
        counts={{ bookings: b.n, submissions: s.n, tickets: t.n }}
        me={{ name: `${user.firstName} ${user.lastName}`.trim(), role: user.role, isAdmin: user.role === 'admin' }}
      />
      <main className="adm-main">{children}</main>
    </div>
  )
}
