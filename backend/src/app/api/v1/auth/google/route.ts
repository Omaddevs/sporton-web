import { z } from 'zod'
import { publicUser, setSessionCookie } from '@/lib/auth'
import { json, readJson, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { upsertProviderUser, verifyGoogleCredential } from '@/lib/social-auth'

export const POST = route(async (request) => {
  await rateLimit(`oauth:${clientIp(request)}`, 30, 15 * 60_000)
  const { credential } = await readJson(request, z.object({ credential: z.string().min(20) }))
  const user = await upsertProviderUser(await verifyGoogleCredential(credential))
  await setSessionCookie(user)
  return json({ user: publicUser(user) })
})
