import { z } from 'zod'
import { LIKE_KINDS } from '@/db/schema'
import { getCurrentUser, requireUser } from '@/lib/auth'
import { likeSchema, likeState, setLike } from '@/lib/favorites'
import { json, readJson, route } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const query = z.object({ kind: z.enum(LIKE_KINDS), id: z.string().regex(/^[\w-]{1,80}$/) })

/** GET ?kind=complex&id=olimpiya → { count, liked } (liked — faqat kirgan foydalanuvchi uchun) */
export const GET = route(async (request) => {
  const url = new URL(request.url)
  const { kind, id } = query.parse({ kind: url.searchParams.get('kind'), id: url.searchParams.get('id') })
  const user = await getCurrentUser()
  return json(await likeState(kind, id, user?.id))
})

export const PUT = route(async (request) => {
  const user = await requireUser()
  await rateLimit(`like:${user.id}`, 300, 60 * 60_000)
  const { kind, id, liked } = await readJson(request, likeSchema)
  return json(await setLike(user.id, kind, id, liked))
})
