import { timingSafeEqual } from 'node:crypto'
import { env } from '@/lib/env'
import { handleTelegramUpdate, type TgUpdate } from '@/lib/telegram-bot'

function validSecret(header: string | null) {
  const secret = env.telegram.webhookSecret
  if (!secret) return !env.isProd
  if (!header || header.length !== secret.length) return false
  return timingSafeEqual(Buffer.from(header), Buffer.from(secret))
}

/**
 * Telegram bot webhook (production). setWebhook:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<api-domen>/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
 * Lokal ishlab chiqishda webhook o‘rniga TELEGRAM_POLLING=1 (src/lib/telegram-polling.ts).
 */
export async function POST(request: Request) {
  if (!validSecret(request.headers.get('x-telegram-bot-api-secret-token'))) {
    return new Response('forbidden', { status: 403 })
  }
  try {
    await handleTelegramUpdate((await request.json().catch(() => null)) as TgUpdate | null)
  } catch (error) {
    console.error('[telegram-webhook]', error)
  }
  return Response.json({ ok: true })
}
