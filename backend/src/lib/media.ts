import type { MediaItem } from '@/db/schema'

export type { MediaItem }

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i
const UPLOAD_URL = /^\/api\/v1\/files\/(media|submissions)\/[0-9a-f-]{36}\.(jpg|png|webp|gif|mp4|webm|mov)$/
const UPLOAD_VIDEO = /\.(mp4|webm|mov)$/
/** Saytning o‘z statik rasmlari (frontend public/images) */
const SITE_IMAGE = /^\/images\/[\w./-]+\.(jpe?g|png|webp|gif|svg)$/i

export class MediaError extends Error {}

/**
 * Foydalanuvchi qo‘ygan havolani galereya elementiga aylantiradi:
 *   YouTube (watch, youtu.be, shorts) → embed; Instagram post/reel → embed;
 *   .mp4/.webm/.mov → video; boshqa https havola → rasm.
 */
export function parseMediaLink(raw: string): MediaItem {
  let url: URL
  try {
    url = new URL(raw.trim())
  } catch {
    throw new MediaError('Havola noto‘g‘ri. To‘liq manzilni kiriting (https://…)')
  }
  if (url.protocol !== 'https:') throw new MediaError('Faqat https:// bilan boshlanadigan havolalar qabul qilinadi')

  const host = url.hostname.replace(/^(www\.|m\.)/, '')

  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
    const id =
      host === 'youtu.be'
        ? url.pathname.slice(1)
        : url.searchParams.get('v') ?? url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1]
    if (!id || !/^[\w-]{11}$/.test(id)) throw new MediaError('YouTube havolasidan video topilmadi')
    return { type: 'video', provider: 'youtube', url: `https://www.youtube.com/embed/${id}` }
  }

  if (host === 'instagram.com') {
    const match = url.pathname.match(/^\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]+)/)
    if (!match) throw new MediaError('Instagram post yoki reels havolasini kiriting')
    const kind = match[1] === 'p' ? 'p' : 'reel'
    return { type: 'video', provider: 'instagram', url: `https://www.instagram.com/${kind}/${match[2]}/embed` }
  }

  const clean = `${url.origin}${url.pathname}${url.search}`
  if (VIDEO_EXT.test(url.pathname)) return { type: 'video', provider: 'link', url: clean }
  return { type: 'image', provider: 'link', url: clean }
}

/** Mijozdan kelgan ro‘yxatni tekshiradi va normallashtiradi (soxta yoki begona URL o‘tmaydi) */
export function normalizeMedia(input: unknown, { max = 200 } = {}): MediaItem[] {
  if (!Array.isArray(input)) throw new MediaError('Media ro‘yxati noto‘g‘ri')
  if (input.length > max) throw new MediaError(`Ko‘pi bilan ${max} ta rasm/video`)
  const seen = new Set<string>()
  const out: MediaItem[] = []
  for (const raw of input) {
    const item = raw as Partial<MediaItem>
    if (!item || typeof item.url !== 'string') throw new MediaError('Media elementi noto‘g‘ri')
    let next: MediaItem
    if (item.provider === 'file' || item.url.startsWith('/api/v1/files/')) {
      if (!UPLOAD_URL.test(item.url)) throw new MediaError('Yuklangan fayl manzili noto‘g‘ri')
      next = { type: UPLOAD_VIDEO.test(item.url) ? 'video' : 'image', provider: 'file', url: item.url }
    } else if (item.url.startsWith('/')) {
      if (!SITE_IMAGE.test(item.url) || item.url.includes('..')) throw new MediaError('Rasm manzili noto‘g‘ri')
      next = { type: 'image', provider: 'link', url: item.url }
    } else {
      next = parseMediaLink(item.url)
    }
    if (!seen.has(next.url)) {
      seen.add(next.url)
      out.push(next)
    }
  }
  return out
}

export const imagesOf = (media: MediaItem[]) => media.filter((m) => m.type === 'image').map((m) => m.url)
