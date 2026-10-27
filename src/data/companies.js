// Haqiqiy e’lonlar: ro‘yxatda birinchi chiqadi, xizmatlari jobs.js dagi LISTED_SERVICES da
const listedCompanies = [
  { id: 'tennis-club', name: 'Tennis Club', adsCount: 1, verified: true, color: '#1e6ff5', listed: true },
  { id: 'judo-club', name: 'Judo Club', adsCount: 1, verified: true, color: '#1d4ed8', listed: true },
  { id: 'guncha-judo-club', name: 'G‘uncha Judo Club', adsCount: 1, verified: true, color: '#2563eb', listed: true },
  { id: 'premium-jiu-jitsu', name: 'Premium Jiu-Jitsu Club', adsCount: 1, verified: true, color: '#111827', listed: true },
  { id: 'jiu-jitsu-sport-club', name: 'Jiu-Jitsu Sport Club', adsCount: 1, verified: true, color: '#1e40af', listed: true },
  { id: 'olympic-judo-kids', name: 'Olympic Judo Kids Club', adsCount: 1, verified: true, color: '#0369a1', listed: true },
]

// Sport majmualari va klublar (platformadagi «hamkorlar»)
const baseCompanies = [
  { id: 'olimpiya', name: 'Olimpiya Sport Majmuasi', adsCount: 14, verified: true, color: '#1e6ff5' },
  { id: 'champion-arena', name: 'Champion Arena', adsCount: 11, verified: true, color: '#16a34a' },
  { id: 'aqua-life', name: 'Aqua Life', adsCount: 8, verified: true, color: '#0284c7' },
  { id: 'power-gym', name: 'Power Gym', adsCount: 12, verified: true, color: '#111827' },
  { id: 'tennis-park', name: 'Tennis Park', adsCount: 9, verified: true, color: '#7a9a06' },
  { id: 'fitlife', name: 'FitLife Club', adsCount: 10, verified: true, color: '#7c3aed' },
  { id: 'goal-arena', name: 'Goal Arena', adsCount: 15, verified: true, color: '#15803d' },
  { id: 'yoga-space', name: 'Yoga Space', adsCount: 6, verified: true, color: '#0d9488' },
  { id: 'fight-club', name: 'Fight Club', adsCount: 7, verified: true, color: '#dc2626' },
  { id: 'basket-city', name: 'Basket City', adsCount: 8, verified: true, color: '#ea580c' },
  { id: 'padel-club', name: 'Padel Club', adsCount: 5, verified: true, color: '#6366f1' },
  { id: 'run-club', name: 'Run Club', adsCount: 9, verified: true, color: '#f97316' },
  { id: 'velo-track', name: 'Velo Track', adsCount: 4, verified: false, color: '#059669' },
  { id: 'chess-house', name: 'Chess House', adsCount: 6, verified: true, color: '#334155' },
  { id: 'volley-beach', name: 'Volley Beach', adsCount: 5, verified: true, color: '#d97706' },
  { id: 'iron-fitness', name: 'Iron Fitness', adsCount: 13, verified: true, color: '#1f2937' },
  { id: 'splash-pool', name: 'Splash Pool', adsCount: 7, verified: true, color: '#0ea5e9' },
  { id: 'kurash-akademiya', name: 'Kurash Akademiyasi', adsCount: 8, verified: true, color: '#1d4ed8' },
  { id: 'smash-tennis', name: 'Smash Tennis', adsCount: 6, verified: false, color: '#65a30d' },
  { id: 'sport-city', name: 'Sport City', adsCount: 16, verified: true, color: '#2563eb' },
  { id: 'energy-fitness', name: 'Energy Fitness', adsCount: 11, verified: true, color: '#c026d3' },
  { id: 'pro-football', name: 'Pro Football Academy', adsCount: 10, verified: true, color: '#166534' },
  { id: 'zen-yoga', name: 'Zen Yoga Studio', adsCount: 5, verified: true, color: '#14b8a6' },
  { id: 'atlet', name: 'Atlet Sport Markazi', adsCount: 9, verified: true, color: '#0f766e' },
  { id: 'family-sport', name: 'Family Sport Club', adsCount: 8, verified: true, color: '#7cc520' },
  { id: 'ring-boxing', name: 'Ring Boxing', adsCount: 6, verified: true, color: '#b91c1c' },
  { id: 'strong-gym', name: 'Strong Gym', adsCount: 10, verified: false, color: '#374151' },
  { id: 'star-arena', name: 'Star Arena', adsCount: 12, verified: true, color: '#4f46e5' },
]

const detailOverrides = {
  'tennis-club': {
    tagline: 'Bolalar uchun tennis klubi — malakali ustozlar bilan',
    location: 'Toshkent shahri',
    city: 'Toshkent',
    website: null,
    industry: 'Tennis klubi',
    years: '3+',
    employees: '2+',
    reviews: 18,
    telegram: null,
    hours: '09:00 - 21:00',
    bannerImage: '/images/sport/clubs/tennis-club.jpg',
    bannerSlogan: 'Farzandingizni kuch, intizom va g‘alabaga yo‘naltiring!',
    about:
      'Ushbu zalda siz malakali ustozlardan Tennis sportini mukammal o‘rganasiz! Farzandingizni kuch, intizom va g‘alabaga yo‘naltiring. Oylik to‘lov — 450 000 so‘m, mashg‘ulotlar har kuni 9:00 dan 21:00 gacha.',
    similarIds: ['tennis-park', 'smash-tennis', 'padel-club'],
  },
  'judo-club': {
    tagline: 'Bolalar uchun dzyudo klubi — 6 yoshdan qabul qilinadi',
    location: 'Toshkent shahri',
    city: 'Toshkent',
    website: null,
    industry: 'Dzyudo klubi',
    years: '3+',
    employees: '2+',
    reviews: 15,
    telegram: null,
    hours: '08:00 - 22:00',
    bannerImage: '/images/sport/clubs/judo-club.jpg',
    bannerSlogan: 'Farzandingizni kuch, intizom va g‘alabaga yo‘naltiring!',
    about:
      'Ushbu zalda siz malakali ustozlardan Judo sportini mukammal o‘rganasiz! Farzandingizni kuch, intizom va g‘alabaga yo‘naltiring. 6 yoshdan qabul qilinadi. Oylik to‘lov — 450 000 so‘m, mashg‘ulotlar har kuni 8:00 dan 22:00 gacha.',
    similarIds: ['kurash-akademiya', 'fight-club', 'family-sport'],
  },
  'guncha-judo-club': {
    tagline: 'Shayxontohurdagi bolalar dzyudo klubi — 6 yoshdan qabul qilinadi',
    location: 'Toshkent, Shayxontohur tumani, G‘uncha 102-maktab',
    city: 'Toshkent',
    website: null,
    industry: 'Dzyudo klubi',
    years: '3+',
    employees: '2+',
    reviews: 12,
    telegram: null,
    // E’londa narx va ish vaqti ko‘rsatilmagan — o‘ylab topilmaydi
    hours: 'Telefon orqali aniqlang',
    priceNote: 'Narxi kelishiladi',
    bannerImage: '/images/sport/clubs/guncha-judo-club.jpg',
    bannerSlogan: 'Farzandingizni kuch, intizom va g‘alabaga yo‘naltiring!',
    about:
      'Ushbu zalda siz malakali ustozlardan Judo sportini mukammal o‘rganasiz! Farzandingizni kuch, intizom va g‘alabaga yo‘naltiring. 6 yoshdan qabul qilinadi. Mashg‘ulotlar Shayxontohur tumani, G‘uncha 102-maktab hududida o‘tadi.',
    similarIds: ['judo-club', 'kurash-akademiya', 'fight-club'],
  },
  'premium-jiu-jitsu': {
    tagline: 'Olmazordagi jiu-jitsu klubi — 6 yoshdan qabul qilinadi',
    location: 'Toshkent, Olmazor tumani, Nurafshon chorrahasi, 11-maktab',
    city: 'Toshkent',
    website: null,
    industry: 'Jiu-jitsu klubi',
    years: '3+',
    employees: '2+',
    reviews: 14,
    telegram: null,
    // E’londa narx va ish vaqti ko‘rsatilmagan — o‘ylab topilmaydi
    hours: 'Telefon orqali aniqlang',
    priceNote: 'Narxi kelishiladi',
    bannerImage: '/images/sport/clubs/premium-jiu-jitsu.jpg',
    bannerSlogan: 'Kuch, intizom va o‘ziga ishonch — barchasi shu yerda!',
    about:
      'Kuch, intizom va o‘ziga ishonch — barchasi shu yerda! Farzandingizni haqiqiy jang san’atiga qadam qo‘ydiring. 6 yoshdan qabul qilinadi. Mashg‘ulotlar Olmazor tumani, Nurafshon chorrahasi, 11-maktab hududida o‘tadi.',
    similarIds: ['guncha-judo-club', 'judo-club', 'fight-club'],
  },
  'jiu-jitsu-sport-club': {
    tagline: 'Bolalar uchun jiu-jitsu klubi — 4 yoshdan qabul qilinadi',
    location: 'Toshkent shahri',
    city: 'Toshkent',
    website: null,
    industry: 'Jiu-jitsu klubi',
    years: '3+',
    employees: '2+',
    reviews: 11,
    telegram: null,
    // E’londa narx va ish vaqti ko‘rsatilmagan — o‘ylab topilmaydi
    hours: 'Telefon orqali aniqlang',
    priceNote: 'Narxi kelishiladi',
    bannerImage: '/images/sport/clubs/jiu-jitsu-sport-club.jpg',
    bannerSlogan: 'Ertangi chempionlar shu yerdan boshlanadi!',
    about:
      'Farzandingizni jismoniy chiniqtiring, intizom va o‘ziga ishonchni oshiring! Bugun ro‘yxatdan o‘ting — ertangi chempionlar shu yerdan boshlanadi. 4 yoshdan qabul qilinadi.',
    similarIds: ['premium-jiu-jitsu', 'guncha-judo-club', 'judo-club'],
  },
  'olympic-judo-kids': {
    tagline: 'Olimpiya zaxiralari kollejidagi bolalar dzyudo klubi — 6 yoshdan',
    location: 'Toshkent, Chilonzor tumani, Olimpiya zaxiralari kolleji',
    city: 'Toshkent',
    website: null,
    industry: 'Dzyudo klubi',
    years: '3+',
    employees: '2+',
    reviews: 16,
    telegram: null,
    // E’londa soat va narx yo‘q, faqat mashg‘ulot kunlari bor — o‘ylab topilmaydi
    hours: 'Dushanba, Chorshanba, Juma',
    priceNote: 'Narxi kelishiladi',
    bannerImage: '/images/sport/clubs/olympic-judo-kids.jpg',
    bannerSlogan: 'Kuch, intizom va g‘alaba sari ilk qadam!',
    about:
      'Kuch, intizom va g‘alaba sari ilk qadamni shu yerdan boshlang! Farzandingizni jismoniy va ruhiy jihatdan rivojlantiring. 6 yoshdan kattalar qabul qilinadi. Mashg‘ulotlar dushanba, chorshanba va juma kunlari Olimpiya zaxiralari kollejida o‘tadi.',
    similarIds: ['judo-club', 'guncha-judo-club', 'kurash-akademiya'],
  },
  olimpiya: {
    tagline: 'Toshkentdagi eng yirik ko‘p tarmoqli sport majmuasi',
    location: "Toshkent, Yunusobod tumani",
    city: 'Toshkent',
    website: 'https://olimpiya-sport.uz',
    industry: 'Sport majmuasi',
    years: '12+',
    employees: '40+',
    reviews: 124,
    bannerImage: '/images/sport/banner.jpg',
    bannerSlogan: 'Sport — har kuni, har kim uchun',
    about:
      "Olimpiya Sport Majmuasi — futbol va basketbol maydonlari, suzish havzasi, trenajyor zali va 40 dan ortiq malakali murabbiylarga ega zamonaviy majmua. Kattalar va bolalar uchun yakka va guruh mashg‘ulotlari olib boriladi.",
    similarIds: ['sport-city', 'champion-arena', 'goal-arena', 'star-arena'],
  },
  'champion-arena': {
    tagline: 'Yopiq futbol va basketbol arenasi',
    location: "Toshkent, Chilonzor tumani",
    city: 'Toshkent',
    industry: 'Arena',
    years: '8+',
    employees: '25+',
    reviews: 210,
    similarIds: ['goal-arena', 'basket-city', 'olimpiya'],
  },
  'aqua-life': {
    tagline: 'Olimpiya o‘lchamidagi suzish havzasi',
    location: "Toshkent, Mirzo Ulug‘bek tumani",
    city: 'Toshkent',
    industry: 'Suzish havzasi',
    years: '6+',
    employees: '20+',
    reviews: 180,
    similarIds: ['splash-pool', 'olimpiya', 'fitlife'],
  },
}

function companyDefaults(company) {
  return {
    tagline: `${company.name} — ishonchli sport maskani`,
    location: "Toshkent, O'zbekiston",
    city: 'Toshkent',
    // Sayt, telefon va sharhlar soni to‘qib chiqarilmaydi — faqat haqiqiy ma’lumot
    website: null,
    phone: null,
    telegram: null,
    industry: 'Sport klubi',
    years: '5+',
    employees: '15+',
    reviews: 0,
    rating: null,
    bannerImage: null,
    bannerSlogan: company.name,
    about: `${company.name} — zamonaviy jihozlar, malakali murabbiylar va qulay mashg‘ulot jadvaliga ega sport maskani. Onlayn bron qiling va vaqtingizni tejang.`,
    similarIds: [],
  }
}

function enrichCompany(company) {
  const extra = detailOverrides[company.id] || {}
  return { ...companyDefaults(company), ...company, ...extra, reviews: 0 }
}

export const companies = [...listedCompanies, ...baseCompanies].map(enrichCompany)

/** API’dan kelgan majmualar bilan ro‘yxatni joyida almashtiradi (null maydonlar — standart matn bilan) */
export function hydrateCompanies(list) {
  const next = list.map((c) => {
    const defaults = companyDefaults(c)
    const merged = { ...defaults, ...c }
    for (const key of ['tagline', 'location', 'city', 'industry', 'years', 'employees', 'bannerSlogan', 'about']) {
      merged[key] = c[key] ?? defaults[key]
    }
    return merged
  })
  companies.splice(0, companies.length, ...next)
}

export const DEFAULT_COMPANY_ID = 'olimpiya'

export function getCompanyById(id) {
  return (
    companies.find((c) => c.id === id) ??
    companies.find((c) => c.id === DEFAULT_COMPANY_ID) ??
    companies[0]
  )
}

export function getSimilarCompanies(company, limit = 4) {
  if (company.similarIds?.length) {
    const mapped = company.similarIds
      .map((id) => companies.find((c) => c.id === id))
      .filter(Boolean)
    if (mapped.length) return mapped.slice(0, limit)
  }
  return companies.filter((c) => c.id !== company.id).slice(0, limit)
}

export function getTopCompanies(limit = 10) {
  return companies.slice(0, limit)
}
