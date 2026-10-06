import { inArray } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import BroadcastForm from '@/components/admin/BroadcastForm'
import { Flash, PageHeader } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { audienceCounts } from '@/lib/notify'
import { formatPhone } from '@/lib/phone'
import { pushEnabled } from '@/lib/push'
import { telegramEnabled } from '@/lib/telegram'

export const metadata = { title: 'Yangi xabar' }
export const dynamic = 'force-dynamic'

export default async function NewBroadcastPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  await requireStaff()
  const params = await searchParams
  const ids = [params.user].flat().filter((v): v is string => typeof v === 'string' && /^[0-9a-f-]{36}$/.test(v))
  const db = await getDb()
  const picked = ids.length
    ? (await db.select().from(users).where(inArray(users.id, ids))).map((u) => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`.trim(),
        phone: u.phone ? formatPhone(u.phone) : '',
      }))
    : []
  const counts = await audienceCounts()

  return (
    <>
      <PageHeader
        title="Yangi xabar"
        description="Avval o‘zingizga test yuborib, ko‘rinishini tekshiring."
        crumbs={[{ href: '/admin/notifications', label: 'Bildirishnomalar' }]}
      />
      <Flash params={params as Record<string, string>} />
      <BroadcastForm
        counts={{ all: counts.all ?? 0, bookers: counts.bookers ?? 0, active30: counts.active30 ?? 0 }}
        picked={picked}
        telegramAvailable={telegramEnabled()}
        pushAvailable={pushEnabled()}
      />
    </>
  )
}
