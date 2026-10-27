import { and, count, eq, inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings } from '@/db/schema'
import OwnerSidebar from '@/components/admin/OwnerSidebar'
import { requireOwner } from '@/lib/owner'

export const dynamic = 'force-dynamic'
export const metadata = { title: { default: 'Majmua kabineti', template: '%s · Majmua kabineti' } }

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { user, owned, complexIds } = await requireOwner()
  const db = await getDb()
  const [{ n }] = await db
    .select({ n: count() })
    .from(bookings)
    .where(and(inArray(bookings.complexId, complexIds), eq(bookings.status, 'pending')))
  return (
    <div className="adm">
      <OwnerSidebar
        me={`${user.firstName} ${user.lastName}`.trim()}
        owned={owned}
        pending={n}
        siteUrl={process.env.PUBLIC_SITE_URL ?? ''}
      />
      <main className="adm-main">{children}</main>
    </div>
  )
}
