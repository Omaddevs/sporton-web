import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { recordError } from '@/lib/errors'
import { json, readJson, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'

const schema = z.object({
  message: z.string().trim().min(1).max(1000),
  stack: z.string().max(8000).optional(),
  url: z.string().max(1000).optional(),
})

/** Brauzerdagi JS xatolari (window.onerror, ErrorBoundary) — admin → «Xatolar» */
export const POST = route(async (request) => {
  await rateLimit(`client-error:${clientIp(request)}`, 20, 10 * 60_000)
  const data = await readJson(request, schema)
  const user = await getCurrentUser()
  await recordError({ source: 'client', ...data, userAgent: request.headers.get('user-agent'), userId: user?.id })
  return json({ ok: true })
})
