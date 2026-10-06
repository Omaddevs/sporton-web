import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiActivity, FiArrowRight, FiMapPin, FiNavigation, FiX } from 'react-icons/fi'
import { Check, LocateFixed, MapPinOff, RefreshCw, ShieldCheck } from 'lucide-react'
import JobsMap from '../components/JobsMap/JobsMap.jsx'
import { jobs } from '../data/jobs.js'
import { useGeolocation } from '../hooks/useGeolocation.js'
import './JobsMapPage.css'

// Ruxsat berilmasa — Toshkent markazi bo'yicha ko'rsatiladi
const FALLBACK_ORIGIN = { lat: 41.3111, lng: 69.2797 }

const RADII = [
  { km: 3, label: '3 km' },
  { km: 5, label: '5 km' },
  { km: 10, label: '10 km' },
  { km: 25, label: '25 km' },
  { km: null, label: 'Barchasi' },
]

const TYPES = [
  { id: 'all', label: 'Barchasi' },
  { id: 'full', label: 'Yopiq zal' },
  { id: 'part', label: 'Ochiq maydon' },
  { id: 'intern', label: 'Bepul sinov' },
]

const MAPPABLE_JOBS = jobs.filter((job) => job.coords)

function distanceKm(a, b) {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`
}

export default function JobsMapPage() {
  const geo = useGeolocation()
  const [useFallback, setUseFallback] = useState(false)
  const [radiusKm, setRadiusKm] = useState(10)
  const [type, setType] = useState('all')
  const [selectedId, setSelectedId] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)

  const located = geo.status === 'granted'
  const origin = located ? geo.position : useFallback ? FALLBACK_ORIGIN : null

  const visibleJobs = useMemo(() => {
    if (!origin) return []
    return MAPPABLE_JOBS.filter((job) => type === 'all' || job.type === type)
      .map((job) => ({ ...job, distance: distanceKm(origin, job.coords) }))
      .filter((job) => radiusKm == null || job.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
  }, [origin, type, radiusKm])

  const selectedJob = visibleJobs.find((job) => job.id === selectedId) ?? null
  const nextRadius = RADII[RADII.findIndex((r) => r.km === radiusKm) + 1]

  // Esc — tanlangan majmua kartasini yopadi
  useEffect(() => {
    if (!selectedJob) return undefined
    const onKey = (event) => event.key === 'Escape' && setSelectedId(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedJob])

  function enableLocation() {
    setUseFallback(false)
    geo.request()
  }

  return (
    <div className="jobs-map-page">
      <aside className="jmp-panel" aria-label="Yaqin atrofdagi majmualar">
        <header className="jmp-panel__head">
          <h1 className="jmp-panel__title">Yaqin atrofdagi majmualar</h1>
          <p className="jmp-panel__subtitle">Sport majmualari sizdan uzoqligi bo&apos;yicha saralangan</p>
          <LocationStatus geo={geo} origin={origin} onEnable={enableLocation} />
        </header>

        {origin ? (
          <>
            <div className="jmp-filters">
              <div className="jmp-filter">
                <span className="jmp-filter__label" id="jmp-radius-label">
                  Qidiruv radiusi
                </span>
                <div className="jmp-segmented" role="radiogroup" aria-labelledby="jmp-radius-label">
                  {RADII.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      role="radio"
                      aria-checked={radiusKm === r.km}
                      className={`jmp-segmented__item${radiusKm === r.km ? ' is-active' : ''}`}
                      onClick={() => setRadiusKm(r.km)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="jmp-filter">
                <span className="jmp-filter__label" id="jmp-type-label">
                  Joy turi
                </span>
                <div className="jmp-chips" role="radiogroup" aria-labelledby="jmp-type-label">
                  {TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={type === t.id}
                      className={`jmp-chip${type === t.id ? ' is-active' : ''}`}
                      onClick={() => setType(t.id)}
                    >
                      {type === t.id && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="jmp-results">
              <div className="jmp-results__head" aria-live="polite">
                <p className="jmp-results__count">
                  {visibleJobs.length} ta joy
                </p>
                <p className="jmp-results__hint">
                  {radiusKm ? `${radiusKm} km ichida` : 'Barcha hududlar'} · eng yaqini birinchi
                </p>
              </div>

              {visibleJobs.length ? (
                <ul className="jmp-list">
                  {visibleJobs.map((job) => (
                    <li key={job.id}>
                      <JobItem
                        job={job}
                        active={job.id === selectedId}
                        onSelect={() => setSelectedId(job.id)}
                        onHover={setHoveredId}
                      />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="jmp-empty">
                  <span className="jmp-empty__icon" aria-hidden="true">
                    <MapPinOff size={24} strokeWidth={1.8} />
                  </span>
                  <p className="jmp-empty__title">Bu radiusda majmua yo&apos;q</p>
                  <p className="jmp-empty__text">Qidiruv hududini kengaytiring yoki boshqa joy turini tanlang.</p>
                  {nextRadius && (
                    <button type="button" className="jmp-btn jmp-btn--primary" onClick={() => setRadiusKm(nextRadius.km)}>
                      {nextRadius.km ? `${nextRadius.label} gacha kengaytirish` : "Barchasini ko'rsatish"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : geo.status === 'locating' ? (
          <ul className="jmp-list jmp-list--loading" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <li key={i} className="jmp-job-skeleton" />
            ))}
          </ul>
        ) : (
          <ol className="jmp-steps">
            <li>
              <span>1</span>Joylashuvingizni yoqing
            </li>
            <li>
              <span>2</span>Radius va joy turini tanlang
            </li>
            <li>
              <span>3</span>Eng yaqin maydonni bron qiling
            </li>
          </ol>
        )}
      </aside>

      <section className="jmp-map" aria-label="Sport majmualari xaritasi">
        <JobsMap
          origin={origin}
          jobs={origin ? visibleJobs : MAPPABLE_JOBS}
          radiusKm={radiusKm}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={setSelectedId}
          interactive={Boolean(origin)}
        />

        {!origin && (
          <PermissionCard
            status={geo.status}
            onEnable={enableLocation}
            onFallback={() => setUseFallback(true)}
          />
        )}

        {selectedJob && <SelectedJobCard job={selectedJob} onClose={() => setSelectedId(null)} />}
      </section>
    </div>
  )
}

function LocationStatus({ geo, origin, onEnable }) {
  if (geo.status === 'granted') {
    return (
      <div className="jmp-location jmp-location--ok">
        <span className="jmp-location__icon" aria-hidden="true">
          <LocateFixed size={18} strokeWidth={2} />
        </span>
        <span className="jmp-location__text">
          <span className="jmp-location__title">Joylashuvingiz aniqlandi</span>
          {geo.position.accuracy ? (
            <span className="jmp-location__meta">Aniqlik ±{Math.round(geo.position.accuracy)} m</span>
          ) : null}
        </span>
        <button type="button" className="jmp-icon-btn" onClick={onEnable} aria-label="Joylashuvni yangilash" title="Yangilash">
          <RefreshCw size={16} strokeWidth={2} />
        </button>
      </div>
    )
  }
  if (origin) {
    return (
      <div className="jmp-location">
        <span className="jmp-location__icon" aria-hidden="true">
          <FiMapPin />
        </span>
        <span className="jmp-location__text">
          <span className="jmp-location__title">Toshkent markazi</span>
          <span className="jmp-location__meta">Taxminiy joylashuv bo&apos;yicha</span>
        </span>
        {geo.status !== 'unsupported' && (
          <button type="button" className="jmp-btn jmp-btn--soft jmp-btn--sm" onClick={onEnable}>
            Aniqlash
          </button>
        )}
      </div>
    )
  }
  return null
}

const PERMISSION_COPY = {
  idle: {
    title: 'Yaqin atrofingizdagi majmualarni toping',
    text: "Joylashuvingizni yoqing — sport majmualarini sizdan qancha uzoqligi bo'yicha saralab ko'rsatamiz.",
    action: 'Joylashuvni yoqish',
  },
  locating: {
    title: 'Joylashuvingiz aniqlanmoqda…',
    text: "Brauzer so'ragan oynada «Ruxsat berish» tugmasini bosing.",
  },
  denied: {
    title: 'Joylashuvga ruxsat berilmagan',
    text: "Manzil satridagi qulf belgisini bosing → «Joylashuv» → «Ruxsat berish», so'ng qayta urinib ko'ring.",
    action: 'Qayta urinish',
  },
  unavailable: {
    title: 'Joylashuvni aniqlab bo‘lmadi',
    text: "GPS yoki internet aloqasini tekshirib, qayta urinib ko'ring.",
    action: 'Qayta urinish',
  },
  unsupported: {
    title: "Joylashuv bu yerda ishlamaydi",
    text: "Brauzeringiz joylashuvni bera olmaydi. Toshkent bo'yicha majmualarni ko'rishingiz mumkin.",
  },
}

function PermissionCard({ status, onEnable, onFallback }) {
  const copy = PERMISSION_COPY[status] ?? PERMISSION_COPY.idle
  const locating = status === 'locating'

  return (
    <div className="jmp-permission">
      <div className="jmp-permission__card" role="dialog" aria-labelledby="jmp-permission-title">
        <span className={`jmp-permission__icon${locating ? ' is-locating' : ''}`} aria-hidden="true">
          {status === 'denied' || status === 'unavailable' || status === 'unsupported' ? (
            <MapPinOff size={30} strokeWidth={1.8} />
          ) : (
            <LocateFixed size={30} strokeWidth={1.8} />
          )}
        </span>
        <h2 id="jmp-permission-title" className="jmp-permission__title">
          {copy.title}
        </h2>
        <p className="jmp-permission__text">{copy.text}</p>

        {copy.action && (
          <button type="button" className="jmp-btn jmp-btn--primary jmp-btn--block" onClick={onEnable}>
            <FiNavigation aria-hidden="true" />
            {copy.action}
          </button>
        )}
        {!locating && (
          <button type="button" className="jmp-btn jmp-btn--ghost jmp-btn--block" onClick={onFallback}>
            Toshkent bo&apos;yicha ko&apos;rish
          </button>
        )}

        <p className="jmp-permission__note">
          <ShieldCheck size={14} aria-hidden="true" />
          Joylashuvingiz faqat qurilmangizda ishlatiladi va saqlanmaydi.
        </p>
      </div>
    </div>
  )
}

function CompanyLogo({ job, size = 44 }) {
  return (
    <span
      className="jmp-logo"
      style={{ width: size, height: size, ...(job.logo ? null : { background: job.companyColor, color: '#fff' }) }}
    >
      {job.logo ? <img src={`${job.logo}?v=2`} alt="" loading="lazy" decoding="async" /> : job.company.charAt(0)}
    </span>
  )
}

function VerifiedBadge() {
  return (
    <span className="jmp-verified" role="img" aria-label="Tasdiqlangan majmua" title="Tasdiqlangan majmua">
      <Check size={9} strokeWidth={3.5} aria-hidden="true" />
    </span>
  )
}

function JobItem({ job, active, onSelect, onHover }) {
  const ref = useRef(null)

  // Xaritada marker bosilganda ro'yxatdagi kartani ko'rinadigan joyga keltirish
  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [active])

  return (
    <button
      ref={ref}
      type="button"
      className={`jmp-job${active ? ' is-active' : ''}`}
      onClick={onSelect}
      onMouseEnter={() => onHover(job.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(job.id)}
      onBlur={() => onHover(null)}
      aria-pressed={active}
    >
      <CompanyLogo job={job} />
      <span className="jmp-job__body">
        <span className="jmp-job__top">
          <span className="jmp-job__title">{job.title}</span>
          <span className="jmp-distance" aria-label={`${formatDistance(job.distance)} uzoqlikda`}>
            <FiNavigation aria-hidden="true" />
            {formatDistance(job.distance)}
          </span>
        </span>
        <span className="jmp-job__company">
          <span className="jmp-job__company-name">{job.company}</span>
          {job.verified && <VerifiedBadge />}
        </span>
        <span className="jmp-job__salary">{job.salary}</span>
        <span className="jmp-job__meta">
          <span className="jmp-tag">{job.typeLabel}</span>
          <span className="jmp-job__location">
            <FiMapPin aria-hidden="true" />
            {job.location}
          </span>
        </span>
      </span>
    </button>
  )
}

function SelectedJobCard({ job, onClose }) {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${job.coords.lat},${job.coords.lng}`

  return (
    <article className="jmp-selected" aria-label={`${job.title} — ${job.company}`}>
      <button type="button" className="jmp-selected__close" onClick={onClose} aria-label="Yopish">
        <FiX />
      </button>
      <div className="jmp-selected__head">
        <CompanyLogo job={job} size={52} />
        <div className="jmp-selected__info">
          <h3 className="jmp-selected__title">{job.title}</h3>
          <p className="jmp-job__company">
            <span className="jmp-job__company-name">{job.company}</span>
            {job.verified && <VerifiedBadge />}
          </p>
        </div>
      </div>

      <p className="jmp-selected__salary">{job.salary}</p>
      <ul className="jmp-selected__facts">
        <li>
          <FiNavigation aria-hidden="true" />
          {formatDistance(job.distance)} uzoqlikda · {job.location}
        </li>
        <li>
          <FiActivity aria-hidden="true" />
          {job.typeLabel} · {job.category}
        </li>
      </ul>

      <div className="jmp-selected__actions">
        <Link to={`/bron/${job.id}`} className="jmp-btn jmp-btn--primary">
          Batafsil
          <FiArrowRight aria-hidden="true" />
        </Link>
        <a href={directions} target="_blank" rel="noopener noreferrer" className="jmp-btn jmp-btn--outline">
          <FiNavigation aria-hidden="true" />
          Yo&apos;nalish
        </a>
      </div>
    </article>
  )
}
