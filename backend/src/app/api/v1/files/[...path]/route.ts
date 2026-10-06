import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { MIME_BY_EXT, uploadRoot } from '@/lib/uploads'

const notFound = () => new Response('Not found', { status: 404 })

/** Yuklangan fayllar. Videolar uchun Range (qismlab o‘qish) — Safari va seek uchun shart. */
export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path
  const root = uploadRoot()
  const target = path.resolve(/*turbopackIgnore: true*/ root, ...parts)
  // Katalogdan tashqariga chiqishga yo‘l qo‘yilmaydi (../)
  if (!target.startsWith(root + path.sep)) return notFound()
  const mime = MIME_BY_EXT[path.extname(target).slice(1).toLowerCase()]
  if (!mime) return notFound()

  let size: number
  try {
    const info = await stat(target)
    if (!info.isFile()) return notFound()
    size = info.size
  } catch {
    return notFound()
  }

  const headers: Record<string, string> = {
    'content-type': mime,
    'accept-ranges': 'bytes',
    'cache-control': 'public, max-age=31536000, immutable',
    'x-content-type-options': 'nosniff',
  }

  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '')
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : size - Number(range[2])
    let end = range[1] && range[2] ? Number(range[2]) : size - 1
    start = Math.max(0, start)
    end = Math.min(end, size - 1)
    if (start > end) {
      return new Response(null, { status: 416, headers: { 'content-range': `bytes */${size}` } })
    }
    const stream = Readable.toWeb(createReadStream(target, { start, end })) as ReadableStream
    return new Response(stream, {
      status: 206,
      headers: { ...headers, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': String(end - start + 1) },
    })
  }

  const stream = Readable.toWeb(createReadStream(target)) as ReadableStream
  return new Response(stream, { headers: { ...headers, 'content-length': String(size) } })
}
