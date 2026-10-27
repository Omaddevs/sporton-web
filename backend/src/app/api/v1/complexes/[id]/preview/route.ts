import { asc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes, services } from '@/db/schema'
import { ratingsByComplex, serializeComplex, serializeService } from '@/lib/catalog'
import { ApiError, json, notFound, route } from '@/lib/http'
import { verifyPreviewToken } from '@/lib/preview'

export const dynamic = 'force-dynamic'

/** Qoralama/yashirin majmuani saytda oldindan ko‘rish (imzolangan, muddati cheklangan havola) */
export const GET = route<{ id: string }>(async (request, { params }) => {
  const { id } = await params
  if (!verifyPreviewToken(id, new URL(request.url).searchParams.get('token'))) {
    throw new ApiError(403, 'PREVIEW_EXPIRED', 'Ko‘rish havolasi eskirgan. Admin paneldan qayta oching')
  }
  const db = await getDb()
  const [row] = await db.select().from(complexes).where(eq(complexes.id, id)).limit(1)
  if (!row) throw notFound('Majmua')
  const list = await db.select().from(services).where(eq(services.complexId, id)).orderBy(asc(services.id))
  const rating = (await ratingsByComplex([id])).get(id) ?? { rating: null, reviewsCount: 0 }
  return json({
    complex: { ...serializeComplex(row, rating, list.length), status: row.status },
    services: list.map((s) => ({ ...serializeService(s), status: s.status })),
  })
})
