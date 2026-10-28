import { useEffect, useRef } from 'react'
import { FiArrowRight, FiCalendar } from 'react-icons/fi'
import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categories } from '../../data/categories.js'
import { getTopCompanies } from '../../data/companies.js'
import './CategoryGrid.css'
import { tr } from '../../i18n/index.js'

const ROW_ONE_SIZE = 6
const COMPANY_LIMIT = 10

function CategoriesGridIcon() {
  return (
    <svg
      className="category-card__cta-grid"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="13" y="1" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="1" y="13" width="8" height="8" rx="2" fill="currentColor" />
      <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
    </svg>
  )
}

function CtaCard({ to, label, className = '' }) {
  return (
    <Link to={to} className={`category-card category-card--cta ${className}`.trim()}>
      <span className="category-card__cta-icon" aria-hidden="true">
        <CategoriesGridIcon />
      </span>
      <span className="category-card__cta-text">
        <span className="category-card__cta-label">{label}</span>
        <FiArrowRight className="category-card__cta-arrow" aria-hidden="true" />
      </span>
    </Link>
  )
}

export default function CategoryGrid({ activeTab = 'jobs' }) {
  const content = activeTab === 'companies' ? <CompanyCategories /> : <JobCategories />

  return (
    <section className="category-grid container" id="kategoriyalar" key={activeTab}>
      <CarouselTrack>{content}</CarouselTrack>
    </section>
  )
}

/**
 * Desktop’da oddiy grid; mobilda (≤767px) CSS uni 2 qatorli gorizontal carouselga aylantiradi.
 * Progress chizig‘i re-render’siz — CSS o‘zgaruvchilari orqali yangilanadi.
 */
function CarouselTrack({ children }) {
  const trackRef = useRef(null)
  const progressRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    const progress = progressRef.current
    if (!track || !progress) return undefined

    let frame = 0
    const update = () => {
      frame = 0
      const { scrollLeft, scrollWidth, clientWidth } = track
      const overflow = scrollWidth - clientWidth
      progress.hidden = overflow <= 1
      const size = clientWidth / scrollWidth
      progress.style.setProperty('--cg-thumb-size', String(size))
      progress.style.setProperty('--cg-thumb-pos', String(overflow > 0 ? scrollLeft / overflow : 0))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    track.addEventListener('scroll', schedule, { passive: true })
    const resizeObserver = new ResizeObserver(schedule)
    resizeObserver.observe(track)
    return () => {
      cancelAnimationFrame(frame)
      track.removeEventListener('scroll', schedule)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <>
      <div className="category-grid__track" ref={trackRef}>
        {children}
      </div>
      <div className="category-grid__progress" ref={progressRef} aria-hidden="true" hidden>
        <span className="category-grid__progress-thumb" />
      </div>
    </>
  )
}

function JobCategories() {
  const rowOne = categories.slice(0, ROW_ONE_SIZE)
  const rowTwo = categories.slice(ROW_ONE_SIZE)

  return (
    <>
      <div className="category-grid__row category-grid__row--one">
        {rowOne.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      <div className="category-grid__row category-grid__row--two">
        {rowTwo.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
        <CtaCard to="/sport-turlari" label={tr('Barcha sport turlari')} className="category-card--cta-end" />
      </div>
    </>
  )
}

function CategoryCard({ category }) {
  return (
    <Link to={`/sport/${category.id}`} className="category-card">
      <span
        className="category-card__title"
        style={category.titleWidth ? { maxWidth: `${category.titleWidth}%` } : undefined}
      >
        {category.title}
      </span>
      {category.cutout ? (
        <>
          <span
            className="category-card__blob"
            style={{ background: category.accent, ...category.blobStyle }}
            aria-hidden="true"
          />
          <img
            className="category-card__cutout"
            src={category.image}
            alt=""
            loading="lazy"
            style={category.cutoutStyle}
          />
        </>
      ) : (
        <span
          className="category-card__image"
          role="img"
          aria-hidden="true"
          style={{
            backgroundImage: `url(${category.image})`,
            backgroundPosition: `${category.focusX ?? 50}% ${category.focusY ?? 50}%`,
          }}
        />
      )}
    </Link>
  )
}

function CompanyCategories() {
  return (
    <div className="category-grid__companies">
      {getTopCompanies(COMPANY_LIMIT).map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
      <CtaCard
        to="/majmualar"
        label={tr('Barcha majmualar')}
        className="category-card--cta-wide category-card--cta-end"
      />
    </div>
  )
}

function CompanyCard({ company }) {
  return (
    <Link to={`/majmua/${company.id}`} className="category-card company-card">
      <span className="company-card__top">
        <span
          className="company-card__logo"
          style={company.logo ? undefined : { background: company.color, color: '#fff' }}
        >
          {company.logo ? (
            <img loading="lazy" decoding="async" src={`${company.logo}?v=2`} alt="" width={44} height={44} />
          ) : (
            company.name.charAt(0)
          )}
        </span>
        <FiArrowRight className="company-card__arrow" aria-hidden="true" />
      </span>

      <span className="company-card__info">
        <span className="company-card__name-line">
          <span className="company-card__name">{company.name}</span>
          {company.verified && (
            <span className="company-card__verified" title={tr('Tasdiqlangan')} aria-label={tr('Tasdiqlangan')}>
              <Check size={9} strokeWidth={3.5} />
            </span>
          )}
        </span>
        <span className="company-card__meta">
          <FiCalendar aria-hidden="true" />
          {company.adsCount} {tr('ta xizmat')}
        </span>
      </span>
    </Link>
  )
}
