import { timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import { env } from '@/lib/env'
import { toLocalDigits } from '@/lib/phone'
import { issueResetCode } from '@/lib/reset'
import { sendTelegram } from '@/lib/telegram'

type TgMessage = {
  chat: { id: number; type: string }
  from?: { id: number }
  text?: string
  contact?: { phone_number: string; user_id?: number }
}

const CONTACT_KEYBOARD = {
  keyboard: [[{ text: '📱 Raqamni yuborish', request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
}

// Chat qaysi maqsadda boshlangan: /start reset — parol kodi, boshqasi — hisobni ulash
const intents = ((globalThis as unknown as { __tgIntents?: Map<number, 'reset' | 'link'> }).__tgIntents ??= new Map())

function validSecret(header: string | null) {
  const secret = env.telegram.webhookSecret
  if (!secret) return !env.isProd
  if (!header || header.length !== secret.length) return false
  return timingSafeEqual(Buffer.from(header), Buffer.from(secret))
}

/**
 * Telegram bot webhook. setWebhook:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<api-domen>/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>
 */
export async function POST(request: Request) {
  if (!validSecret(request.headers.get('x-telegram-bot-api-secret-token'))) {
    return new Response('forbidden', { status: 403 })
  }
  const update = (await request.json().catch(() => null)) as { message?: TgMessage } | null
  const message = update?.message
  if (!message || message.chat.type !== 'private') return Response.json({ ok: true })
  const chatId = message.chat.id

  try {
    if (message.contact) {
      // Faqat o‘z raqamini yuborishi mumkin — boshqa odamning kontakti qabul qilinmaydi
      if (message.contact.user_id !== message.from?.id) {
        await sendTelegram(chatId, 'Iltimos, pastdagi tugma orqali o‘zingizning raqamingizni yuboring.', { replyMarkup: CONTACT_KEYBOARD })
        return Response.json({ ok: true })
      }
      const phone = toLocalDigits(message.contact.phone_number)
      const db = await getDb()
      const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1)
      if (!user || user.status !== 'active') {
        await sendTelegram(chatId, 'Bu raqam bilan SportON’da hisob topilmadi. Avval saytda ro‘yxatdan o‘ting.', { replyMarkup: { remove_keyboard: true } })
        return Response.json({ ok: true })
      }
      await db.update(users).set({ telegramChatId: String(chatId) }).where(eq(users.id, user.id))
      if (intents.get(chatId) !== 'reset') {
        intents.delete(chatId)
        await sendTelegram(
          chatId,
          `✅ ${user.firstName}, Telegram hisobingizga ulandi.\nEndi bron holati, eslatmalar va muhim xabarlar shu yerga keladi.\n\nUzish uchun: /stop`,
          { replyMarkup: { remove_keyboard: true } },
        )
        return Response.json({ ok: true })
      }
      intents.delete(chatId)
      const code = await issueResetCode(user.id)
      await sendTelegram(
        chatId,
        `Parolni tiklash kodi: ${code}\n\nKod 5 daqiqa amal qiladi. Uni hech kimga, hatto SportON xodimlariga ham bermang.`,
        { replyMarkup: { remove_keyboard: true } },
      )
      return Response.json({ ok: true })
    }

    const text = message.text?.trim() ?? ''
    if (text === '/stop') {
      const db = await getDb()
      await db.update(users).set({ telegramChatId: null }).where(eq(users.telegramChatId, String(chatId)))
      await sendTelegram(chatId, 'Bildirishnomalar o‘chirildi. Qayta ulash uchun: /start', { replyMarkup: { remove_keyboard: true } })
      return Response.json({ ok: true })
    }
    const reset = text.startsWith('/start') && text.includes('reset')
    intents.set(chatId, reset ? 'reset' : 'link')
    await sendTelegram(
      chatId,
      reset
        ? 'Assalomu alaykum! Parolni tiklash kodi uchun pastdagi tugma orqali telefon raqamingizni yuboring.'
        : 'Assalomu alaykum! SportON bildirishnomalarini shu yerda olish uchun pastdagi tugma orqali telefon raqamingizni yuboring.',
      { replyMarkup: CONTACT_KEYBOARD },
    )
  } catch (error) {
    console.error('[telegram-webhook]', error)
  }
  return Response.json({ ok: true })
}
