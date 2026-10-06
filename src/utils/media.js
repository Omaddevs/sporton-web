/**
 * Galereya elementlari: { type: 'image' | 'video', url, provider: 'file' | 'link' | 'youtube' | 'instagram' }.
 * Mantiq backend/src/lib/media.ts bilan bir xil (server baribir qayta tekshiradi).
 */
const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i

export class MediaLinkError extends Error {}

export function parseMediaLink(raw) {
  let url
  try {
    url = new URL(String(raw).trim())
  } catch {
    throw new MediaLinkError('Havola noto‘g‘ri. To‘liq manzilni kiriting (https://…)')
  }
  if (url.protocol !== 'https:') throw new MediaLinkError('Faqat https:// bilan boshlanadigan havolalar qabul qilinadi')
  const host = url.hostname.replace(/^(www\.|m\.)/, '')

  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
    const id =
      host === 'youtu.be'
        ? url.pathname.slice(1)
        : (url.searchParams.get('v') ?? url.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1])
    if (!id || !/^[\w-]{11}$/.test(id)) throw new MediaLinkError('YouTube havolasidan video topilmadi')
    return { type: 'video', provider: 'youtube', url: `https://www.youtube.com/embed/${id}` }
  }

  if (host === 'instagram.com') {
    const match = url.pathname.match(/^\/(?:[\w.]+\/)?(p|reel|reels|tv)\/([\w-]+)/)
    if (!match) throw new MediaLinkError('Instagram post yoki reels havolasini kiriting')
    const kind = match[1] === 'p' ? 'p' : 'reel'
    return { type: 'video', provider: 'instagram', url: `https://www.instagram.com/${kind}/${match[2]}/embed` }
  }

  const clean = `${url.origin}${url.pathname}${url.search}`
  if (VIDEO_EXT.test(url.pathname)) return { type: 'video', provider: 'link', url: clean }
  return { type: 'image', provider: 'link', url: clean }
}

/** Ko‘rinish uchun kichik rasm: rasmning o‘zi yoki YouTube muqovasi; aks holda null */
export function mediaThumb(item) {
  if (item.provider === 'youtube') return `https://img.youtube.com/vi/${item.url.split('/embed/')[1]}/hqdefault.jpg`
  return item.type === 'image' ? item.url : null
}

/** Embed qilinadigan (iframe) video */
export const isEmbed = (item) => item.provider === 'youtube' || item.provider === 'instagram'

/** Tayyor (yuklangan yoki havola) elementlar — serverga yuboriladi */
export const readyMedia = (items) =>
  items.filter((i) => !i.error && i.progress == null).map(({ type, url, provider }) => ({ type, url, provider }))

export const isUploading = (items) => items.some((i) => i.progress != null && !i.error)
