import { NextResponse, type NextRequest } from 'next/server'
import { allowedOrigins as readAllowedOrigins, isSameOrigin } from './lib/origin'

const SESSION_COOKIE = 'sporton_session'
const allowedOrigins = readAllowedOrigins()

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/v1/')) {
    const origin = request.headers.get('origin')
    const sameOrigin = !origin || isSameOrigin(origin, request.headers)
    const allowed = Boolean(origin) && allowedOrigins.includes(origin!)

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: allowed ? corsHeaders(origin!) : {} })
    }
    // CSRF: cookie bilan yuboriladigan o‘zgartiruvchi so‘rovlar faqat ruxsat etilgan manbadan
    if (!SAFE_METHODS.has(request.method) && !sameOrigin && !allowed) {
      return NextResponse.json({ error: { code: 'FORBIDDEN_ORIGIN', message: 'Ruxsat etilmagan manba' } }, { status: 403 })
    }
    const response = NextResponse.next()
    if (allowed) for (const [k, v] of Object.entries(corsHeaders(origin!))) response.headers.set(k, v)
    return response
  }

  // Admin: sessiya cookie bo‘lmasa darhol login sahifasiga (to‘liq tekshiruv layout’da)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !request.cookies.has(SESSION_COOKIE)) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  // /api/v1/uploads — proxy’dan o‘tmaydi: proxy tanani 10 MB gacha buferlaydi (katta videolar kesiladi).
  // Uning CSRF tekshiruvi route’ning o‘zida.
  matcher: ['/api/v1/((?!uploads).*)', '/admin/:path*'],
}
