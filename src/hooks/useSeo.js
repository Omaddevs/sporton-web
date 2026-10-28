import { useEffect } from 'react'
import { tr } from '../i18n/index.js'

const SITE = 'SportON'
const DEFAULT_TITLE = tr('SportON — Sport majmualari, bron va mashg‘ulotlar')
const DEFAULT_DESCRIPTION =
  tr('SportON — sport majmualarini topish va onlayn bron qilish: futbol maydonlari, fitnes zallar, suzish havzalari, sektsiyalar.')
const DEFAULT_IMAGE = '/images/og-cover.jpg'

const absolute = (url) => (!url ? '' : /^https?:\/\//.test(url) ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`)

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function setJsonLd(data) {
  document.head.querySelector('script[data-seo="ld"]')?.remove()
  if (!data) return
  const el = document.createElement('script')
  el.type = 'application/ld+json'
  el.dataset.seo = 'ld'
  el.textContent = JSON.stringify(data)
  document.head.appendChild(el)
}

/**
 * Sahifa sarlavhasi, tavsifi, Open Graph va canonical. Qidiruv tizimlari JS’ni bajaradi; ijtimoiy
 * tarmoq botlari uchun esa nginx backenddagi /api/v1/seo dan tayyor meta sahifani beradi.
 */
export function useSeo({ title, description, image, type = 'website', jsonLd } = {}) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : ''
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : DEFAULT_TITLE
    const desc = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().slice(0, 200)
    const url = `${window.location.origin}${window.location.pathname}`
    document.title = fullTitle
    setMeta('name', 'description', desc)
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:image', absolute(image || DEFAULT_IMAGE))
    setMeta('property', 'og:url', url)
    setMeta('property', 'og:type', type)
    setCanonical(url)
    setJsonLd(ld ? JSON.parse(ld) : null)
    return () => {
      document.title = DEFAULT_TITLE
      setJsonLd(null)
    }
  }, [title, description, image, type, ld])
}
