import 'server-only'
import { env } from './env'
import { handleTelegramUpdate, type TgUpdate } from './telegram-bot'

const state = globalThis as unknown as { __tgPolling?: boolean }

/**
 * Lokal ishlab chiqish uchun: localhost’ga webhook kelmaydi, shuning uchun yangilanishlarni
 * getUpdates bilan o‘zimiz olamiz. Faqat TELEGRAM_POLLING=1 bo‘lsa ishlaydi. Botda webhook o‘rnatilgan
 * bo‘lsa Telegram 409 qaytaradi — webhook’ni o‘zimiz o‘chirmaymiz (production buzilmasin), faqat ogohlantiramiz.
 */
export function startTelegramPolling() {
  if (!env.telegram.polling || !env.telegram.token || state.__tgPolling) return
  state.__tgPolling = true
  void loop()
  console.log('[telegram] long polling yoqildi')
}

async function loop() {
  let offset = 0
  for (;;) {
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${env.telegram.token}/getUpdates?timeout=25&offset=${offset}&allowed_updates=["message"]`,
        { signal: AbortSignal.timeout(35_000) },
      )
      const data = (await res.json()) as { ok: boolean; result?: TgUpdate[]; description?: string; error_code?: number }
      if (!data.ok) {
        console.error('[telegram] getUpdates:', data.error_code, data.description)
        await new Promise((r) => setTimeout(r, data.error_code === 409 ? 60_000 : 5_000))
        continue
      }
      for (const update of data.result ?? []) {
        offset = update.update_id + 1
        await handleTelegramUpdate(update).catch((error) => console.error('[telegram] update:', error))
      }
    } catch (error) {
      if ((error as Error)?.name !== 'TimeoutError') console.error('[telegram] polling:', error)
      await new Promise((r) => setTimeout(r, 3_000))
    }
  }
}
