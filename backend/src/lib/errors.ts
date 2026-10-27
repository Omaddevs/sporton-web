import 'server-only'
import { createHash } from 'node:crypto'
import { getDb } from '@/db'
import { errorEvents } from '@/db/schema'
import { notifyAdmins } from './telegram'

type ErrorInput = {
  source: 'api' | 'client'
  message: string
  stack?: string | null
  url?: string | null
  userAgent?: string | null
  userId?: string | null
}

// Bir xil xato bo‘yicha adminlarga 15 daqiqada bir martadan ko‘p yozmaymiz
const ALERT_EVERY_MS = 15 * 60_000
const alerted = ((globalThis as unknown as { __sportonAlerted?: Map<string, number> }).__sportonAlerted ??= new Map())

/**
 * Xatolar jurnali (admin → «Xatolar»): server 500 lari va brauzerdagi JS xatolari.
 * Hech qachon o‘zi xato tashlamaydi — monitoring asosiy so‘rovni buzmasin.
 */
export async function recordError(input: ErrorInput) {
  try {
    const message = input.message.slice(0, 1000) || 'Noma’lum xato'
    const db = await getDb()
    await db.insert(errorEvents).values({
      source: input.source,
      message,
      stack: input.stack?.slice(0, 8000) ?? null,
      url: input.url?.slice(0, 1000) ?? null,
      userAgent: input.userAgent?.slice(0, 500) ?? null,
      userId: input.userId ?? null,
    })

    const key = createHash('sha1').update(`${input.source}:${message}`).digest('hex')
    const last = alerted.get(key) ?? 0
    if (Date.now() - last > ALERT_EVERY_MS) {
      alerted.set(key, Date.now())
      notifyAdmins(input.source === 'api' ? '⚠️ Server xatosi' : '⚠️ Saytda JS xatosi', [message, input.url])
    }
  } catch (error) {
    console.error('[errors] yozib bo‘lmadi', error)
  }
}
