import { metaHtml, pageMeta } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/**
 * Ijtimoiy tarmoq va qidiruv botlari uchun sahifa meta teglari (Telegram, Facebook, Google …).
 * nginx bot User-Agent’ini aniqlab, SPA o‘rniga shu manzilga yo‘naltiradi: /api/v1/seo?path=/sport-majmua/olimpiya
 * ?format=json — frontend useSeo uchun emas, test/diagnostika uchun.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') || '/'
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('bad path', { status: 400 })
  const meta = await pageMeta(path)
  if (url.searchParams.get('format') === 'json') return Response.json(meta)
  return new Response(metaHtml(meta), {
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=600' },
  })
}
