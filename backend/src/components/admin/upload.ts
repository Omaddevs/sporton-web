'use client'

/** Admin paneldan bitta faylni /api/v1/uploads ga yuklash (progress bilan) */
export function uploadBlob(file: Blob, onProgress?: (percent: number) => void) {
  return new Promise<{ url: string; type: 'image' | 'video' }>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/v1/uploads')
    xhr.withCredentials = true
    xhr.setRequestHeader('content-type', file.type || 'application/octet-stream')
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100))
    xhr.onload = () => {
      let data: { url?: string; type?: 'image' | 'video'; error?: { message?: string } } = {}
      try {
        data = JSON.parse(xhr.responseText || '{}')
      } catch {
        /* bo‘sh javob */
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve({ url: data.url, type: data.type ?? 'image' })
      else reject(new Error(data.error?.message ?? 'Yuklab bo‘lmadi'))
    }
    xhr.onerror = () => reject(new Error('Tarmoq xatosi'))
    xhr.send(file)
  })
}
