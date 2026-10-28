import { formatDayMonth, tr } from '../i18n/index.js'
// Sport yangiliklari: bosh yangilik, yon ro‘yxat, lenta va karusel
export const featuredNews = {
  id: 'terma-jamoa-saralash',
  badge: tr('Bosh yangilik'),
  category: 'Futbol',
  title: tr('O‘zbekiston terma jamoasi jahon chempionati saralashida g‘alaba qozondi'),
  excerpt:
    tr('Bosh murabbiy o‘yindan keyin jamoaning taktik intizomini alohida ta’kidladi. Navbatdagi uchrashuv oktabr oxirida Toshkentda bo‘lib o‘tadi.'),
  date: tr('3-oktabr 2026'),
  image: '/images/sport/cat/futbol.webp',
}

export const sideNews = [
  {
    id: 'kurash-osiyo',
    category: 'Kurash',
    title: tr('Kurashchilarimiz Osiyo chempionatida 3 ta oltin oldi'),
    excerpt:
      tr('Terma jamoa umumjamoa hisobida birinchi o‘rinni egalladi. G‘oliblar Toshkentda tantanali kutib olindi.'),
    date: tr('2-oktabr 2026'),
    image: '/images/sport/cat/kurash.webp',
  },
  {
    id: 'boks-reyting',
    category: 'Boks',
    title: tr('O‘zbek bokschilari jahon reytingida yuqorilab bormoqda'),
    excerpt:
      tr('AIBA yangi reytingida uchta vaznda vakillarimiz kuchli beshlikdan joy oldi. Mutaxassislar fikri bilan tanishing.'),
    date: tr('1-oktabr 2026'),
    image: '/images/sport/cat/boks.webp',
  },
  {
    id: 'yangi-majmua',
    category: 'Infratuzilma',
    title: tr('Toshkentda yangi ko‘p tarmoqli sport majmuasi ochildi'),
    excerpt:
      tr('Suzish havzasi, 2 ta mini-futbol maydoni va zamonaviy trenajyor zali. Bronlar SportON orqali qabul qilinmoqda.'),
    date: tr('30-sentabr 2026'),
    image: '/images/sport/cat/suzish.webp',
  },
]

export const newsTicker = [
  tr('Toshkent xalqaro marafoniga ro‘yxatdan o‘tish davom etmoqda'),
  tr('Basketbol bo‘yicha Superliga yangi mavsumi 15-oktabrda start oladi'),
  tr('O‘zbekiston terma jamoasi saralashda g‘alaba qozondi'),
  tr('Tennischilarimiz Olmaota turnirida finalga chiqdi'),
  tr('Yangi sport majmuasida bepul ochiq mashg‘ulotlar boshlandi'),
]

export const latestNews = [
  {
    id: 'basketbol-superliga',
    category: 'Basketbol',
    title: tr('Basketbol Superligasi yangi mavsumi taqvimi e’lon qilindi'),
    excerpt:
      tr('12 ta jamoa ikki davrada bellashadi. Ilk turda amaldagi chempion uyida mehmonlarni qabul qiladi.'),
    date: tr('29-sentabr 2026'),
    image: '/images/sport/cat/basketbol.webp',
  },
  {
    id: 'tennis-olmaota',
    category: 'Tennis',
    title: tr('Tennischilarimiz Olmaota turnirida finalga yo‘l oldi'),
    excerpt:
      tr('Juftlik bahslarida vakillarimiz yarim finalda reyting bo‘yicha ikkinchi juftlikni mag‘lub etdi.'),
    date: tr('28-sentabr 2026'),
    image: '/images/sport/cat/tennis.webp',
  },
  {
    id: 'velosport-tur',
    category: 'Velosport',
    title: tr('Samarqand–Buxoro velopoygasiga 200 dan ortiq ishtirokchi yozildi'),
    excerpt:
      tr('Ko‘p kunlik poyga Buyuk ipak yo‘li bo‘ylab o‘tadi. Havaskorlar uchun alohida qisqa masofa ham bor.'),
    date: tr('26-sentabr 2026'),
    image: '/images/sport/cat/velosport.webp',
  },
  {
    id: 'voleybol-chempionat',
    category: 'Voleybol',
    title: tr('Ayollar voleyboli bo‘yicha mamlakat chempionati boshlandi'),
    excerpt:
      tr('Turnirda 10 ta jamoa ishtirok etmoqda. O‘yinlar Toshkent va Namangan sport saroylarida bo‘ladi.'),
    date: tr('24-sentabr 2026'),
    image: '/images/sport/cat/voleybol.webp',
  },
  {
    id: 'yoga-maslahat',
    category: 'Sog‘lom turmush',
    title: tr('Haftasiga necha marta mashq qilish kerak? Mutaxassis javob beradi'),
    excerpt:
      tr('Boshlang‘ich daraja uchun optimal rejim, tiklanish va uyqu haqida amaliy tavsiyalar.'),
    date: tr('22-sentabr 2026'),
    image: '/images/sport/cat/yoga.webp',
  },
  {
    id: 'atletika-rekord',
    category: 'Yengil atletika',
    title: tr('Yosh sprinter 100 metrga yugurishda milliy rekord o‘rnatdi'),
    excerpt:
      tr('18 yoshli sportchi o‘smirlar o‘rtasidagi rekordni 0,08 soniyaga yaxshiladi.'),
    date: tr('20-sentabr 2026'),
    image: '/images/sport/cat/yengil-atletika.webp',
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
      tr('O‘zbekiston terma jamoasi jahon chempionati saralash bosqichidagi navbatdagi uchrashuvda ishonchli g‘alabaga erishdi. Bu natija jamoaga guruhdagi yetakchilik pozitsiyasini mustahkamlash va final bosqichiga yo‘llanma uchun kurashni davom ettirish imkonini berdi.'),
    paragraphs: [
      tr('O‘yin birinchi daqiqalardanoq faol kechdi. Jamoamiz to‘pni nazorat qilishda ustunlikka erishib, raqib darvozasi oldida bir necha xavfli vaziyat yaratdi. Birinchi bo‘limning o‘rtalarida aniq zarba hisobni ochdi, ikkinchi bo‘limda esa standart holatdan urilgan gol g‘alabani mustahkamladi.'),
      tr('Bosh murabbiy uchrashuvdan so‘ng o‘tkazilgan matbuot anjumanida jamoaning taktik intizomi va himoyadagi o‘zaro hamjihatlikni alohida ta’kidladi. Uning so‘zlariga ko‘ra, so‘nggi oylardagi o‘quv-mashg‘ulot yig‘inlari o‘z samarasini bermoqda.'),
      tr('Navbatdagi uchrashuv oktabr oxirida Toshkentdagi “Milliy” stadionida bo‘lib o‘tadi. Chiptalar savdosi yaqin kunlarda boshlanishi kutilmoqda, muxlislar uchun maxsus fan-zona ham tashkil etiladi.'),
    ],
    quote: {
      text: tr('Bugungi g‘alaba — butun jamoa va muxlislarimizning mehnati mevasi. Biz har bir o‘yinga final kabi tayyorlanamiz.'),
      author: tr('Terma jamoa bosh murabbiyi'),
    },
  },
}

function buildBody(news) {
  if (articleBodies[news.id]) return articleBodies[news.id]
  return {
    lead: news.excerpt,
    paragraphs: [
      `${news.title}. ${tr('Ushbu voqea {category} ixlosmandlari va mutaxassislar tomonidan katta qiziqish bilan kutib olindi. Tashkilotchilar tadbirni yuqori saviyada o‘tkazish uchun barcha sharoitlarni yaratishgan.', { category: tr(news.category).toLowerCase() })}`,
      tr('Federatsiya vakillarining ta’kidlashicha, so‘nggi yillarda sport infratuzilmasiga kiritilgan investitsiyalar va yosh sportchilarni qo‘llab-quvvatlash dasturlari natijasida ko‘rsatkichlar barqaror o‘sib bormoqda.'),
      tr('Kelgusi oylarda shu yo‘nalishda yangi musobaqalar, ochiq mashg‘ulotlar va master-klasslar rejalashtirilgan. Ularga ro‘yxatdan o‘tish va maydonlarni bron qilish SportON platformasi orqali amalga oshiriladi.'),
    ],
    quote: {
      text: tr('Bizning asosiy maqsadimiz — sportni har bir oila uchun ochiq va qulay qilish. Bugungi natijalar bu yo‘lda to‘g‘ri harakatlanayotganimizni ko‘rsatadi.'),
      author: tr('{category} federatsiyasi matbuot xizmati', { category: tr(news.category) }),
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
    author: { name: news.authorName ?? tr('SportON tahririyati'), role: tr('Sport muxbiri') },
    readTime: Math.max(1, Math.round(words / 180)),
    views: news.views ?? 0,
    likes: 0,
    caption: news.imageCaption || `${tr(news.category)}: ${tr('voqeadan lavha')}`,
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

/** Date → «3-oktabr 2026» (Toshkent vaqti) */
export function formatNewsDate(value) {
  const d = new Date(new Date(value).getTime() + 5 * 3_600_000)
  return `${formatDayMonth(d.getUTCDate(), d.getUTCMonth())} ${d.getUTCFullYear()}`
}

/** «3 daqiqa oldin», «2 soat oldin» yoki sana */
export function formatRelative(value) {
  const diff = (Date.now() - new Date(value).getTime()) / 1000
  if (diff < 60) return tr('Hozirgina')
  if (diff < 3600) return tr('{n} daqiqa oldin', { n: Math.floor(diff / 60) })
  if (diff < 86400) return tr('{n} soat oldin', { n: Math.floor(diff / 3600) })
  if (diff < 7 * 86400) return tr('{n} kun oldin', { n: Math.floor(diff / 86400) })
  return formatNewsDate(value)
}

/**
 * API’dan kelgan yangiliklar bilan ro‘yxatlarni joyida almashtiradi.
 * Tartib: bosh yangilik → 3 ta yon yangilik → qolgani lentada.
 */
export function hydrateNews(list) {
  if (!list.length) {
    // Bazada yangilik yo‘q — namuna yangiliklar haqiqiydek ko‘rsatilmaydi, bo‘lim yashiriladi
    for (const key of Object.keys(featuredNews)) delete featuredNews[key]
    for (const arr of [sideNews, latestNews, allNews, newsTicker]) arr.splice(0, arr.length)
    return
  }
  const items = list.map((n) => ({
    id: n.id,
    category: n.category,
    title: n.title,
    excerpt: n.excerpt,
    date: formatNewsDate(n.publishedAt),
    image: n.image ?? '/images/sport/cat/boshqa.webp',
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
  Object.assign(featuredNews, featured, { id: featuredSource.id, badge: tr('Bosh yangilik') })
  sideNews.splice(0, sideNews.length, ...rest.slice(0, 3))
  latestNews.splice(0, latestNews.length, ...rest.slice(3))
  allNews.splice(0, allNews.length, featuredNews, ...sideNews, ...latestNews)
  newsTicker.splice(0, newsTicker.length, ...items.slice(0, 5).map((n) => n.title))
}
