/** O‘zbekiston telefon raqamlari: +998 XX XXX XX XX */

export const PHONE_PREFIX = '+998'
const LOCAL_LENGTH = 9

/** Kiritilgan matndan faqat mahalliy 9 ta raqamni ajratadi (998 prefiksi bo‘lsa olib tashlanadi) */
export function toLocalDigits(value = '') {
  let digits = String(value).replace(/\D/g, '')
  if (digits.length > LOCAL_LENGTH && digits.startsWith('998')) digits = digits.slice(3)
  return digits.slice(0, LOCAL_LENGTH)
}

/** "901234567" → "90 123 45 67" */
export function formatLocal(digits = '') {
  const d = toLocalDigits(digits)
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ')
}

/** "901234567" → "+998 90 123 45 67" */
export function formatPhone(digits = '') {
  return `${PHONE_PREFIX} ${formatLocal(digits)}`.trim()
}

/** Ekranda ko‘rsatish uchun yashirilgan ko‘rinish: "+998 90 *** ** 67" */
export function maskPhone(digits = '') {
  const d = toLocalDigits(digits)
  return `${PHONE_PREFIX} ${d.slice(0, 2)} *** ** ${d.slice(7, 9)}`
}

export function isValidPhone(digits = '') {
  return toLocalDigits(digits).length === LOCAL_LENGTH
}
