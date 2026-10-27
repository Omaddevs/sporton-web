import { tr } from '../i18n/index.js'
// Bosh sahifadagi sport turlari kartochkalari (6 + 6 + «Barcha sport turlari»)

export const categories = [
  {
    id: 'futbol',
    title: tr('Futbol'),
    accent: 'var(--color-accent)',
    image: '/images/sport/cat/futbol.png',
    cutout: true,
  },
  {
    id: 'basketbol',
    title: tr('Basketbol'),
    accent: 'var(--color-primary)',
    // Fonsiz PNG: o‘ngda figura, orqasida rangli doira
    image: '/images/sport/cat/basketbol.png',
    cutout: true,
  },
  {
    id: 'tennis',
    title: tr('Tennis'),
    accent: '#2ec4b6',
    image: '/images/sport/cat/tennis.png',
    cutout: true,
  },
  {
    id: 'suzish',
    title: tr('Suzish'),
    accent: '#29b6f6',
    image: '/images/sport/cat/suzish.png',
    cutout: true,
  },
  {
    id: 'fitnes',
    title: tr('Fitnes va trenajyor zal'),
    accent: '#8b5cf6',
    image: '/images/sport/cat/fitnes.png',
    cutout: true,
  },
  {
    id: 'boks',
    title: tr('Boks va MMA'),
    accent: '#ef4444',
    image: '/images/sport/cat/boks.png',
    cutout: true,
  },
  {
    id: 'kurash',
    title: tr('Kurash va yakkakurash'),
    accent: '#f59e0b',
    image: '/images/sport/cat/kurash.png',
    cutout: true,
    // Uzun sarlavha uchun figura kichikroq va o‘ngroqda
    cutoutStyle: { height: '100%', right: '2%' },
    blobStyle: { right: '0%', width: '50%' },
  },
  {
    id: 'voleybol',
    title: tr('Voleybol'),
    accent: '#ffc83d',
    image: '/images/sport/cat/voleybol.png',
    cutout: true,
  },
  {
    id: 'yoga',
    title: tr('Yoga va pilates'),
    accent: '#ec4899',
    image: '/images/sport/cat/yoga.png',
    cutout: true,
    // Ikki qatorli sarlavha uchun figura kichikroq va o‘ngroqda
    cutoutStyle: { height: '100%', right: '2%' },
    blobStyle: { right: '0%', width: '50%' },
  },
  {
    id: 'yengil-atletika',
    title: tr('Yugurish va atletika'),
    accent: '#14b8a6',
    image: '/images/sport/cat/yengil-atletika.png',
    cutout: true,
    // Ikki qatorli sarlavha uchun figura kichikroq va o‘ngroqda
    cutoutStyle: { height: '100%', right: '2%' },
    blobStyle: { right: '0%', width: '50%' },
  },
  {
    id: 'velosport',
    title: tr('Velosport'),
    accent: '#ff8a3d',
    image: '/images/sport/cat/velosport.png',
    cutout: true,
  },
  {
    id: 'boshqa',
    title: tr('Boshqa sport turlari'),
    accent: '#6366f1',
    image: '/images/sport/cat/boshqa.png',
    cutout: true,
    // Uch qatorli sarlavha uchun figura kichikroq va o‘ngroqda
    cutoutStyle: { height: '100%', right: '2%' },
    blobStyle: { right: '0%', width: '50%' },
  },
]
