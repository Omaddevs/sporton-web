import 'server-only'
import { env } from './env'

type SendOptions = { replyMarkup?: unknown; parseMode?: 'HTML' }

export const telegramEnabled = () => Boolean(env.telegram.token)

export async function sendTelegram(chatId: string | number, text: string, options: SendOptions = {}) {
  if (!env.telegram.token) return false
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.telegram.token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options.parseMode,
        reply_markup: options.replyMarkup,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    })
    return res.ok
  } catch (error) {
    console.error('[telegram]', error)
    return false
  }
}

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Adminlar chatiga xabar (bron, ariza, murojaat). Sozlanmagan bo‘lsa jim o‘tadi. */
export function notifyAdmins(title: string, lines: Array<string | null | undefined>) {
  if (!env.telegram.adminChatId) return
  const body = [`<b>${escapeHtml(title)}</b>`, ...lines.filter(Boolean).map((l) => escapeHtml(l!))].join('\n')
  void sendTelegram(env.telegram.adminChatId, body, { parseMode: 'HTML' })
}
