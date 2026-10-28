import { formatDayMonth, tr } from '../i18n/index.js'
// @sporton.uz Instagram sahifasidagi Reels videolar — admin paneldan boshqariladi (Admin → Reels).
// Pastdagi ro‘yxat faqat lokal ishlab chiqishda (API ishlamasa) ko‘rsatiladi.
export const INSTAGRAM_PROFILE = 'https://www.instagram.com/sporton.uz/'
export const INSTAGRAM_REELS = `${INSTAGRAM_PROFILE}reels/`

const cover = (code) => `/images/sport/reels/ig/${code}.webp`

export const reelUrl = (code) => `https://www.instagram.com/reel/${code}/`
export const reelEmbedUrl = (code) => `https://www.instagram.com/reel/${code}/embed/`

export const reels = [
  {
    code: 'DR_fqnciKP9',
    title: tr('“Rektor Kubogi”: jamoamiz vakili 1-o‘rinni qo‘lga kiritdi! 🏆'),
    tag: tr('Musobaqa'),
    tagTone: 'orange',
    date: tr('8-dekabr, 2025'),
    likes: '1.2K',
    comments: '57',
    image: cover('DR_fqnciKP9'),
  },
  {
    code: 'DRpWj9ziMcW',
    title: tr('MMA — faqat kuch emas, xarakter! 🥊'),
    tag: tr('Yakkakurash'),
    tagTone: 'purple',
    date: tr('29-noyabr, 2025'),
    likes: '262',
    comments: '35',
    image: cover('DRpWj9ziMcW'),
  },
  {
    code: 'DQ13t1OiE75',
    title: tr('Maxsus ssenariy asosidagi video — xavfsizlikni unutmang!'),
    tag: tr('Lavha'),
    tagTone: 'pink',
    date: tr('9-noyabr, 2025'),
    likes: '151',
    comments: '66',
    image: cover('DQ13t1OiE75'),
  },
  {
    code: 'DQIgXD4iBAO',
    title: tr('Trener yoki murabbiymisiz? Bu video aynan siz uchun! 💪'),
    tag: tr('Murabbiylar uchun'),
    tagTone: 'teal',
    date: tr('23-oktabr, 2025'),
    likes: '137',
    comments: '20',
    image: cover('DQIgXD4iBAO'),
  },
  {
    code: 'DPOznbxCEeA',
    title: tr('SportON da yangi marralarga qadam qo‘y!'),
    tag: tr('SportON'),
    tagTone: 'blue',
    date: tr('30-sentabr, 2025'),
    likes: '92',
    comments: '9',
    image: cover('DPOznbxCEeA'),
  },
]

const formatDay = (iso) => {
  const [y, m, d] = (iso ?? '').split('-').map(Number)
  return y && m && d ? `${formatDayMonth(d, m - 1)}, ${y}` : ''
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
