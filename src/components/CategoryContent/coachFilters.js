// Murabbiylar filtri: variantlar, URL bilan sinxronlash, filtrlash va saralash
import { REGIONS } from '../../data/regions.js'

export const TRAINING_TYPES = [
  { id: 'full', label: 'Yakka mashg‘ulot' },
  { id: 'part', label: 'Guruh mashg‘uloti' },
  { id: 'remote', label: 'Onlayn' },
  { id: 'intern', label: 'Bolalar uchun' },
]

export const SPECIALTIES = [
  { id: 'beginner', label: 'Boshlang‘ichlar uchun' },
  { id: 'competition', label: 'Musobaqaga tayyorlov' },
  { id: 'weight', label: 'Ozish va forma' },
  { id: 'rehab', label: 'Reabilitatsiya' },
  { id: 'kids', label: 'Bolalar bilan ishlash' },
]

// Narx oraliqlari kesishmaydi: har bir murabbiy faqat bitta oraliqqa tushadi
export const PRICE_OPTIONS = [
  { id: 'all', label: 'Barchasi' },
  { id: '100', label: '100 ming gacha', test: (p) => p <= 100_000 },
  { id: '100-150', label: '100–150 ming', test: (p) => p > 100_000 && p <= 150_000 },
  { id: '150-200', label: '150–200 ming', test: (p) => p > 150_000 && p < 200_000 },
  { id: '200', label: '200 ming+', test: (p) => p >= 200_000 },
]

export const EXPERIENCE_OPTIONS = [
  { id: 'all', label: 'Barchasi' },
  { id: '0', label: 'Tajribasiz', test: (y) => y < 1 },
  { id: '1', label: '1–2 yil', test: (y) => y >= 1 && y <= 2 },
  { id: '3', label: '3–5 yil', test: (y) => y >= 3 && y <= 5 },
  { id: '5', label: '5 yildan ko‘p', test: (y) => y > 5 },
]

export const SORT_OPTIONS = [
  { id: 'recommended', label: 'Tavsiya etilgan' },
  { id: 'newest', label: 'Eng yangi' },
  { id: 'price-asc', label: 'Avval arzonlari' },
  { id: 'price-desc', label: 'Avval qimmatlari' },
  { id: 'experience', label: 'Tajriba bo‘yicha' },
]

const recommendScore = (c) => (c.premium ? 2 : 0) + (c.online ? 1 : 0)

const SORTERS = {
  recommended: (a, b) => recommendScore(b) - recommendScore(a) || b.experienceYears - a.experienceYears,
  newest: (a, b) => b.addedAt.localeCompare(a.addedAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  experience: (a, b) => b.experienceYears - a.experienceYears,
}

// URL kalitlari — filtrlangan sahifani ulashish va «orqaga» tugmasi ishlashi uchun
const KEYS = {
  region: 'hudud',
  types: 'tur',
  specialties: 'yonalish',
  price: 'narx',
  experience: 'tajriba',
  sort: 'saralash',
}

const pick = (options, value, fallback) => (options.some((o) => o.id === value) ? value : fallback)

function readList(params, key, options) {
  const raw = params.get(key)
  if (!raw) return []
  return raw.split(',').filter((id) => options.some((o) => o.id === id))
}

export function readCoachFilters(params) {
  return {
    region: pick(REGIONS, params.get(KEYS.region), 'all'),
    types: readList(params, KEYS.types, TRAINING_TYPES),
    specialties: readList(params, KEYS.specialties, SPECIALTIES),
    price: pick(PRICE_OPTIONS, params.get(KEYS.price), 'all'),
    experience: pick(EXPERIENCE_OPTIONS, params.get(KEYS.experience), 'all'),
    sort: pick(SORT_OPTIONS, params.get(KEYS.sort), 'recommended'),
  }
}

const DEFAULTS = { region: 'all', price: 'all', experience: 'all', sort: 'recommended' }

/** Joriy URL parametrlariga filtr o‘zgarishini yozadi (boshqa parametrlar, masalan `tab`, saqlanadi) */
export function writeCoachFilters(params, patch) {
  const next = new URLSearchParams(params)
  for (const [field, value] of Object.entries(patch)) {
    const key = KEYS[field]
    const empty = Array.isArray(value) ? value.length === 0 : value === DEFAULTS[field]
    if (empty) next.delete(key)
    else next.set(key, Array.isArray(value) ? value.join(',') : value)
  }
  return next
}

export const CLEARED_FILTERS = {
  region: 'all',
  types: [],
  specialties: [],
  price: 'all',
  experience: 'all',
}

export function filterCoaches(items, f) {
  const priceTest = PRICE_OPTIONS.find((o) => o.id === f.price)?.test
  const expTest = EXPERIENCE_OPTIONS.find((o) => o.id === f.experience)?.test

  return items
    .filter((c) => f.region === 'all' || c.regionId === f.region)
    .filter((c) => f.types.length === 0 || f.types.some((t) => c.trainingTypes.includes(t)))
    .filter((c) => f.specialties.length === 0 || f.specialties.some((s) => c.specialties.includes(s)))
    .filter((c) => !priceTest || priceTest(c.price))
    .filter((c) => !expTest || expTest(c.experienceYears))
    .sort(SORTERS[f.sort])
}

/** Faol filtrlar — chiplar uchun; har biri o‘zini olib tashlash patch’ini biladi */
export function activeFilterChips(f) {
  const label = (options, id) => options.find((o) => o.id === id)?.label
  const chips = []
  if (f.region !== 'all') chips.push({ key: 'region', label: label(REGIONS, f.region), patch: { region: 'all' } })
  for (const id of f.types) {
    chips.push({ key: `type-${id}`, label: label(TRAINING_TYPES, id), patch: { types: f.types.filter((t) => t !== id) } })
  }
  for (const id of f.specialties) {
    chips.push({
      key: `spec-${id}`,
      label: label(SPECIALTIES, id),
      patch: { specialties: f.specialties.filter((s) => s !== id) },
    })
  }
  if (f.price !== 'all') chips.push({ key: 'price', label: label(PRICE_OPTIONS, f.price), patch: { price: 'all' } })
  if (f.experience !== 'all') {
    chips.push({ key: 'experience', label: label(EXPERIENCE_OPTIONS, f.experience), patch: { experience: 'all' } })
  }
  return chips
}
