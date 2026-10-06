const LOCAL_LENGTH = 9

/** Kiritilgan matndan mahalliy 9 ta raqam: "+998 90 123-45-67" → "901234567" */
export function toLocalDigits(value: unknown = '') {
  let digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length > LOCAL_LENGTH && digits.startsWith('998')) digits = digits.slice(3)
  return digits.slice(0, LOCAL_LENGTH)
}

export function isValidLocalPhone(digits: string) {
  return /^\d{9}$/.test(digits)
}

/** "901234567" → "+998 90 123 45 67" */
export function formatPhone(value: string | null | undefined) {
  const d = toLocalDigits(value ?? '')
  if (!d) return ''
  return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`.trim()
}
