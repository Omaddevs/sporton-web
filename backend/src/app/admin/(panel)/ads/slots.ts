/** Reklama joylari va ular uchun tavsiya etilgan rasm o‘lchamlari (px) */
export const AD_SLOTS = [
  {
    id: 'home',
    title: 'Asosiy reklama',
    description: 'Bosh sahifadagi keng banner («Tadbirlar» bo‘limidan keyin).',
    desktop: { width: 1920, height: 360, aspect: '16:3' as const },
    mobile: { width: 800, height: 400, aspect: '2:1' as const },
  },
]
