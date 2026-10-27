import { requireUser } from '@/lib/auth'
import { favoriteImportSchema, importFavorites, listFavorites } from '@/lib/favorites'
import { json, readJson, route } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'

/** Kirishdan oldin brauzerda saqlanganlarni hisobga qo‘shadi (bir martalik ko‘chirish) */
export const POST = route(async (request) => {
  const user = await requireUser()
  await rateLimit(`favorite-import:${user.id}`, 10, 60 * 60_000)
  const { items } = await readJson(request, favoriteImportSchema)
  await importFavorites(user.id, items)
  return json({ favorites: await listFavorites(user.id) })
})
