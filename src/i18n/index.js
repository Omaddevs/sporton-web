import ru from './ru.js'

/**
 * Ikki til: o‘zbek (asosiy, matnlar kodda shu tilda) va rus. tr('O‘zbekcha matn') rus tili tanlansa
 * lug‘atdan (ru.js) tarjimani qaytaradi, topilmasa — asl matnni. Til almashganda sahifa qayta
 * yuklanadi: shunda modul darajasidagi ro‘yxatlar (menyu, filtrlar) ham tarjima bo‘ladi.
 */
const STORAGE_KEY = 'sporton-lang'
export const LANGUAGES = [
  { id: 'uz', label: 'O‘zbekcha', short: 'UZ' },
  { id: 'ru', label: 'Русский', short: 'RU' },
]

function detect() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'uz' || saved === 'ru') return saved
  } catch {
    /* ignore */
  }
  return 'uz'
}

export const lang = typeof window === 'undefined' ? 'uz' : detect()

if (typeof document !== 'undefined') document.documentElement.lang = lang

// Lug‘at kalitlari apostrof variantlariga bog‘liq bo‘lmasin: ‘ ’ ʻ ʼ ' → bir xil
const normalize = (text) => text.replace(/[‘’ʻʼ`']/g, "'").replace(/\s+/g, ' ').trim()
const dictionary = new Map(Object.entries(ru).map(([uz, translated]) => [normalize(uz), translated]))

const fill = (text, vars) => (vars ? text.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : text)

/**
 * Tarjima: tr('Saqlash'), o‘zgaruvchi bilan — tr('{n} ta joy qoldi', { n: 5 }).
 * Nomi «tr» — komponentlarda ko‘p uchraydigan (t) => … parametrlari bilan to‘qnashmasin.
 */
export function tr(text, vars) {
  if (typeof text !== 'string' || !text) return text
  if (lang === 'uz') return fill(text, vars)
  return fill(dictionary.get(normalize(text)) ?? text, vars)
}

export function setLang(next) {
  if (next === lang) return
  try {
    window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    /* ignore */
  }
  window.location.reload()
}

/** Sana va sonlar uchun locale */
export const locale = lang === 'ru' ? 'ru-RU' : 'uz-UZ'
