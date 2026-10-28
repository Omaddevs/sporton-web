import { allNews, getNewsById } from './news.js'
import { blogPosts } from './explore.js'
import { categoryMenuById } from './categoryMenu.js'
import { tr } from '../i18n/index.js'

/**
 * Sport turi bo‘yicha yangiliklar va blog maqolalari.
 * Kategoriya sahifasidagi «Yangiliklar va blog» tabi hamda yangilik detail sahifasi
 * (blog va kategoriyaga xos maqolalar ham /yangilik/:id orqali ochiladi) uchun.
 */

const SPORT_IMAGE = {
  'stol-tennisi': 'tennis',
  padel: 'tennis',
  shaxmat: 'boshqa',
}

const imageFor = (sportId) => `/images/sport/cat/${SPORT_IMAGE[sportId] ?? sportId}.webp`

// Mavjud yangilik/blog yozuvlari qaysi sport turlariga tegishli
const NEWS_SPORTS = {
  Futbol: ['futbol'],
  Kurash: ['kurash'],
  Boks: ['boks'],
  Infratuzilma: ['suzish', 'futbol', 'fitnes'],
  Basketbol: ['basketbol'],
  Tennis: ['tennis', 'stol-tennisi', 'padel'],
  Velosport: ['velosport'],
  Voleybol: ['voleybol'],
  'Sog‘lom turmush': ['yoga', 'fitnes'],
  'Yengil atletika': ['yengil-atletika'],
}

const BLOG_SPORTS = {
  'mashqdan-oldin-razminka': ['fitnes', 'yengil-atletika', 'futbol'],
  'maydon-tanlash': ['futbol'],
  'suzish-boshlovchilar': ['suzish'],
  'yoga-ofis': ['yoga'],
}

// Ayrim sport turlari uchun qo‘lda yozilgan maqolalar; qolganlari shablondan yig‘iladi
const CUSTOM_ARTICLES = {
  suzish: [
    {
      slug: 'rekordlar',
      kind: 'news',
      title: tr('Suzish bo‘yicha O‘zbekiston chempionatida 4 ta milliy rekord yangilandi'),
      excerpt:
        tr('Toshkentdagi 50 metrli havzada o‘tgan chempionatda yosh suzuvchilar erkin usul va brass masofalarida yangi rekordlar o‘rnatdi.'),
      date: tr('2-oktabr 2026'),
    },
    {
      slug: 'bepul-darslar',
      kind: 'news',
      title: tr('Poytaxt havzalarida bolalar uchun bepul sinov darslari boshlandi'),
      excerpt:
        tr('Oktabr oyi davomida 6 yoshdan 12 yoshgacha bo‘lgan bolalar hamkor majmualarda birinchi darsni bepul o‘tishi mumkin.'),
      date: tr('29-sentabr 2026'),
    },
    {
      slug: 'havzaga-birinchi-marta',
      kind: 'blog',
      title: tr('Havzaga birinchi marta: o‘zingiz bilan nimalarni olish kerak'),
      excerpt:
        tr('Shapka, ko‘zoynak, shippak va gigiyena vositalari — birinchi mashg‘ulotga tayyorgarlikning qisqa ro‘yxati.'),
      date: tr('25-sentabr 2026'),
      tag: tr('Qo‘llanma'),
    },
  ],
}

function templateArticles(title) {
  return [
    {
      slug: 'ochiq-chempionat',
      kind: 'news',
      title: tr('{title} bo‘yicha Toshkent ochiq chempionatiga ro‘yxatdan o‘tish boshlandi', { title }),
      excerpt:
        tr('Musobaqa havaskorlar va professionallar uchun alohida toifalarda o‘tadi. Arizalar 20-oktabrgacha qabul qilinadi.'),
      date: tr('2-oktabr 2026'),
    },
    {
      slug: 'yangi-mavsum',
      kind: 'news',
      title: tr('Yangi mavsum: «{title}» seksiyalariga qabul davom etmoqda', { title }),
      excerpt:
        tr('Poytaxtdagi hamkor majmualarda kattalar va bolalar uchun yangi guruhlar ochildi, birinchi darslar chegirma bilan.'),
      date: tr('28-sentabr 2026'),
    },
    {
      slug: 'boshlovchilar-uchun',
      kind: 'blog',
      title: tr('«{title}»: yangi boshlovchilar uchun to‘liq qo‘llanma', { title }),
      excerpt:
        tr('Qaysi inventar kerak, haftasiga necha marta shug‘ullanish va dastlabki natijani qachon kutish mumkin.'),
      date: tr('24-sentabr 2026'),
      tag: tr('Qo‘llanma'),
    },
    {
      slug: 'murabbiy-tanlash',
      kind: 'blog',
      title: tr('{title}: to‘g‘ri murabbiyni qanday tanlash kerak?', { title }),
      excerpt:
        tr('Tajriba, sertifikatlar, shogirdlar natijalari va sinov darsi — tanlov oldidan tekshirish kerak bo‘lgan 5 jihat.'),
      date: tr('18-sentabr 2026'),
      tag: tr('Maslahat'),
    },
  ]
}

function generatedFor(categoryId) {
  const category = categoryMenuById[categoryId]
  // «Boshqa» umumiy bo‘lim — unga shablon maqolalar mos kelmaydi
  if (!category || categoryId === 'boshqa') return []
  // Shablon «yangilik»lar haqiqiy voqea emas — faqat umumiy qo‘llanma (blog) maqolalari ko‘rsatiladi
  const source = (CUSTOM_ARTICLES[categoryId] ?? templateArticles(category.title)).filter((item) => item.kind !== 'news')

  return source.map((item, index) => ({
    id: `${categoryId}-${item.slug}`,
    kind: item.kind,
    sportId: categoryId,
    category: category.title,
    tag: item.kind === 'news' ? category.title : item.tag,
    title: item.title,
    excerpt: item.excerpt,
    date: item.date,
    image: imageFor(categoryId),
    readTime: 4 + (index % 3),
    author:
      item.kind === 'news'
        ? { name: tr('SportON tahririyati'), role: tr('Sport muxbiri') }
        : { name: item.author ?? tr('SportON jamoasi'), role: item.authorRole ?? tr('{title} murabbiyi', { title: category.title }) },
  }))
}

function fromNews(news) {
  return {
    id: news.id,
    kind: 'news',
    category: news.category,
    tag: news.category,
    title: news.title,
    excerpt: news.excerpt,
    date: news.date,
    image: news.image,
    readTime: 4,
    author: { name: tr('SportON tahririyati'), role: tr('Sport muxbiri') },
  }
}

function fromBlog(post) {
  return {
    id: post.id,
    kind: 'blog',
    category: post.tag,
    tag: post.tag,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    image: post.image,
    readTime: post.readTime,
    author: { name: post.author, role: post.authorRole },
    content: post.content,
  }
}

/** Sport turiga tegishli barcha maqolalar: avval yangiliklar, keyin blog (sana bo‘yicha) */
export function getCategoryArticles(categoryId) {
  const generated = generatedFor(categoryId)
  const news = allNews.filter((n) => NEWS_SPORTS[n.category]?.includes(categoryId)).map(fromNews)
  const blogs = blogPosts.filter((p) => BLOG_SPORTS[p.id]?.includes(categoryId)).map(fromBlog)

  const all = [...generated, ...news, ...blogs]
  return [...all.filter((a) => a.kind === 'news'), ...all.filter((a) => a.kind === 'blog')]
}

function findExtraArticle(id) {
  const post = blogPosts.find((p) => p.id === id)
  if (post) return { ...fromBlog(post), siblings: blogPosts.map(fromBlog) }

  const categoryId = Object.keys(categoryMenuById).find((key) => id.startsWith(`${key}-`))
  if (!categoryId) return null
  const siblings = generatedFor(categoryId)
  const article = siblings.find((a) => a.id === id)
  return article ? { ...article, siblings } : null
}

const hashtag = (text) =>
  `#${text
    .replace(/[‘’'`]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')}`

function buildBody(article) {
  if (article.content) {
    return {
      lead: article.excerpt,
      paragraphs: article.content.map((c) => `${c.heading}. ${c.body}`),
      quote: {
        text: tr('Eng muhimi — muntazamlik. Kichik, lekin har kungi qadamlar katta natijaga olib keladi.'),
        author: article.author.name,
      },
    }
  }
  return {
    lead: article.excerpt,
    paragraphs: [
      `${article.title}. ${tr('Mavzu {category} ixlosmandlari orasida katta qiziqish uyg‘otdi. Mutaxassislar bu yo‘nalishda so‘nggi yillarda sezilarli o‘sish kuzatilayotganini ta’kidlashmoqda.', { category: tr(article.category).toLowerCase() })}`,
      tr('Federatsiya va hamkor sport majmualari yosh sportchilarni qo‘llab-quvvatlash, murabbiylar malakasini oshirish va infratuzilmani kengaytirish bo‘yicha yangi dasturlarni amalga oshirmoqda.'),
      tr('Mashg‘ulotlarga yozilish, murabbiy tanlash va majmualarni bron qilish SportON platformasi orqali bir necha daqiqada amalga oshiriladi.'),
    ],
    quote: {
      text: tr('Sport har bir oila uchun ochiq va qulay bo‘lishi kerak. Biz shu maqsad sari ishlayapmiz.'),
      author: tr('{category} bo‘yicha mutaxassis', { category: tr(article.category) }),
    },
  }
}

/** Yangilik detail sahifasi uchun: oddiy yangiliklar, blog postlari va kategoriya maqolalari */
export function getArticleById(id) {
  if (allNews.some((n) => n.id === id)) return getNewsById(id)

  const extra = findExtraArticle(id)
  if (!extra) return null

  const { siblings, ...article } = extra
  const index = siblings.findIndex((a) => a.id === id)

  return {
    ...article,
    badge: article.kind === 'blog' ? tr('Blog') : undefined,
    views: 0,
    likes: 0,
    caption: `${tr(article.category)}: ${tr('mavzuga oid lavha')}`,
    tags: [hashtag(article.category), article.kind === 'blog' ? '#Blog' : '#Yangilik'],
    body: buildBody(article),
    prev: siblings[index - 1] ?? null,
    next: siblings[index + 1] ?? null,
  }
}
