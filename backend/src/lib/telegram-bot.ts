import 'server-only'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { users } from '@/db/schema'
import { toLocalDigits } from './phone'
import { issueRegisterCode } from './phone-verification'
import { issueResetCode } from './reset'
import { sendTelegram } from './telegram'

export type TgMessage = {
  chat: { id: number; type: string }
  from?: { id: number }
  text?: string
  contact?: { phone_number: string; user_id?: number }
}

export type TgUpdate = { update_id: number; message?: TgMessage }

type Intent = 'register' | 'reset' | 'link'

const CONTACT_KEYBOARD = {
  keyboard: [[{ text: '📱 Raqamni yuborish', request_contact: true }]],
  resize_keyboard: true,
  one_time_keyboard: true,
}
const NO_KEYBOARD = { remove_keyboard: true }

// Chat qaysi maqsadda boshlangan: /start reg — ro‘yxatdan o‘tish, /start reset — parol, boshqasi — ulash
const intents = ((globalThis as unknown as { __tgIntents?: Map<number, Intent> }).__tgIntents ??= new Map())

const START_TEXT: Record<Intent, string> = {
  register:
    'Assalomu alaykum! SportON’da ro‘yxatdan o‘tish uchun pastdagi tugma orqali telefon raqamingizni yuboring — tasdiqlash kodini beraman.',
  reset: 'Assalomu alaykum! Parolni tiklash kodi uchun pastdagi tugma orqali telefon raqamingizni yuboring.',
  link: 'Assalomu alaykum! SportON bildirishnomalarini shu yerda olish uchun pastdagi tugma orqali telefon raqamingizni yuboring.',
}

/** Webhook va (dev’da) long polling uchun umumiy ishlovchi */
export async function handleTelegramUpdate(update: TgUpdate | null) {
  const message = update?.message
  if (!message || message.chat.type !== 'private') return
  const chatId = message.chat.id

  if (message.contact) {
    // Faqat o‘z raqamini yuborishi mumkin — boshqa odamning kontakti qabul qilinmaydi
    if (message.contact.user_id !== message.from?.id) {
      await sendTelegram(chatId, 'Iltimos, pastdagi tugma orqali o‘zingizning raqamingizni yuboring.', { replyMarkup: CONTACT_KEYBOARD })
      return
    }
    await handleContact(chatId, toLocalDigits(message.contact.phone_number))
    return
  }

  const text = message.text?.trim() ?? ''
  if (text === '/stop') {
    const db = await getDb()
    await db.update(users).set({ telegramChatId: null }).where(eq(users.telegramChatId, String(chatId)))
    await sendTelegram(chatId, 'Bildirishnomalar o‘chirildi. Qayta ulash uchun: /start', { replyMarkup: NO_KEYBOARD })
    return
  }
  const payload = text.startsWith('/start') ? text.slice(6).trim() : ''
  const intent: Intent = payload === 'reg' ? 'register' : payload === 'reset' ? 'reset' : 'link'
  intents.set(chatId, intent)
  await sendTelegram(chatId, START_TEXT[intent], { replyMarkup: CONTACT_KEYBOARD })
}

async function handleContact(chatId: number, phone: string) {
  const intent = intents.get(chatId)
  intents.delete(chatId)
  const db = await getDb()
  const [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1)

  // Hisob yo‘q — demak ro‘yxatdan o‘tmoqda: kod faqat shu (Telegram’dagi) raqamga beriladi
  if (!user) {
    const code = await issueRegisterCode(phone, String(chatId))
    await sendTelegram(
      chatId,
      `SportON ro‘yxatdan o‘tish kodi: ${code}\n\nKodni saytdagi formaga kiriting. Kod 5 daqiqa amal qiladi va faqat +998 ${phone} raqami uchun. Uni hech kimga bermang.`,
      { replyMarkup: NO_KEYBOARD },
    )
    return
  }

  if (user.status !== 'active') {
    await sendTelegram(chatId, 'Bu raqamdagi hisob bloklangan. Qo‘llab-quvvatlash xizmatiga yozing.', { replyMarkup: NO_KEYBOARD })
    return
  }
  await db
    .update(users)
    .set({ telegramChatId: String(chatId), phoneVerifiedAt: user.phoneVerifiedAt ?? new Date() })
    .where(eq(users.id, user.id))

  if (intent === 'register') {
    await sendTelegram(
      chatId,
      `${user.firstName}, bu raqam SportON’da allaqachon ro‘yxatdan o‘tgan. Saytda «Kirish» orqali kiring. Parolni unutgan bo‘lsangiz — «Parolni tiklash».`,
      { replyMarkup: NO_KEYBOARD },
    )
    return
  }
  if (intent === 'reset') {
    const code = await issueResetCode(user.id)
    await sendTelegram(
      chatId,
      `Parolni tiklash kodi: ${code}\n\nKod 5 daqiqa amal qiladi. Uni hech kimga, hatto SportON xodimlariga ham bermang.`,
      { replyMarkup: NO_KEYBOARD },
    )
    return
  }
  await sendTelegram(
    chatId,
    `✅ ${user.firstName}, Telegram hisobingizga ulandi.\nEndi bron holati, eslatmalar va muhim xabarlar shu yerga keladi.\n\nUzish uchun: /stop`,
    { replyMarkup: NO_KEYBOARD },
  )
}
