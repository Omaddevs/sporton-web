import { allNews, getNewsById } from './news.js'
import { blogPosts } from './explore.js'
import { categoryMenuById } from './categoryMenu.js'

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

const imageFor = (sportId) => `/images/sport/cat/${SPORT_IMAGE[sportId] ?? sportId}.jpg`

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
      title: 'Suzish bo‘yicha O‘zbekiston chempionatida 4 ta milliy rekord yangilandi',
      excerpt:
        'Toshkentdagi 50 metrli havzada o‘tgan chempionatda yosh suzuvchilar erkin usul va brass masofalarida yangi rekordlar o‘rnatdi.',
      date: '2-oktabr 2026',
    },
    {
      slug: 'bepul-darslar',
      kind: 'news',
      title: 'Poytaxt havzalarida bolalar uchun bepul sinov darslari boshlandi',
      excerpt:
        'Oktabr oyi davomida 6 yoshdan 12 yoshgacha bo‘lgan bolalar hamkor majmualarda birinchi darsni bepul o‘tishi mumkin.',
      date: '29-sentabr 2026',
    },
    {
      slug: 'havzaga-birinchi-marta',
      kind: 'blog',
      title: 'Havzaga birinchi marta: o‘zingiz bilan nimalarni olish kerak',
      excerpt:
        'Shapka, ko‘zoynak, shippak va gigiyena vositalari — birinchi mashg‘ulotga tayyorgarlikning qisqa ro‘yxati.',
      date: '25-sentabr 2026',
      tag: 'Qo‘llanma',
      author: 'Madina Rasulova',
      authorRole: 'Suzish murabbiyi',
    },
  ],
}

function templateArticles(title) {
  return [
    {
      slug: 'ochiq-chempionat',
      kind: 'news',
      title: `${title} bo‘yicha Toshkent ochiq chempionatiga ro‘yxatdan o‘tish boshlandi`,
      excerpt:
        'Musobaqa havaskorlar va professionallar uchun alohida toifalarda o‘tadi. Arizalar 20-oktabrgacha qabul qilinadi.',
      date: '2-oktabr 2026',
    },
    {
      slug: 'yangi-mavsum',
      kind: 'news',
      title: `Yangi mavsum: «${title}» seksiyalariga qabul davom etmoqda`,
      excerpt:
        'Poytaxtdagi hamkor majmualarda kattalar va bolalar uchun yangi guruhlar ochildi, birinchi darslar chegirma bilan.',
      date: '28-sentabr 2026',
    },
    {
      slug: 'boshlovchilar-uchun',
      kind: 'blog',
      title: `«${title}»: yangi boshlovchilar uchun to‘liq qo‘llanma`,
      excerpt:
        'Qaysi inventar kerak, haftasiga necha marta shug‘ullanish va dastlabki natijani qachon kutish mumkin.',
      date: '24-sentabr 2026',
      tag: 'Qo‘llanma',
    },
    {
      slug: 'murabbiy-tanlash',
      kind: 'blog',
      title: `${title}: to‘g‘ri murabbiyni qanday tanlash kerak?`,
      excerpt:
        'Tajriba, sertifikatlar, shogirdlar natijalari va sinov darsi — tanlov oldidan tekshirish kerak bo‘lgan 5 jihat.',
      date: '18-sentabr 2026',
      tag: 'Maslahat',
    },
  ]
}

function generatedFor(categoryId) {
  const category = categoryMenuById[categoryId]
  // «Boshqa» umumiy bo‘lim — unga shablon maqolalar mos kelmaydi
  if (!category || categoryId === 'boshqa') return []
  const source = CUSTOM_ARTICLES[categoryId] ?? templateArticles(category.title)

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
        ? { name: 'SportON tahririyati', role: 'Sport muxbiri' }
        : { name: item.author ?? 'SportON jamoasi', role: item.authorRole ?? `${category.title} murabbiyi` },
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
    author: { name: 'SportON tahririyati', role: 'Sport muxbiri' },
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
        text: 'Eng muhimi — muntazamlik. Kichik, lekin har kungi qadamlar katta natijaga olib keladi.',
        author: article.author.name,
      },
    }
  }
  return {
    lead: article.excerpt,
    paragraphs: [
      `${article.title}. Mavzu ${article.category.toLowerCase()} ixlosmandlari orasida katta qiziqish uyg‘otdi. Mutaxassislar bu yo‘nalishda so‘nggi yillarda sezilarli o‘sish kuzatilayotganini ta’kidlashmoqda.`,
      'Federatsiya va hamkor sport majmualari yosh sportchilarni qo‘llab-quvvatlash, murabbiylar malakasini oshirish va infratuzilmani kengaytirish bo‘yicha yangi dasturlarni amalga oshirmoqda.',
      'Mashg‘ulotlarga yozilish, murabbiy tanlash va majmualarni bron qilish SportON platformasi orqali bir necha daqiqada amalga oshiriladi.',
    ],
    quote: {
      text: 'Sport har bir oila uchun ochiq va qulay bo‘lishi kerak. Biz shu maqsad sari ishlayapmiz.',
      author: `${article.category} bo‘yicha mutaxassis`,
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
    badge: article.kind === 'blog' ? 'Blog' : undefined,
    views: 0,
    likes: 0,
    caption: `${article.category}: mavzuga oid lavha`,
    tags: [hashtag(article.category), article.kind === 'blog' ? '#Blog' : '#Yangilik'],
    body: buildBody(article),
    prev: siblings[index - 1] ?? null,
    next: siblings[index + 1] ?? null,
  }
}
