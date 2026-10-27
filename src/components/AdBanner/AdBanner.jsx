import { FiArrowRight, FiX } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { fetchAd } from '../../services/ads.js'
import './AdBanner.css'
import { tr } from '../../i18n/index.js'

const isExternal = (href) => /^https?:\/\//.test(href)

export default function AdBanner({ slot = 'home' }) {
  const [ad, setAd] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchAd(slot, { signal: controller.signal })
      .then(setAd)
      .catch(() => null)
    return () => controller.abort()
  }, [slot])

  // Admin paneldan rasm va havola kiritilmaguncha reklama ko‘rsatilmaydi
  if (dismissed || !ad?.image || !ad?.link) return null

  const external = isExternal(ad.link)

  return (
    <section className="container ad-banner-wrap">
      <a
        href={ad.link}
        className="ad-banner ad-banner--image"
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer sponsored' : undefined}
        aria-label={ad.alt || ad.ctaLabel || tr('Reklama')}
      >
        <picture className="ad-banner__picture">
          {ad.mobileImage && <source media="(max-width: 639px)" srcSet={ad.mobileImage} />}
          <img src={ad.image} alt={ad.alt ?? ''} loading="lazy" />
        </picture>

        {ad.ctaLabel && (
          <span className="ad-banner__cta ad-banner__cta--floating">
            {ad.ctaLabel}
            <FiArrowRight />
          </span>
        )}

        <button
          type="button"
          className="ad-banner__close"
          aria-label={tr('Reklamani yopish')}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            setDismissed(true)
          }}
        >
          <FiX />
        </button>
      </a>
    </section>
  )
}
