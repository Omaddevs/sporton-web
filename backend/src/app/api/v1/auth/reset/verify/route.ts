import { json, readJson, route } from '@/lib/http'
import { clientIp, rateLimit } from '@/lib/rate-limit'
import { verifyResetCode } from '@/lib/reset'
import { resetVerifySchema } from '@/lib/validation'

export const POST = route(async (request) => {
  const { phone, code } = await readJson(request, resetVerifySchema)
  rateLimit(`reset-verify:${clientIp(request)}`, 20, 15 * 60_000)
  return json(await verifyResetCode(phone, code))
})
