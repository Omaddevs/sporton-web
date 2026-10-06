import { and, eq, inArray, isNotNull } from 'drizzle-orm'
import { getDb } from '@/db'
import { bookings } from '@/db/schema'
import { ApiError, json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

/** Band soatlar: GET ?from=YYYY-MM-DD&days=7 → { busy: { "2026-10-05": [9, 18] } } */
export const GET = route<{ id: string }>(async (request, { params }) => {
  const serviceId = Number((await params).id)
  const url = new URL(request.url)
  const from = url.searchParams.get('from') ?? new Date().toISOString().slice(0, 10)
  const days = Math.min(31, Math.max(1, Number(url.searchParams.get('days') ?? 7)))
  if (!Number.isInteger(serviceId) || !/^\d{4}-\d{2}-\d{2}$/.test(from)) {
    throw new ApiError(400, 'BAD_REQUEST', 'So‘rov parametrlari noto‘g‘ri')
  }

  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(`${from}T00:00:00Z`)
    d.setUTCDate(d.getUTCDate() + i)
    return d.toISOString().slice(0, 10)
  })

  const db = await getDb()
  const rows = await db
    .select({ date: bookings.date, hour: bookings.hour })
    .from(bookings)
    .where(
      and(
        eq(bookings.serviceId, serviceId),
        inArray(bookings.date, dates),
        inArray(bookings.status, ['pending', 'confirmed']),
        isNotNull(bookings.hour),
      ),
    )

  const busy: Record<string, number[]> = {}
  for (const row of rows) (busy[row.date!] ??= []).push(row.hour!)
  return json({ busy })
})
