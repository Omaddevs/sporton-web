// Bosh sahifadagi sport turlari kartochkalari (6 + 6 + «Barcha sport turlari»)

export const categories = [
  {
    id: 'futbol',
    title: 'Futbol',
    accent: 'var(--color-accent)',
    image: '/images/sport/cat/futbol.png',
    cutout: true,
  },
  {
    id: 'basketbol',
    title: 'Basketbol',
    accent: 'var(--color-primary)',
    // Fonsiz PNG: o‘ngda figura, orqasida rangli doira
    image: '/images/sport/cat/basketbol.png',
    cutout: true,
  },
  {
    id: 'tennis',
    title: 'Tennis',
    accent: '#2ec4b6',
    image: '/images/sport/cat/tennis.png',
    cutout: true,
  },
  {
    id: 'suzish',
    title: 'Suzish',
    accent: '#29b6f6',
    image: '/images/sport/cat/suzish.png',
    cutout: true,
  },
  {
    id: 'fitnes',
    title: 'Fitnes va trenajyor zal',
    accent: '#8b5cf6',
    image: '/images/sport/cat/fitnes.png',
    cutout: true,
  },
  {
    id: 'boks',
    title: 'Boks va MMA',
    accent: '#ef4444',
    image: '/images/sport/cat/boks.png',
    cutout: true,
  },
  {
    id: 'kurash',
    title: 'Kurash va yakkakurash',
    accent: '#f59e0b',
    image: '/images/sport/cat/kurash.png',
    cutout: true,
    // Uzun sarlavha uchun figura kichikroq va o‘ngroqda
    cutoutStyle: { height: '100%', right: '2%' },
    blobStyle: { right: '0%', width: '50%' },
  },
  {
    id: 'voleybol',
    title: 'Voleybol',
    accent: '#ffc83d',
    image: '/images/sport/cat/voleybol.png',
    cutout: true,
  },
  {
    id: 'yoga',
    title: 'Yoga va pilates',
    accent: '#ec4899',
    image: '/images/sport/cat/yoga.png',
    cutout: true,
    // Ikki qatorli sarlavha uchun figura kichikroq va o‘ngroqda
    cutoutStyle: { height: '100%', right: '2%' },
    blobStyle: { right: '0%', width: '50%' },
  },
  {
    id: 'yengil-atletika',
    title: 'Yugurish va atletika',
    accent: '#14b8a6',
    image: '/images/sport/cat/yengil-atletika.png',
    cutout: true,
    // Ikki qatorli sarlavha uchun figura kichikroq va o‘ngroqda
    cutoutStyle: { height: '100%', right: '2%' },
    blobStyle: { right: '0%', width: '50%' },
  },
  {
    id: 'velosport',
    title: 'Velosport',
    accent: '#ff8a3d',
    image: '/images/sport/cat/velosport.png',
    cutout: true,
  },
  {
    id: 'boshqa',
    title: 'Boshqa sport turlari',
    accent: '#6366f1',
    image: '/images/sport/cat/boshqa.png',
    cutout: true,
    // Uch qatorli sarlavha uchun figura kichikroq va o‘ngroqda
    cutoutStyle: { height: '100%', right: '2%' },
    blobStyle: { right: '0%', width: '50%' },
  },
]
