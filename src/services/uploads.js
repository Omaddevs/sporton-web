import { API_URL } from './apiClient.js'
import { tr } from '../i18n/index.js'

const MAX_SIDE = 1920
const SKIP_BELOW = 300 * 1024

/**
 * Katta rasmni yuklashdan oldin brauzerda kichraytiradi (eng uzun tomoni 1920px, WebP/JPEG).
 * Telefon rasmlari 3–8 MB → odatda 200–500 KB: yuklash ham, keyin ko‘rsatish ham tezlashadi.
 * GIF (animatsiya) va kichik fayllar o‘zgarmaydi; biror xato bo‘lsa asl fayl yuboriladi.
 */
async function compressImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < SKIP_BELOW || typeof createImageBitmap !== 'function') {
    return file
  }
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close?.()
    const encode = (type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality))
    let blob = await encode('image/webp', 0.82)
    // Eski Safari WebP yoza olmaydi (PNG qaytaradi) — u holda JPEG; PNG shaffofligi uchun asl fayl
    if (blob?.type !== 'image/webp') blob = file.type === 'image/png' ? null : await encode('image/jpeg', 0.85)
    if (!blob || blob.size >= file.size) return file
    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg'
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.' + ext, { type: blob.type })
  } catch {
    return file
  }
}

/**
 * Bitta faylni (rasm/video) backendga yuklaydi. XHR — chunki fetch yuklash progressini bermaydi.
 * Qaytaradi: { promise, abort }. promise → { url, type }
 */
export function uploadMedia(file, onProgress) {
  const xhr = new XMLHttpRequest()
  let aborted = false
  const promise = compressImage(file).then((file) => new Promise((resolve, reject) => {
    if (aborted) return reject(new Error(tr('Bekor qilindi')))
    xhr.open('POST', `${API_URL}/api/v1/uploads`)
    xhr.withCredentials = true
    xhr.setRequestHeader('content-type', file.type || 'application/octet-stream')
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      let data = null
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        /* bo‘sh javob */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data)
      else {
        const error = new Error(tr(data?.error?.message ?? 'Faylni yuklab bo‘lmadi'))
        error.status = xhr.status
        reject(error)
      }
    }
    xhr.onerror = () => reject(new Error(tr('Tarmoq xatosi. Qayta urinib ko‘ring')))
    xhr.onabort = () => reject(new Error(tr('Bekor qilindi')))
    xhr.send(file)
  }))
  return {
    promise,
    abort: () => {
      aborted = true
      xhr.abort()
    },
  }
}
