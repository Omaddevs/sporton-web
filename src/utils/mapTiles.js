// OpenStreetMap standart tile'lari — kalitsiz; yorliqlar fon bilan bitta qatlamda.
// OSM'da qorong'i variant yo'q: ikkala mavzuda bir xil xarita (tile'larga CSS filtr berilmaydi —
// filtr pan/zoom paytida xaritani qotirib qo'yardi). Massiv: [fon, ...ustki qatlamlar].
const OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

export const TILES = {
  light: [OSM],
  dark: [OSM],
}

// OSM tile foydalanish siyosati bo'yicha atributsiya majburiy
export const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

export function currentTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

/** Manzilni tashqi xarita ilovalarida ochish havolalari */
export function externalMapLinks({ lat, lng }, label = '') {
  const name = encodeURIComponent(label)
  return [
    { id: 'google', label: 'Google Maps', href: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` },
    { id: 'yandex', label: 'Yandex Maps', href: `https://yandex.uz/maps/?pt=${lng},${lat}&z=17&l=map` },
    { id: 'apple', label: 'Apple Maps', href: `https://maps.apple.com/?ll=${lat},${lng}&q=${name || 'Manzil'}&z=17` },
  ]
}
