import { tr } from '../i18n/index.js'

/**
 * Backend (Next.js, /backend) bilan aloqa. Dev’da Vite /api ni localhost:3001 ga proksilaydi,
 * production’da VITE_API_URL (bo‘sh bo‘lsa — shu domen) ishlatiladi. Sessiya httpOnly cookie’da.
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(code, message, field, status) {
    super(message)
    this.code = code
    this.field = field
    this.status = status
  }
}

const NETWORK_ERROR = 'Server bilan aloqa yo‘q. Internetni tekshirib, qayta urinib ko‘ring'

export async function api(path, { method = 'GET', body, form, signal, timeout = 15000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  signal?.addEventListener('abort', () => controller.abort())

  let response
  try {
    response = await fetch(`${API_URL}/api/v1${path}`, {
      method,
      credentials: 'include',
      signal: controller.signal,
      headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiError('NETWORK', tr(NETWORK_ERROR), undefined, 0)
  } finally {
    clearTimeout(timer)
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const err = data?.error
    // Backend xabarlari o‘zbekcha — rus tilida lug‘atdan tarjima qilinadi (topilmasa asl matn)
    throw new ApiError(err?.code ?? 'HTTP_ERROR', tr(err?.message ?? NETWORK_ERROR), err?.field, response.status)
  }
  return data
}
