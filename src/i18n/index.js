import ru from './ru.js'
import ruContent from './ru-content.js'

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
// ru.js — interfeys matnlari, ru-content.js — sahifa kontenti (bloglar, musobaqalar, ma’lumot sahifalari)
const dictionary = new Map(
  [...Object.entries(ru), ...Object.entries(ruContent)].map(([uz, translated]) => [normalize(uz), translated]),
)

const fill = (text, vars) => (vars ? text.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`)) : text)

const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']
const RU_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

/** Oy nomi (0–11): uz — «oktabr», ru — «октября» (sana ichida) */
export const monthName = (index) => (lang === 'ru' ? RU_MONTHS : UZ_MONTHS)[index]

/** Kun va oy: uz — «3-oktabr», ru — «3 октября» */
export const formatDayMonth = (day, monthIndex) =>
  lang === 'ru' ? `${day} ${RU_MONTHS[monthIndex]}` : `${day}-${UZ_MONTHS[monthIndex]}`

// Lug‘atda yo‘q, lekin qolipga tushadigan matnlar (ma’lumotlardagi sana va narxlar)
const DATE_RE = new RegExp(`(\\d{1,2})-(${UZ_MONTHS.join('|')})\\b`, 'gi')
const PRICE_UNITS = [
  [/so[‘’ʻʼ`']mdan/g, 'сум и выше'],
  [/so[‘’ʻʼ`']m/g, 'сум'],
  [/\bmln\b/g, 'млн'],
  [/\bming\b/g, 'тыс.'],
  [/\/\s*soat\b/g, '/ час'],
  [/\/\s*oy\b/g, '/ мес'],
  [/\/\s*dars\b/g, '/ занятие'],
  [/\/\s*seans\b/g, '/ сеанс'],
  [/\/\s*jamoa\b/g, '/ команда'],
  [/\/\s*kishi\b/g, '/ чел.'],
  [/\/\s*kun\b/g, '/ день'],
]

function byPattern(text) {
  let out = text
  if (DATE_RE.test(out)) {
    DATE_RE.lastIndex = 0
    out = out.replace(DATE_RE, (_, d, m) => `${d} ${RU_MONTHS[UZ_MONTHS.indexOf(m.toLowerCase())]}`)
  }
  if (/so[‘’ʻʼ`']m/.test(out)) {
    for (const [re, ru] of PRICE_UNITS) out = out.replace(re, ru)
    // «Kubok va 10 000 000 so‘m» kabi qo‘shimcha so‘zlar
    out = out.replace(/^Kubok va /, 'Кубок и ')
  }
  return out
}

/**
 * Tarjima: tr('Saqlash'), o‘zgaruvchi bilan — tr('{n} ta joy qoldi', { n: 5 }).
 * Nomi «tr» — komponentlarda ko‘p uchraydigan (t) => … parametrlari bilan to‘qnashmasin.
 * Lug‘atda bo‘lmasa sana («3-oktabr 2026») va narx («250 000 so‘m / soat») qolip bo‘yicha o‘giriladi.
 */
export function tr(text, vars) {
  if (typeof text !== 'string' || !text) return text
  if (lang === 'uz') return fill(text, vars)
  return fill(dictionary.get(normalize(text)) ?? byPattern(text), vars)
}

/** Ro‘yxatni tarjima qilish: trList(job.tasks) */
export const trList = (list) => (Array.isArray(list) ? list.map((item) => tr(item)) : list)

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

// index.html’dagi sarlavha va tavsif o‘zbekcha — useSeo chaqirmaydigan sahifalar uchun ham tarjima
if (lang === 'ru' && typeof document !== 'undefined') {
  document.title = tr(document.title)
  const description = document.querySelector('meta[name="description"]')
  if (description) description.setAttribute('content', tr(description.getAttribute('content')))
}
