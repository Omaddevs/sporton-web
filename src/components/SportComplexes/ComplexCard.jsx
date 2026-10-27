import { tr } from '../../i18n/index.js'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Gift, Star } from 'lucide-react'
import { useSaved } from '../../hooks/useSaved.js'
import { FiHeart } from 'react-icons/fi'
import { FALLBACK_IMAGE, formatPrice } from '../../data/complexes.js'
import './ComplexCard.css'

const CARD_IMAGES = 4

export default function ComplexCard({ complex }) {
  const [slide, setSlide] = useState(0)
  const [saved, toggleSaved] = useSaved('companies', complex.id)
  const images = complex.images.slice(0, CARD_IMAGES)
  const url = `/sport-majmua/${complex.id}`
  const priceLabel = complex.minPrice
    ? `${formatPrice(complex.minPrice)} so‘mdan`
    : (complex.priceNote ?? 'Bepul')

  // Kursor rasm ustida yurganda — slayd kursor turgan qismga mos almashadi
  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const index = Math.floor(((event.clientX - rect.left) / rect.width) * images.length)
    setSlide(Math.min(images.length - 1, Math.max(0, index)))
  }

  return (
    <article className="complex-card">
      <div className="complex-card__media">
        <Link
          to={url}
          className="complex-card__media-link"
          aria-label={complex.name}
          onMouseMove={handleMove}
          onMouseLeave={() => setSlide(0)}
        >
          <img
            className="complex-card__img"
            src={images[slide]}
            alt=""
            loading="lazy"
            draggable="false"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE
            }}
          />
        </Link>

        {(complex.verified || complex.hasTrial) && (
          <div className="complex-card__badges">
            {complex.verified && (
              <span className="complex-card__badge">
                <span className="complex-card__badge-icon complex-card__badge-icon--green" aria-hidden="true">
                  <Check size={10} strokeWidth={3.5} />
                </span>
                {tr('Tasdiqlangan')}
              </span>
            )}
            {complex.hasTrial && (
              <span
                className={`complex-card__badge ${complex.verified ? 'complex-card__badge--icon' : ''}`}
                title={tr('Bepul sinov darsi')}
              >
                <span className="complex-card__badge-icon complex-card__badge-icon--orange" aria-hidden="true">
                  <Gift size={10} strokeWidth={3} />
                </span>
                {!complex.verified && 'Bepul sinov'}
              </span>
            )}
          </div>
        )}

        <div className="complex-card__dots" aria-hidden="true">
          {images.map((src, index) => (
            <span
              key={src + index}
              className={`complex-card__dot ${slide === index ? 'complex-card__dot--active' : ''}`}
            />
          ))}
        </div>

        {/* Mobil kartada narx rasm ustida ko‘k belgi bo‘lib turadi */}
        <span className="complex-card__price-tag" aria-hidden="true">
          {priceLabel}
        </span>

        <button
          type="button"
          className={`complex-card__save ${saved ? 'complex-card__save--active' : ''}`}
          aria-label={saved ? tr('Saqlanganlardan olib tashlash') : tr('Saqlash')}
          aria-pressed={saved}
          onClick={toggleSaved}
        >
          <FiHeart />
        </button>
      </div>

      <Link to={url} className="complex-card__body">
        <p className="complex-card__price">{priceLabel}</p>
        {complex.rating ? (
          <p className="complex-card__rating">
            <Star size={13} aria-hidden="true" />
            {complex.rating}
            {complex.reviews > 0 && <span>({complex.reviews})</span>}
          </p>
        ) : null}
        <p className="complex-card__name">{complex.name}</p>
        <p className="complex-card__meta">
          {complex.location}
          {complex.sports.length > 0 && ` · ${complex.sports.join(', ')}`}
        </p>
      </Link>
    </article>
  )
}
