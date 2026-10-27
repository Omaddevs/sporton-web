import { companies, DEFAULT_COMPANY_ID } from './companies.js'

/**
 * Bron qilinadigan sport xizmatlari: maydonlar, zallar, sektsiyalar va mashg‘ulotlar.
 * (Ichki nomlar — job/company — UI komponentlari bilan moslik uchun saqlangan.)
 */

export const jobFilters = [
  { id: 'all', label: 'Barchasi', icon: 'grid' },
  { id: 'full', label: 'Yopiq zal', icon: 'indoor' },
  { id: 'part', label: 'Ochiq maydon', icon: 'outdoor' },
  { id: 'remote', label: 'Onlayn', icon: 'online' },
  { id: 'intern', label: 'Bepul sinov', icon: 'gift' },
]

const jobTypes = {
  full: { type: 'full', typeLabel: 'Yopiq zal', typeTone: 'pink' },
  part: { type: 'part', typeLabel: 'Ochiq maydon', typeTone: 'green' },
  remote: { type: 'remote', typeLabel: "Onlayn mashg'ulot", typeTone: 'purple' },
  intern: { type: 'intern', typeLabel: 'Bepul sinov darsi', typeTone: 'orange' },
}

/** Sport turi bo‘yicha xizmat shablonlari */
const OFFERS = {
  futbol: {
    category: 'Futbol',
    items: [
      { title: 'Mini-futbol maydoni 5×5', type: 'full', price: '250 000 so‘m / soat' },
      { title: 'Futbol maydoni 7×7 (sun’iy maysa)', type: 'part', price: '350 000 so‘m / soat' },
      { title: 'Bolalar futbol sektsiyasi', type: 'intern', price: '400 000 so‘m / oy' },
    ],
  },
  basketbol: {
    category: 'Basketbol',
    items: [
      { title: 'Basketbol zali', type: 'full', price: '300 000 so‘m / soat' },
      { title: 'Streetbol maydoni 3×3', type: 'part', price: '120 000 so‘m / soat' },
      { title: 'Basketbol sektsiyasi (o‘smirlar)', type: 'intern', price: '350 000 so‘m / oy' },
    ],
  },
  tennis: {
    category: 'Tennis',
    items: [
      { title: 'Tennis korti (hard)', type: 'full', price: '200 000 so‘m / soat' },
      { title: 'Tennis korti (grunt)', type: 'part', price: '160 000 so‘m / soat' },
      { title: 'Tennis bo‘yicha yakka mashg‘ulot', type: 'intern', price: '180 000 so‘m / dars' },
    ],
  },
  suzish: {
    category: 'Suzish',
    items: [
      { title: 'Suzish havzasi — 25 m', type: 'full', price: '70 000 so‘m / seans' },
      { title: 'Suzish bo‘yicha guruh darsi', type: 'intern', price: '450 000 so‘m / oy' },
      { title: 'Aquafitnes mashg‘uloti', type: 'full', price: '90 000 so‘m / dars' },
    ],
  },
  fitnes: {
    category: 'Fitnes',
    items: [
      { title: 'Trenajyor zali — oylik abonement', type: 'full', price: '350 000 so‘m / oy' },
      { title: 'Funksional trening (guruh)', type: 'intern', price: '60 000 so‘m / dars' },
      { title: 'Shaxsiy trener bilan mashg‘ulot', type: 'full', price: '150 000 so‘m / dars' },
      { title: 'Onlayn fitnes marafoni — 30 kun', type: 'remote', price: '190 000 so‘m' },
    ],
  },
  boks: {
    category: 'Boks',
    items: [
      { title: 'Boks sektsiyasi', type: 'full', price: '400 000 so‘m / oy' },
      { title: 'MMA mashg‘ulotlari', type: 'intern', price: '450 000 so‘m / oy' },
      { title: 'Kikboksing (guruh)', type: 'full', price: '380 000 so‘m / oy' },
    ],
  },
  kurash: {
    category: 'Kurash',
    items: [
      { title: 'Kurash sektsiyasi', type: 'full', price: '300 000 so‘m / oy' },
      { title: 'Dzyudo mashg‘ulotlari', type: 'intern', price: '350 000 so‘m / oy' },
      { title: 'Karate (bolalar uchun)', type: 'full', price: '320 000 so‘m / oy' },
    ],
  },
  voleybol: {
    category: 'Voleybol',
    items: [
      { title: 'Voleybol zali', type: 'full', price: '220 000 so‘m / soat' },
      { title: 'Plyaj voleyboli maydoni', type: 'part', price: '150 000 so‘m / soat' },
    ],
  },
  yoga: {
    category: 'Yoga',
    items: [
      { title: 'Hatha yoga darsi', type: 'intern', price: '70 000 so‘m / dars' },
      { title: 'Pilates (guruh)', type: 'full', price: '80 000 so‘m / dars' },
      { title: 'Onlayn yoga — ertalabki kurs', type: 'remote', price: '250 000 so‘m / oy' },
    ],
  },
  'stol-tennisi': {
    category: 'Stol tennisi',
    items: [{ title: 'Stol tennisi stoli', type: 'full', price: '50 000 so‘m / soat' }],
  },
  padel: {
    category: 'Padel',
    items: [{ title: 'Padel korti', type: 'full', price: '280 000 so‘m / soat' }],
  },
  'yengil-atletika': {
    category: 'Yugurish',
    items: [
      { title: 'Yugurish klubi — guruh mashg‘uloti', type: 'part', price: 'Bepul' },
      { title: 'Stadion yugurish yo‘lakchasi', type: 'part', price: '30 000 so‘m / seans' },
    ],
  },
  velosport: {
    category: 'Velosport',
    items: [{ title: 'Velotrek — mashg‘ulot va ijara', type: 'part', price: '60 000 so‘m / soat' }],
  },
  shaxmat: {
    category: 'Shaxmat',
    items: [
      { title: 'Shaxmat to‘garagi', type: 'full', price: '200 000 so‘m / oy' },
      { title: 'Shaxmat bo‘yicha onlayn dars', type: 'remote', price: '90 000 so‘m / dars' },
    ],
  },
}

/** Har bir majmua qaysi sport turlari bo‘yicha xizmat ko‘rsatadi */
const COMPANY_SPORTS = {
  olimpiya: ['futbol', 'suzish', 'fitnes', 'basketbol'],
  'champion-arena': ['futbol', 'basketbol'],
  'aqua-life': ['suzish'],
  'power-gym': ['fitnes', 'boks'],
  'tennis-park': ['tennis', 'padel'],
  fitlife: ['fitnes', 'yoga'],
  'goal-arena': ['futbol'],
  'yoga-space': ['yoga'],
  'fight-club': ['boks', 'kurash'],
  'basket-city': ['basketbol'],
  'padel-club': ['padel', 'tennis'],
  'run-club': ['yengil-atletika'],
  'velo-track': ['velosport'],
  'chess-house': ['shaxmat'],
  'volley-beach': ['voleybol'],
  'iron-fitness': ['fitnes'],
  'splash-pool': ['suzish'],
  'kurash-akademiya': ['kurash'],
  'smash-tennis': ['tennis', 'stol-tennisi'],
  'sport-city': ['futbol', 'voleybol', 'stol-tennisi', 'fitnes'],
  'energy-fitness': ['fitnes', 'yoga'],
  'pro-football': ['futbol'],
  'zen-yoga': ['yoga'],
  atlet: ['yengil-atletika', 'voleybol'],
  'family-sport': ['suzish', 'kurash', 'shaxmat'],
  'ring-boxing': ['boks'],
  'strong-gym': ['fitnes'],
  'star-arena': ['basketbol', 'voleybol', 'futbol'],
}

const locations = [
  'Toshkent',
  'Samarqand',
  'Buxoro',
  'Namangan',
  'Andijon',
  'Farg‘ona',
  'Nukus',
  'Xorazm',
  'Qarshi',
  'Jizzax',
]

// Shahar markazlari — majmualar shu nuqta atrofida joylashtiriladi
const CITY_CENTERS = {
  Toshkent: { lat: 41.2995, lng: 69.2401, spreadKm: 8 },
  Samarqand: { lat: 39.6542, lng: 66.9597, spreadKm: 4 },
  Buxoro: { lat: 39.7747, lng: 64.4286, spreadKm: 4 },
  Namangan: { lat: 40.9983, lng: 71.6726, spreadKm: 4 },
  Andijon: { lat: 40.7821, lng: 72.3442, spreadKm: 4 },
  'Farg‘ona': { lat: 40.3864, lng: 71.7864, spreadKm: 4 },
  Nukus: { lat: 42.4531, lng: 59.6103, spreadKm: 4 },
  Xorazm: { lat: 41.55, lng: 60.6333, spreadKm: 4 },
  Qarshi: { lat: 38.8606, lng: 65.7891, spreadKm: 4 },
  Jizzax: { lat: 40.1158, lng: 67.8422, spreadKm: 4 },
}

/** Majmua koordinatasi: id bo'yicha har doim bir xil, onlayn mashg'ulotlarda null */
function buildCoords(location, type, id) {
  const center = CITY_CENTERS[location]
  if (!center || type === 'remote') return null
  const angle = (id * 137.508 * Math.PI) / 180
  const distKm = Math.sqrt(((id * 7919) % 1000) / 1000) * center.spreadKm
  return {
    lat: center.lat + (distKm / 111) * Math.sin(angle),
    lng: center.lng + (distKm / (111 * Math.cos((center.lat * Math.PI) / 180))) * Math.cos(angle),
  }
}

function pad2(value) {
  return String(value).padStart(2, '0')
}

/** Professional display: DD.MM.YYYY HH:MM */
export function formatPostedAt(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function buildPostedAt(index) {
  const date = new Date()
  date.setSeconds(0, 0)
  date.setDate(date.getDate() - (index % 14))
  date.setHours(9 + (index % 10), (index * 7) % 60, 0, 0)
  return formatPostedAt(date)
}

const levels = ['Barcha darajalar', "Boshlang'ich", "O'rta", 'Professional']
const hours = ['07:00 - 23:00', '08:00 - 22:00', '06:00 - 00:00', '24/7']
const formats = ['Yakka va guruh', 'Guruh', 'Yakka', 'Jamoaviy']
const amenities = ['Dush va kiyinish xonasi', 'Bepul avtoturargoh', 'Inventar ijarasi', 'Konditsioner']

const companyMeta = {
  [DEFAULT_COMPANY_ID]: {
    industry: 'Ko‘p tarmoqli sport majmuasi',
    about:
      "Olimpiya Sport Majmuasi — futbol va basketbol maydonlari, suzish havzasi va trenajyor zaliga ega zamonaviy majmua. Kattalar va bolalar uchun yakka hamda guruh mashg‘ulotlari olib boriladi.",
    stats: [
      { label: '12+ yil', sub: 'Faoliyatda' },
      { label: '40+', sub: 'Murabbiylar' },
      { label: '8', sub: 'Maydon va zal' },
    ],
    quote: 'Sog‘lom avlod — kuchli kelajak.',
    bannerText: 'Sport — har kuni, har kim uchun',
    bannerImage: '/images/sport/banner.jpg',
    gallery: [
      '/images/sport/gallery/g1.jpg',
      '/images/sport/gallery/g3.jpg',
      '/images/sport/gallery/g4.jpg',
    ],
  },
}

function defaultCompanyMeta(company) {
  return (
    companyMeta[company.id] || {
      industry: 'Sport klubi',
      about: `${company.name} — zamonaviy jihozlar va malakali murabbiylarga ega sport maskani. Qulay vaqtni tanlang va onlayn bron qiling.`,
      stats: [
        { label: '5+ yil', sub: 'Faoliyatda' },
        { label: '15+', sub: 'Murabbiylar' },
        { label: '3+', sub: 'Maydon va zal' },
      ],
      quote: 'Har bir mashg‘ulot — natija sari qadam.',
      bannerText: company.name,
      bannerImage: null,
      gallery: [],
    }
  )
}

function buildDetail(job, offer) {
  const meta = defaultCompanyMeta({ id: job.companyId, name: job.company })
  const isOnline = job.type === 'remote'
  return {
    views: 800 + ((job.id * 37) % 900),
    salary: offer.price,
    experience: levels[job.id % levels.length],
    hours: isOnline ? 'Istalgan vaqtda' : hours[job.id % hours.length],
    workMode: isOnline ? 'Onlayn' : formats[job.id % formats.length],
    level: isOnline ? 'Video darslar' : amenities[job.id % amenities.length],
    description: `${job.company} majmuasida «${job.title}» xizmati. Qulay vaqtni tanlang va onlayn bron qiling — majmua tasdiqlagach xabar olasiz. Mashg‘ulotlar malakali murabbiylar nazoratida o‘tadi.`,
    tasks: [
      'Tanlangan vaqt uchun maydon / zaldan to‘liq foydalanish',
      'Kiyinish xonasi va dush',
      'Sport inventari (to‘p, setka, gantel va h.k.)',
      'Murabbiy maslahati (kelishuv asosida)',
      'Bron tasdig‘i sayt va Telegram orqali',
    ],
    requirements: [
      'Mashg‘ulotdan 10 daqiqa oldin yetib keling',
      'Sport kiyimi va almashtiriladigan poyabzal',
      'Bronni kamida 3 soat oldin bekor qilish mumkin',
      '14 yoshgacha bolalar kattalar nazoratida',
      'Majmua ichki tartib qoidalariga rioya qilish',
    ],
    offers: [
      'Onlayn bron — 1 daqiqada',
      'Birinchi mashg‘ulotga 20% chegirma',
      'Bepul Wi-Fi va dam olish zonasi',
      'Xavfsiz va toza muhit',
    ],
    companyMeta: meta,
  }
}

/**
 * Haqiqiy e’lonlar xizmatlari. coords — xaritadagi nuqta: aniq manzil ma’lum bo‘lsa shu yerni
 * yangilang (Google Maps’da nuqtani bosib, lat/lng ni nusxalash mumkin).
 */
const LISTED_SERVICES = [
  {
    companyId: 'tennis-club',
    title: 'Bolalar tennis sektsiyasi',
    sportId: 'tennis',
    type: 'part',
    price: '450 000 so‘m / oy',
    hours: '09:00 - 21:00',
    workMode: 'Guruh',
    location: 'Toshkent',
    coords: { lat: 41.3166, lng: 69.2484 },
    description:
      'Ushbu zalda siz malakali ustozlardan Tennis sportini mukammal o‘rganasiz! Farzandingizni kuch, intizom va g‘alabaga yo‘naltiring. 🏆',
  },
  {
    companyId: 'judo-club',
    title: 'Bolalar dzyudo sektsiyasi (6 yoshdan)',
    sportId: 'kurash',
    type: 'full',
    price: '450 000 so‘m / oy',
    hours: '08:00 - 22:00',
    workMode: 'Guruh',
    location: 'Toshkent',
    coords: { lat: 41.2995, lng: 69.2401 },
    description:
      'Ushbu zalda siz malakali ustozlardan Judo sportini mukammal o‘rganasiz! Farzandingizni kuch, intizom va g‘alabaga yo‘naltiring. 🏆 6 yoshdan qabul qilinadi.',
  },
  {
    companyId: 'guncha-judo-club',
    title: 'Bolalar dzyudo sektsiyasi (6 yoshdan)',
    sportId: 'kurash',
    type: 'full',
    price: 'Narxi kelishiladi',
    hours: 'Telefon orqali aniqlang',
    workMode: 'Guruh',
    location: 'Toshkent',
    // 102-maktab, Bog‘ko‘cha ko‘chasi (OpenStreetMap)
    coords: { lat: 41.3295823, lng: 69.2203275 },
    description:
      'Ushbu zalda siz malakali ustozlardan Judo sportini mukammal o‘rganasiz! Farzandingizni kuch, intizom va g‘alabaga yo‘naltiring. 🏆 6 yoshdan qabul qilinadi.',
  },
  {
    companyId: 'premium-jiu-jitsu',
    title: 'Jiu-jitsu sektsiyasi (6 yoshdan)',
    sportId: 'kurash',
    type: 'full',
    price: 'Narxi kelishiladi',
    hours: 'Telefon orqali aniqlang',
    workMode: 'Guruh',
    location: 'Toshkent',
    // 11-maktab, Guzarboshi mahallasi — Nurafshon aylanma ko‘chasi yonida (OpenStreetMap)
    coords: { lat: 41.3398224, lng: 69.2325908 },
    description:
      'Kuch, intizom va o‘ziga ishonch — barchasi shu yerda! Farzandingizni haqiqiy jang san’atiga qadam qo‘ydiring. 🏆 6 yoshdan qabul qilinadi.',
  },
  {
    companyId: 'jiu-jitsu-sport-club',
    title: 'Bolalar jiu-jitsu sektsiyasi (4 yoshdan)',
    sportId: 'kurash',
    type: 'full',
    price: 'Narxi kelishiladi',
    hours: 'Telefon orqali aniqlang',
    workMode: 'Guruh',
    location: 'Toshkent',
    // Taxminiy nuqta — e’londa faqat «Toshkent shahar» ko‘rsatilgan
    coords: { lat: 41.3111, lng: 69.2797 },
    description:
      'Farzandingizni jismoniy chiniqtiring, intizom va o‘ziga ishonchni oshiring! Bugun ro‘yxatdan o‘ting — ertangi chempionlar shu yerdan boshlanadi! 🏆 4 yoshdan qabul qilinadi.',
  },
  {
    companyId: 'olympic-judo-kids',
    title: 'Bolalar dzyudo sektsiyasi (6 yoshdan)',
    sportId: 'kurash',
    type: 'full',
    price: 'Narxi kelishiladi',
    hours: 'Dushanba, Chorshanba, Juma',
    workMode: 'Guruh',
    location: 'Toshkent',
    // Respublika Olimpiya zaxiralari bilim yurti, Kichik Halqa yo‘li (OpenStreetMap)
    coords: { lat: 41.296047, lng: 69.1960196 },
    description:
      'Kuch, intizom va g‘alaba sari ilk qadamni shu yerdan boshlang! Farzandingizni jismoniy va ruhiy jihatdan rivojlantiring! 💪 6 yoshdan kattalar uchun. Mashg‘ulotlar: dushanba, chorshanba, juma.',
  },
]

function buildListedJob(service, index) {
  const company = companies.find((c) => c.id === service.companyId)
  const jobType = jobTypes[service.type]
  const postedAt = buildPostedAt(0)
  const base = {
    id: 1000 + index,
    title: service.title,
    company: company.name,
    companyId: company.id,
    companyColor: company.color,
    logo: company.logo,
    verified: company.verified,
    location: service.location,
    type: jobType.type,
    typeLabel: jobType.typeLabel,
    typeTone: jobType.typeTone,
    category: OFFERS[service.sportId].category,
    sportId: service.sportId,
    postedAt,
    postedAgo: postedAt,
    coords: service.coords,
  }
  return {
    ...base,
    ...buildDetail(base, { price: service.price }),
    hours: service.hours,
    workMode: service.workMode,
    description: service.description,
  }
}

function buildJobs(count) {
  const list = []
  const usage = {}
  // Haqiqiy e’lonlar alohida quriladi — generatsiya qilingan xizmatlar o‘zgarmasin
  const pool = companies.filter((c) => !c.listed)

  for (let i = 0; i < count; i += 1) {
    const company = pool[i % pool.length]
    const sports = COMPANY_SPORTS[company.id] ?? ['fitnes']
    const round = usage[company.id] ?? 0
    usage[company.id] = round + 1

    const sportId = sports[round % sports.length]
    const group = OFFERS[sportId]
    const offer = group.items[(Math.floor(round / sports.length) + i) % group.items.length]
    const jobType = jobTypes[offer.type]
    const location = jobType.type === 'remote' ? 'Onlayn' : locations[i % locations.length]
    const postedAt = buildPostedAt(i)

    const base = {
      id: i + 1,
      title: offer.title,
      company: company.name,
      companyId: company.id,
      companyColor: company.color,
      logo: company.logo,
      verified: company.verified,
      location,
      type: jobType.type,
      typeLabel: jobType.typeLabel,
      typeTone: jobType.typeTone,
      category: group.category,
      sportId,
      postedAt,
      postedAgo: postedAt,
      coords: buildCoords(location, jobType.type, i + 1),
    }

    list.push({ ...base, ...buildDetail(base, offer) })
  }

  return list
}

export const jobs = [...LISTED_SERVICES.map(buildListedJob), ...buildJobs(100)]

// Demo: Olimpiya majmuasidagi mini-futbol maydoni
const demo = jobs.find((j) => j.companyId === DEFAULT_COMPANY_ID)
if (demo) {
  Object.assign(demo, {
    title: 'Mini-futbol maydoni 5×5',
    category: 'Futbol',
    sportId: 'futbol',
    location: 'Toshkent',
    type: 'full',
    coords: buildCoords('Toshkent', 'full', demo.id),
    typeLabel: 'Yopiq zal',
    typeTone: 'pink',
    postedAt: buildPostedAt(2),
    postedAgo: buildPostedAt(2),
    views: 1250,
    salary: '250 000 so‘m / soat',
    experience: 'Barcha darajalar',
    hours: '07:00 - 23:00',
    workMode: 'Jamoaviy',
    level: 'Dush va kiyinish xonasi',
    description:
      "Yopiq mini-futbol maydoni: yuqori sifatli sun’iy maysa, LED yoritish va isitish tizimi. 10–12 kishilik jamoa uchun ideal. Do‘stlar bilan o‘yin, korporativ turnir yoki muntazam mashg‘ulotlar uchun qulay vaqtni tanlang va bron qiling.",
    tasks: [
      '40×20 m yopiq maydon, FIFA standartidagi sun’iy maysa',
      'Futbol to‘plari va manishkalar bepul',
      'Kiyinish xonasi, dush va shaxsiy shkaflar',
      'Tribuna va kutish zonasi',
      'Video-yozuv xizmati (qo‘shimcha to‘lov evaziga)',
    ],
    requirements: [
      'Faqat futzal yoki sun’iy maysa uchun butsi',
      'Mashg‘ulotdan 10 daqiqa oldin yetib keling',
      'Bronni kamida 3 soat oldin bekor qilish mumkin',
      'Maydonda chekish va ovqatlanish taqiqlanadi',
      'Majmua ichki tartib qoidalariga rioya qilish',
    ],
    offers: [
      'Narx: 250 000 so‘m / soat',
      'Tungi soatlarda (23:00 dan keyin) 15% chegirma',
      'Oylik abonementda har 5-o‘yin bepul',
      'Bepul avtoturargoh (60 joy)',
      'Murabbiy bilan jamoaviy mashg‘ulot imkoniyati',
    ],
  })
}

export function getJobById(id) {
  const numeric = Number(id)
  return (
    jobs.find((job) => job.id === numeric) ??
    jobs.find((j) => j.companyId === DEFAULT_COMPANY_ID) ??
    jobs[0]
  )
}

export function getSimilarJobs(job, limit = 6) {
  return jobs
    .filter((item) => item.id !== job.id && (item.category === job.category || item.type === job.type))
    .slice(0, limit)
}

export function getRelatedJobs(job, limit = 3) {
  return jobs.filter((item) => item.id !== job.id && item.companyId !== job.companyId).slice(0, limit)
}

/** API’dan kelgan xizmatlar bilan ro‘yxatni joyida almashtiradi (avval hydrateCompanies chaqirilsin) */
export function hydrateJobs(list) {
  const next = list.map((s) => {
    const company = companies.find((c) => c.id === s.complexId)
    const jobType = jobTypes[s.type] ?? jobTypes.full
    const postedAt = formatPostedAt(s.createdAt ?? Date.now())
    const base = {
      id: s.id,
      title: s.title,
      company: company?.name ?? '',
      companyId: s.complexId,
      companyColor: company?.color,
      logo: company?.logo,
      verified: Boolean(company?.verified),
      location: s.location,
      type: jobType.type,
      typeLabel: jobType.typeLabel,
      typeTone: jobType.typeTone,
      category: s.category,
      sportId: s.sportId,
      postedAt,
      postedAgo: postedAt,
      coords: s.coords ?? null,
    }
    const detail = buildDetail(base, { price: s.price })
    return {
      ...base,
      ...detail,
      views: s.views ?? 0,
      hours: s.hours ?? detail.hours,
      workMode: s.workMode ?? detail.workMode,
      experience: s.experience ?? detail.experience,
      level: s.level ?? detail.level,
      description: s.description ?? detail.description,
      tasks: s.tasks?.length ? s.tasks : detail.tasks,
      requirements: s.requirements?.length ? s.requirements : detail.requirements,
      offers: s.offers?.length ? s.offers : detail.offers,
      bookingMode: s.bookingMode,
    }
  })
  jobs.splice(0, jobs.length, ...next)
}
