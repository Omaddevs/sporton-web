// Esri Canvas basemap'lari kalitsiz, CDN orqali tez yuklanadi va yorug'/qorong'i variantlari tayyor —
// tile'larga CSS filtr berish shart emas (filtr pan/zoom paytida xaritani qotirib qo'yardi).
// Fon va yorliqlar alohida qatlam: yorliqlar lotin yozuvida va kichik hajmli.
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas'

export const TILES = {
  light: [`${ESRI}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, `${ESRI}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`],
  dark: [`${ESRI}/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, `${ESRI}/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`],
}

export const ATTRIBUTION = 'Tiles &copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap'

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
