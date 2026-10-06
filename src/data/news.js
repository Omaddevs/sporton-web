// Sport yangiliklari: bosh yangilik, yon ro‘yxat, lenta va karusel
export const featuredNews = {
  id: 'terma-jamoa-saralash',
  badge: 'Bosh yangilik',
  category: 'Futbol',
  title: 'O‘zbekiston terma jamoasi jahon chempionati saralashida g‘alaba qozondi',
  excerpt:
    'Bosh murabbiy o‘yindan keyin jamoaning taktik intizomini alohida ta’kidladi. Navbatdagi uchrashuv oktabr oxirida Toshkentda bo‘lib o‘tadi.',
  date: '3-oktabr 2026',
  image: '/images/sport/cat/futbol.jpg',
}

export const sideNews = [
  {
    id: 'kurash-osiyo',
    category: 'Kurash',
    title: 'Kurashchilarimiz Osiyo chempionatida 3 ta oltin oldi',
    excerpt:
      'Terma jamoa umumjamoa hisobida birinchi o‘rinni egalladi. G‘oliblar Toshkentda tantanali kutib olindi.',
    date: '2-oktabr 2026',
    image: '/images/sport/cat/kurash.jpg',
  },
  {
    id: 'boks-reyting',
    category: 'Boks',
    title: 'O‘zbek bokschilari jahon reytingida yuqorilab bormoqda',
    excerpt:
      'AIBA yangi reytingida uchta vaznda vakillarimiz kuchli beshlikdan joy oldi. Mutaxassislar fikri bilan tanishing.',
    date: '1-oktabr 2026',
    image: '/images/sport/cat/boks.jpg',
  },
  {
    id: 'yangi-majmua',
    category: 'Infratuzilma',
    title: 'Toshkentda yangi ko‘p tarmoqli sport majmuasi ochildi',
    excerpt:
      'Suzish havzasi, 2 ta mini-futbol maydoni va zamonaviy trenajyor zali. Bronlar SportON orqali qabul qilinmoqda.',
    date: '30-sentabr 2026',
    image: '/images/sport/cat/suzish.jpg',
  },
]

export const newsTicker = [
  'Toshkent xalqaro marafoniga ro‘yxatdan o‘tish davom etmoqda',
  'Basketbol bo‘yicha Superliga yangi mavsumi 15-oktabrda start oladi',
  'O‘zbekiston terma jamoasi saralashda g‘alaba qozondi',
  'Tennischilarimiz Olmaota turnirida finalga chiqdi',
  'Yangi sport majmuasida bepul ochiq mashg‘ulotlar boshlandi',
]

export const latestNews = [
  {
    id: 'basketbol-superliga',
    category: 'Basketbol',
    title: 'Basketbol Superligasi yangi mavsumi taqvimi e’lon qilindi',
    excerpt:
      '12 ta jamoa ikki davrada bellashadi. Ilk turda amaldagi chempion uyida mehmonlarni qabul qiladi.',
    date: '29-sentabr 2026',
    image: '/images/sport/cat/basketbol.jpg',
  },
  {
    id: 'tennis-olmaota',
    category: 'Tennis',
    title: 'Tennischilarimiz Olmaota turnirida finalga yo‘l oldi',
    excerpt:
      'Juftlik bahslarida vakillarimiz yarim finalda reyting bo‘yicha ikkinchi juftlikni mag‘lub etdi.',
    date: '28-sentabr 2026',
    image: '/images/sport/cat/tennis.jpg',
  },
  {
    id: 'velosport-tur',
    category: 'Velosport',
    title: 'Samarqand–Buxoro velopoygasiga 200 dan ortiq ishtirokchi yozildi',
    excerpt:
      'Ko‘p kunlik poyga Buyuk ipak yo‘li bo‘ylab o‘tadi. Havaskorlar uchun alohida qisqa masofa ham bor.',
    date: '26-sentabr 2026',
    image: '/images/sport/cat/velosport.jpg',
  },
  {
    id: 'voleybol-chempionat',
    category: 'Voleybol',
    title: 'Ayollar voleyboli bo‘yicha mamlakat chempionati boshlandi',
    excerpt:
      'Turnirda 10 ta jamoa ishtirok etmoqda. O‘yinlar Toshkent va Namangan sport saroylarida bo‘ladi.',
    date: '24-sentabr 2026',
    image: '/images/sport/cat/voleybol.jpg',
  },
  {
    id: 'yoga-maslahat',
    category: 'Sog‘lom turmush',
    title: 'Haftasiga necha marta mashq qilish kerak? Mutaxassis javob beradi',
    excerpt:
      'Boshlang‘ich daraja uchun optimal rejim, tiklanish va uyqu haqida amaliy tavsiyalar.',
    date: '22-sentabr 2026',
    image: '/images/sport/cat/yoga.jpg',
  },
  {
    id: 'atletika-rekord',
    category: 'Yengil atletika',
    title: 'Yosh sprinter 100 metrga yugurishda milliy rekord o‘rnatdi',
    excerpt:
      '18 yoshli sportchi o‘smirlar o‘rtasidagi rekordni 0,08 soniyaga yaxshiladi.',
    date: '20-sentabr 2026',
    image: '/images/sport/cat/yengil-atletika.jpg',
  },
]

// ===== Yangilik sahifasi (detail) uchun ma'lumotlar =====
export const allNews = [featuredNews, ...sideNews, ...latestNews]

const categoryTags = {
  Futbol: ['#Futbol', '#TermaJamoa', '#JCH2030'],
  Kurash: ['#Kurash', '#OsiyoChempionati'],
  Boks: ['#Boks', '#Reyting'],
  Infratuzilma: ['#SportMajmua', '#Toshkent'],
  Basketbol: ['#Basketbol', '#Superliga'],
  Tennis: ['#Tennis', '#Olmaota'],
  Velosport: ['#Velosport', '#IpakYoli'],
  Voleybol: ['#Voleybol', '#Chempionat'],
  'Sog‘lom turmush': ['#SoglomTurmush', '#Maslahat'],
  'Yengil atletika': ['#Atletika', '#Rekord'],
}

// Har bir yangilik uchun maqola matni: lid + paragraflar + iqtibos
const articleBodies = {
  'terma-jamoa-saralash': {
    lead:
      'O‘zbekiston terma jamoasi jahon chempionati saralash bosqichidagi navbatdagi uchrashuvda ishonchli g‘alabaga erishdi. Bu natija jamoaga guruhdagi yetakchilik pozitsiyasini mustahkamlash va final bosqichiga yo‘llanma uchun kurashni davom ettirish imkonini berdi.',
    paragraphs: [
      'O‘yin birinchi daqiqalardanoq faol kechdi. Jamoamiz to‘pni nazorat qilishda ustunlikka erishib, raqib darvozasi oldida bir necha xavfli vaziyat yaratdi. Birinchi bo‘limning o‘rtalarida aniq zarba hisobni ochdi, ikkinchi bo‘limda esa standart holatdan urilgan gol g‘alabani mustahkamladi.',
      'Bosh murabbiy uchrashuvdan so‘ng o‘tkazilgan matbuot anjumanida jamoaning taktik intizomi va himoyadagi o‘zaro hamjihatlikni alohida ta’kidladi. Uning so‘zlariga ko‘ra, so‘nggi oylardagi o‘quv-mashg‘ulot yig‘inlari o‘z samarasini bermoqda.',
      'Navbatdagi uchrashuv oktabr oxirida Toshkentdagi “Milliy” stadionida bo‘lib o‘tadi. Chiptalar savdosi yaqin kunlarda boshlanishi kutilmoqda, muxlislar uchun maxsus fan-zona ham tashkil etiladi.',
    ],
    quote: {
      text: 'Bugungi g‘alaba — butun jamoa va muxlislarimizning mehnati mevasi. Biz har bir o‘yinga final kabi tayyorlanamiz.',
      author: 'Terma jamoa bosh murabbiyi',
    },
  },
}

function buildBody(news) {
  if (articleBodies[news.id]) return articleBodies[news.id]
  return {
    lead: news.excerpt,
    paragraphs: [
      `${news.title}. Ushbu voqea ${news.category.toLowerCase()} ixlosmandlari va mutaxassislar tomonidan katta qiziqish bilan kutib olindi. Tashkilotchilar tadbirni yuqori saviyada o‘tkazish uchun barcha sharoitlarni yaratishgan.`,
      'Federatsiya vakillarining ta’kidlashicha, so‘nggi yillarda sport infratuzilmasiga kiritilgan investitsiyalar va yosh sportchilarni qo‘llab-quvvatlash dasturlari natijasida ko‘rsatkichlar barqaror o‘sib bormoqda.',
      'Kelgusi oylarda shu yo‘nalishda yangi musobaqalar, ochiq mashg‘ulotlar va master-klasslar rejalashtirilgan. Ularga ro‘yxatdan o‘tish va maydonlarni bron qilish SportON platformasi orqali amalga oshiriladi.',
    ],
    quote: {
      text: 'Bizning asosiy maqsadimiz — sportni har bir oila uchun ochiq va qulay qilish. Bugungi natijalar bu yo‘lda to‘g‘ri harakatlanayotganimizni ko‘rsatadi.',
      author: `${news.category} federatsiyasi matbuot xizmati`,
    },
  }
}

export function getNewsById(id) {
  const news = allNews.find((n) => n.id === id)
  if (!news) return null
  const index = allNews.indexOf(news)
  const body = news.body?.lead ? news.body : buildBody(news)
  const words = [body.lead, ...body.paragraphs].join(' ').split(/\s+/).length
  return {
    ...news,
    author: { name: news.authorName ?? 'SportON tahririyati', role: 'Sport muxbiri' },
    readTime: Math.max(1, Math.round(words / 180)),
    views: news.views ?? 0,
    likes: 0,
    caption: news.imageCaption || `${news.category}: voqeadan lavha`,
    gallery: news.gallery ?? [],
    tags: news.tags?.length ? news.tags : (categoryTags[news.category] ?? ['#Sport']),
    body,
    prev: allNews[index - 1] ?? null,
    next: allNews[index + 1] ?? null,
  }
}

export function getRelatedNews(id, limit = 3) {
  return allNews.filter((n) => n.id !== id).slice(0, limit)
}

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']

/** Date → «3-oktabr 2026» (Toshkent vaqti) */
export function formatNewsDate(value) {
  const d = new Date(new Date(value).getTime() + 5 * 3_600_000)
  return `${d.getUTCDate()}-${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** «3 daqiqa oldin», «2 soat oldin» yoki sana */
export function formatRelative(value) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000
  if (diff < 60) return 'Hozirgina'
  if (diff < 3600) return `${Math.floor(diff / 60)} daqiqa oldin`
  if (diff < 86400) return `${Math.floor(diff / 3600)} soat oldin`
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} kun oldin`
  return formatNewsDate(value)
}

/**
 * API’dan kelgan yangiliklar bilan ro‘yxatlarni joyida almashtiradi.
 * Tartib: bosh yangilik → 3 ta yon yangilik → qolgani lentada.
 */
export function hydrateNews(list) {
  if (!list.length) return
  const items = list.map((n) => ({
    id: n.id,
    category: n.category,
    title: n.title,
    excerpt: n.excerpt,
    date: formatNewsDate(n.publishedAt),
    image: n.image ?? '/images/sport/cat/boshqa.jpg',
    imageCaption: n.imageCaption ?? null,
    gallery: n.gallery ?? [],
    body: n.body,
    tags: n.tags,
    views: n.views,
    authorName: n.authorName,
    commentsCount: n.comments ?? 0,
  }))
  const featuredSource = list.find((n) => n.featured) ?? list[0]
  const featured = items[list.indexOf(featuredSource)]
  const rest = items.filter((n) => n.id !== featuredSource.id)
  for (const key of Object.keys(featuredNews)) if (key !== 'badge') delete featuredNews[key]
  Object.assign(featuredNews, featured, { id: featuredSource.id, badge: 'Bosh yangilik' })
  sideNews.splice(0, sideNews.length, ...rest.slice(0, 3))
  latestNews.splice(0, latestNews.length, ...rest.slice(3))
  allNews.splice(0, allNews.length, featuredNews, ...sideNews, ...latestNews)
  newsTicker.splice(0, newsTicker.length, ...items.slice(0, 5).map((n) => n.title))
}
