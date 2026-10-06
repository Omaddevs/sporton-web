import { z } from 'zod'
import { publicUser, setSessionCookie } from '@/lib/auth'
import { json, readJson, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { upsertProviderUser, verifyTelegramLogin } from '@/lib/social-auth'

export const POST = route(async (request) => {
  rateLimit(`oauth:${clientIp(request)}`, 30, 15 * 60_000)
  const data = await readJson(request, z.record(z.string(), z.union([z.string(), z.number()])))
  const user = await upsertProviderUser(verifyTelegramLogin(data))
  await setSessionCookie(user)
  return json({ user: publicUser(user) })
})
