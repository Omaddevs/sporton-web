// @sporton.uz Instagram sahifasidagi Reels videolar — admin paneldan boshqariladi (Admin → Reels).
// Pastdagi ro‘yxat faqat lokal ishlab chiqishda (API ishlamasa) ko‘rsatiladi.
export const INSTAGRAM_PROFILE = 'https://www.instagram.com/sporton.uz/'
export const INSTAGRAM_REELS = `${INSTAGRAM_PROFILE}reels/`

const cover = (code) => `/images/sport/reels/ig/${code}.jpg`

export const reelUrl = (code) => `https://www.instagram.com/reel/${code}/`
export const reelEmbedUrl = (code) => `https://www.instagram.com/reel/${code}/embed/`

export const reels = [
  {
    code: 'DR_fqnciKP9',
    title: '“Rektor Kubogi”: jamoamiz vakili 1-o‘rinni qo‘lga kiritdi! 🏆',
    tag: 'Musobaqa',
    tagTone: 'orange',
    date: '8-dekabr, 2025',
    likes: '1.2K',
    comments: '57',
    image: cover('DR_fqnciKP9'),
  },
  {
    code: 'DRpWj9ziMcW',
    title: 'MMA — faqat kuch emas, xarakter! 🥊',
    tag: 'Yakkakurash',
    tagTone: 'purple',
    date: '29-noyabr, 2025',
    likes: '262',
    comments: '35',
    image: cover('DRpWj9ziMcW'),
  },
  {
    code: 'DQ13t1OiE75',
    title: 'Maxsus ssenariy asosidagi video — xavfsizlikni unutmang!',
    tag: 'Lavha',
    tagTone: 'pink',
    date: '9-noyabr, 2025',
    likes: '151',
    comments: '66',
    image: cover('DQ13t1OiE75'),
  },
  {
    code: 'DQIgXD4iBAO',
    title: 'Trener yoki murabbiymisiz? Bu video aynan siz uchun! 💪',
    tag: 'Murabbiylar uchun',
    tagTone: 'teal',
    date: '23-oktabr, 2025',
    likes: '137',
    comments: '20',
    image: cover('DQIgXD4iBAO'),
  },
  {
    code: 'DPOznbxCEeA',
    title: 'SportON da yangi marralarga qadam qo‘y!',
    tag: 'SportON',
    tagTone: 'blue',
    date: '30-sentabr, 2025',
    likes: '92',
    comments: '9',
    image: cover('DPOznbxCEeA'),
  },
]

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']
const formatDay = (iso) => {
  const [y, m, d] = (iso ?? '').split('-').map(Number)
  return y && m && d ? `${d}-${MONTHS[m - 1]}, ${y}` : ''
}

/** Admin paneldagi Reels bilan ro‘yxatni joyida almashtiradi (bo‘sh — bo‘lim ko‘rinmaydi) */
export function hydrateReels(list) {
  reels.splice(
    0,
    reels.length,
    ...list.map((r) => ({
      code: r.code,
      title: r.title,
      tag: r.tag,
      tagTone: r.tagTone,
      date: formatDay(r.publishedOn),
      image: r.cover,
      // Saytda o‘ynatiladigan mp4; bo‘lmasa Instagram embed
      video: r.video || null,
    })),
  )
}
