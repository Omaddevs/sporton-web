import { requireUser } from '@/lib/auth'
import { ApiError, json, route } from '@/lib/http'
import { corsHeadersFor, isTrustedOrigin } from '@/lib/origin'
import { rateLimit } from '@/lib/rate-limit'
import { MAX_VIDEO_BYTES, saveUploadStream } from '@/lib/uploads'

export const dynamic = 'force-dynamic'

/**
 * Bitta fayl yuklash (rasm yoki video). Tana — faylning o‘zi (multipart emas), shuning uchun
 * oqim bilan diskka yoziladi. Bu yo‘l proxy.ts dan o‘tmaydi (proxy tanani 10 MB gacha buferlaydi),
 * CSRF tekshiruvi shu yerda.
 *
 *   POST /api/v1/uploads   Content-Type: <fayl turi>   body: <fayl>
 *   → { url, type: 'image' | 'video' }
 */
export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeadersFor(request) })
}

const upload = route(async (request) => {
  if (!isTrustedOrigin(request)) throw new ApiError(403, 'FORBIDDEN_ORIGIN', 'Ruxsat etilmagan manba')
  const user = await requireUser()
  await rateLimit(`upload:${user.id}`, 300, 24 * 60 * 60_000)

  const declared = Number(request.headers.get('content-length') ?? 0)
  if (declared > MAX_VIDEO_BYTES) {
    throw new ApiError(413, 'FILE_TOO_LARGE', 'Fayl juda katta. Katta videoni YouTube’ga yuklab, havolasini qo‘ying')
  }

  const saved = await saveUploadStream(request.body, 'media')
  return json({ url: saved.url, type: saved.type }, { status: 201 })
})

export async function POST(request: Request, ctx: { params: Promise<Record<string, string>> }) {
  const response = await upload(request, ctx)
  for (const [k, v] of Object.entries(corsHeadersFor(request))) response.headers.set(k, v)
  return response
}
