import { requireUser } from '@/lib/auth'
import { favoriteSchema, listFavorites, setFavorite } from '@/lib/favorites'
import { json, readJson, route } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

/** Saqlanganlar: { complex: [...], service: [...], course: [...] } — eng yangisi birinchi */
export const GET = route(async () => {
  const user = await requireUser()
  return json({ favorites: await listFavorites(user.id) })
})

export const PUT = route(async (request) => {
  const user = await requireUser()
  await rateLimit(`favorite:${user.id}`, 300, 60 * 60_000)
  const { kind, id, saved } = await readJson(request, favoriteSchema)
  await setFavorite(user.id, kind, id, saved)
  return json({ ok: true })
})
