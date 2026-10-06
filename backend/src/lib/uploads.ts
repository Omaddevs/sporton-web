import 'server-only'
import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { mkdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'
import { env } from './env'
import { ApiError } from './http'

const MB = 1024 * 1024
export const MAX_IMAGE_BYTES = Number(process.env.MAX_IMAGE_MB || 15) * MB
export const MAX_VIDEO_BYTES = Number(process.env.MAX_VIDEO_MB || 200) * MB

type Kind = { ext: string; mime: string; type: 'image' | 'video' }

const ascii = (b: Buffer, from: number, to: number) => b.subarray(from, to).toString('latin1')

/** Fayl turini kengaytma emas, tarkibning birinchi baytlari bo‘yicha aniqlaymiz */
function detect(head: Buffer): Kind | 'heic' | null {
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg', type: 'image' }
  if (head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { ext: 'png', mime: 'image/png', type: 'image' }
  if (ascii(head, 0, 4) === 'RIFF' && ascii(head, 8, 12) === 'WEBP') return { ext: 'webp', mime: 'image/webp', type: 'image' }
  if (ascii(head, 0, 6) === 'GIF87a' || ascii(head, 0, 6) === 'GIF89a') return { ext: 'gif', mime: 'image/gif', type: 'image' }
  if (head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3)
    return { ext: 'webm', mime: 'video/webm', type: 'video' }
  if (ascii(head, 4, 8) === 'ftyp') {
    const brand = ascii(head, 8, 12)
    if (['heic', 'heix', 'heim', 'heis', 'mif1', 'msf1'].includes(brand)) return 'heic'
    if (brand === 'qt  ') return { ext: 'mov', mime: 'video/quicktime', type: 'video' }
    return { ext: 'mp4', mime: 'video/mp4', type: 'video' }
  }
  return null
}

export const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
}

export const uploadRoot = () => path.resolve(/*turbopackIgnore: true*/ process.cwd(), env.uploadDir)

/**
 * So‘rov tanasini (xom fayl baytlari) to‘g‘ridan-to‘g‘ri diskka oqim bilan yozadi — katta
 * videolar ham xotiraga to‘liq yuklanmaydi. Hajm chegarasi oshsa yozish to‘xtatiladi.
 */
export async function saveUploadStream(body: ReadableStream<Uint8Array> | null, folder: string) {
  if (!body) throw new ApiError(400, 'EMPTY', 'Fayl yuborilmadi')
  const safeFolder = folder.replace(/[^a-z0-9-]/gi, '')
  const dir = path.join(/*turbopackIgnore: true*/ uploadRoot(), safeFolder)
  await mkdir(dir, { recursive: true })
  const id = randomUUID()
  const tmp = path.join(/*turbopackIgnore: true*/ dir, `${id}.part`)

  const reader = body.getReader()
  const out = createWriteStream(tmp)
  let head = Buffer.alloc(0)
  let kind: Kind | null = null
  let size = 0

  const write = (chunk: Buffer) =>
    new Promise<void>((resolve, reject) => out.write(chunk, (error) => (error ? reject(error) : resolve())))

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      const chunk = Buffer.from(value)
      size += chunk.length

      if (!kind) {
        head = Buffer.concat([head, chunk])
        if (head.length < 16) continue
        const detected = detect(head)
        if (detected === 'heic') {
          throw new ApiError(415, 'HEIC', 'HEIC formati qo‘llab-quvvatlanmaydi. Rasmni JPG yoki PNG qilib yuklang')
        }
        if (!detected) throw new ApiError(415, 'FILE_TYPE', 'Faqat rasm (JPG, PNG, WEBP, GIF) yoki video (MP4, MOV, WEBM) yuklang')
        kind = detected
        await write(head)
      } else {
        await write(chunk)
      }

      const limit = kind.type === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
      if (size > limit) {
        throw new ApiError(
          413,
          'FILE_TOO_LARGE',
          kind.type === 'video'
            ? `Video hajmi ${Math.round(MAX_VIDEO_BYTES / MB)} MB dan oshmasin. Kattaroq videoni YouTube’ga yuklab, havolasini qo‘ying`
            : `Rasm hajmi ${Math.round(MAX_IMAGE_BYTES / MB)} MB dan oshmasin`,
        )
      }
    }
    if (!kind) {
      const detected = head.length >= 12 ? detect(head) : null
      if (!detected || detected === 'heic') throw new ApiError(415, 'FILE_TYPE', 'Fayl turi qo‘llab-quvvatlanmaydi')
      kind = detected
      await write(head)
    }
    await new Promise<void>((resolve, reject) => out.end((error?: Error | null) => (error ? reject(error) : resolve())))
    const name = `${id}.${kind.ext}`
    await rename(tmp, path.join(/*turbopackIgnore: true*/ dir, name))
    return { url: `/api/v1/files/${safeFolder}/${name}`, type: kind.type, mime: kind.mime, size }
  } catch (error) {
    out.destroy()
    await reader.cancel().catch(() => null)
    await rm(tmp, { force: true })
    throw error
  }
}
