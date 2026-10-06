import { API_URL } from './apiClient.js'

/**
 * Bitta faylni (rasm/video) backendga yuklaydi. XHR — chunki fetch yuklash progressini bermaydi.
 * Qaytaradi: { promise, abort }. promise → { url, type }
 */
export function uploadMedia(file, onProgress) {
  const xhr = new XMLHttpRequest()
  const promise = new Promise((resolve, reject) => {
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
        const error = new Error(data?.error?.message ?? 'Faylni yuklab bo‘lmadi')
        error.status = xhr.status
        reject(error)
      }
    }
    xhr.onerror = () => reject(new Error('Tarmoq xatosi. Qayta urinib ko‘ring'))
    xhr.onabort = () => reject(new Error('Bekor qilindi'))
    xhr.send(file)
  })
  return { promise, abort: () => xhr.abort() }
}
