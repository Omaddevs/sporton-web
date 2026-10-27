import { api, ApiError } from './apiClient.js'
import { toLocalDigits } from '../utils/phone.js'

/**
 * Autentifikatsiya API (backend: /api/v1/auth/*). Sahifalar va AuthContext shu interfeys orqali ishlaydi.
 *
 * Ro‘yxatdan o‘tish oqimi:
 *   1. startRegistration(phone) → server raqam bo‘shligini tekshiradi
 *   2. Foydalanuvchi Telegram botga aynan shu raqamni kontakt sifatida yuboradi → bot 6 xonali kod beradi
 *   3. register({ ...form, code }) → kod tekshiriladi, hisob yaratiladi va sessiya ochiladi
 *
 * Parolni tiklash oqimi:
 *   1. requestResetCode(phone)  → server raqam bazada borligini tekshiradi
 *   2. Foydalanuvchi Telegram botga raqamini yuboradi → bot 6 xonali kod beradi
 *   3. verifyResetCode(phone, code) → server kodni tekshirib, vaqtinchalik resetToken qaytaradi
 *   4. resetPassword(resetToken, password)
 */

export const TELEGRAM_BOT = import.meta.env.VITE_TELEGRAM_BOT || 'sporton_kirish_bot'
export const TELEGRAM_BOT_URL = `https://t.me/${TELEGRAM_BOT}?start=reset`
export const TELEGRAM_REGISTER_URL = `https://t.me/${TELEGRAM_BOT}?start=reg`
export const CODE_LENGTH = 6
export const RESEND_SECONDS = 60
export const MIN_PASSWORD = 8

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const TELEGRAM_BOT_ID = import.meta.env.VITE_TELEGRAM_BOT_ID || ''

export { ApiError as AuthError }

// Dev rejimda (bot ulanmagan) server kodni javobda qaytaradi — sinash uchun ko‘rsatamiz
const devCodes = new Map()

export async function fetchMe() {
  const { user } = await api('/auth/me')
  return user
}

export async function login({ phone, password }) {
  const { user } = await api('/auth/login', { method: 'POST', body: { phone: toLocalDigits(phone), password } })
  return user
}

export async function startRegistration(phone) {
  const digits = toLocalDigits(phone)
  const result = await api('/auth/register/start', { method: 'POST', body: { phone: digits } })
  if (result.devCode) devCodes.set(digits, result.devCode)
  return result
}

export async function register({ firstName, lastName, phone, password, consent, code }) {
  const { user } = await api('/auth/register', {
    method: 'POST',
    body: { firstName, lastName, phone: toLocalDigits(phone), password, consent: Boolean(consent), code },
  })
  return user
}

export async function logout() {
  await api('/auth/logout', { method: 'POST' }).catch(() => null)
}

export async function updateProfile(patch) {
  const { user } = await api('/auth/me', { method: 'PATCH', body: patch })
  return user
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`)
    if (existing?.dataset.loaded) return resolve()
    const script = existing ?? document.createElement('script')
    script.src = src
    script.async = true
    script.addEventListener('load', () => {
      script.dataset.loaded = '1'
      resolve()
    })
    script.addEventListener('error', () => reject(new ApiError('SCRIPT', 'Tashqi xizmat yuklanmadi. Keyinroq urinib ko‘ring')))
    if (!existing) document.head.appendChild(script)
  })
}

async function googleCredential() {
  await loadScript('https://accounts.google.com/gsi/client')
  return new Promise((resolve, reject) => {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (res) => (res.credential ? resolve(res.credential) : reject(new ApiError('CANCELLED', 'Kirish bekor qilindi'))),
      cancel_on_tap_outside: true,
    })
    window.google.accounts.id.prompt((note) => {
      if (note.isNotDisplayed?.() || note.isSkippedMoment?.()) {
        reject(new ApiError('CANCELLED', 'Google oynasi ochilmadi. Brauzerda Google hisobingizga kiring va qayta urinib ko‘ring'))
      }
    })
  })
}

async function telegramAuthData() {
  await loadScript('https://telegram.org/js/telegram-widget.js?22')
  return new Promise((resolve, reject) => {
    window.Telegram.Login.auth({ bot_id: TELEGRAM_BOT_ID, request_access: 'write' }, (data) =>
      data ? resolve(data) : reject(new ApiError('CANCELLED', 'Kirish bekor qilindi')),
    )
  })
}

/** Google / Telegram orqali kirish: provayder tokenini olib, backendda tekshiramiz */
export async function loginWithProvider(provider) {
  if (provider === 'google') {
    if (!GOOGLE_CLIENT_ID) throw new ApiError('PROVIDER_DISABLED', 'Google orqali kirish tez orada ishga tushadi')
    const credential = await googleCredential()
    return (await api('/auth/google', { method: 'POST', body: { credential } })).user
  }
  if (provider === 'telegram') {
    if (!TELEGRAM_BOT_ID) throw new ApiError('PROVIDER_DISABLED', 'Telegram orqali kirish tez orada ishga tushadi')
    const data = await telegramAuthData()
    return (await api('/auth/telegram', { method: 'POST', body: data })).user
  }
  throw new ApiError('PROVIDER_UNSUPPORTED', 'Bu usul qo‘llab-quvvatlanmaydi')
}

export async function requestResetCode(phone) {
  const digits = toLocalDigits(phone)
  const result = await api('/auth/reset/request', { method: 'POST', body: { phone: digits } })
  if (result.devCode) devCodes.set(digits, result.devCode)
  return result
}

export async function verifyResetCode(phone, code) {
  return api('/auth/reset/verify', { method: 'POST', body: { phone: toLocalDigits(phone), code } })
}

export async function resetPassword(resetToken, password) {
  await api('/auth/reset/confirm', { method: 'POST', body: { resetToken, password } })
}

export async function changePassword({ currentPassword, newPassword }) {
  await api('/auth/password', { method: 'POST', body: { currentPassword, newPassword } })
}

/** Boshqa barcha qurilmalardagi sessiyalarni bekor qiladi (joriy qurilma ochiq qoladi) */
export async function logoutAll() {
  await api('/auth/logout-all', { method: 'POST' })
}

export async function deleteAccount() {
  await api('/auth/me', { method: 'DELETE' })
}

/** Faqat dev rejimda: botsiz sinash uchun server qaytargan kod */
export function peekDevCode(phone) {
  if (!import.meta.env.DEV) return null
  return devCodes.get(toLocalDigits(phone)) ?? null
}
