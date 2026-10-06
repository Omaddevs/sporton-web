import { getCatalog } from '@/lib/catalog'
import { json, route } from '@/lib/http'

export const dynamic = 'force-dynamic'

/** Barcha e’lon qilingan majmualar va xizmatlar — frontend bir marta yuklaydi */
export const GET = route(async () => {
  const data = await getCatalog()
  return json(data, { headers: { 'cache-control': 'public, max-age=30, stale-while-revalidate=120' } })
})
