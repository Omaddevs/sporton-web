/** CORS ro‘yxatidagi manbalar (CORS_ORIGINS) */
export function allowedOrigins() {
  return (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

/**
 * Origin so‘rov kelgan host bilan bir xilmi. Proksi (nginx, Vite) ortida ichki URL emas, mijoz
 * ko‘rgan host muhim: X-Forwarded-Host yoki Host sarlavhasi.
 */
export function isSameOrigin(origin: string, headers: Headers) {
  const host = (headers.get('x-forwarded-host') ?? headers.get('host') ?? '').split(',')[0].trim()
  try {
    return Boolean(host) && new URL(origin).host === host
  } catch {
    return false
  }
}

/** CSRF: cookie bilan keladigan o‘zgartiruvchi so‘rov o‘z domenimizdan yoki ruxsat etilgan manbadanmi */
export function isTrustedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  return isSameOrigin(origin, request.headers) || allowedOrigins().includes(origin)
}

/** Ruxsat etilgan boshqa domendan kelgan so‘rov uchun CORS sarlavhalari (proxy’dan o‘tmaydigan route’lar uchun) */
export function corsHeadersFor(request: Request): Record<string, string> {
  const origin = request.headers.get('origin')
  if (!origin || !allowedOrigins().includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
}
