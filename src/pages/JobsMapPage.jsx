import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FiActivity, FiArrowRight, FiMapPin, FiNavigation, FiX } from 'react-icons/fi'
import {
  Check,
  ChevronLeft,
  Lasso,
  List,
  LocateFixed,
  MapPinOff,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import JobsMap from '../components/JobsMap/JobsMap.jsx'
import { jobs } from '../data/jobs.js'
import { useGeolocation } from '../hooks/useGeolocation.js'
import './JobsMapPage.css'
import { tr } from '../i18n/index.js'

// Ruxsat berilmasa — Toshkent markazi bo'yicha ko'rsatiladi
const FALLBACK_ORIGIN = { lat: 41.3111, lng: 69.2797 }

const RADII = [
  { km: 3, label: tr('3 km') },
  { km: 5, label: tr('5 km') },
  { km: 10, label: tr('10 km') },
  { km: 25, label: tr('25 km') },
  { km: null, label: tr('Barchasi') },
]

const TYPES = [
  { id: 'all', label: tr('Barchasi') },
  { id: 'full', label: tr('Yopiq zal') },
  { id: 'part', label: tr('Ochiq maydon') },
  { id: 'intern', label: tr('Bepul sinov') },
]

const MAPPABLE_JOBS = jobs.filter((job) => job.coords)

function distanceKm(a, b) {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}

// Nuqta chizilgan ko‘pburchak ichidami (ray casting; kichik hududda lat/lng tekis deb olinadi)
function insideArea(point, area) {
  let inside = false
  for (let i = 0, j = area.length - 1; i < area.length; j = i++) {
    const a = area[i]
    const b = area[j]
    if (a.lat > point.lat !== b.lat > point.lat && point.lng < ((b.lng - a.lng) * (point.lat - a.lat)) / (b.lat - a.lat) + a.lng) {
      inside = !inside
    }
  }
  return inside
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
  // Mobil: ro‘yxat/filtrlar pastdan chiqadigan sheet’da, qidiruv — tepadagi kartada
  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  // Chizib belgilash: hudud chizilgach, radius o‘rniga shu hudud bo‘yicha filtrlanadi
  const [drawing, setDrawing] = useState(false)
  const [area, setArea] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const located = geo.status === 'granted'
  const origin = located ? geo.position : useFallback ? FALLBACK_ORIGIN : null

  const visibleJobs = useMemo(() => {
    if (!origin) return []
    const q = query.trim().toLowerCase()
    return MAPPABLE_JOBS.filter((job) => type === 'all' || job.type === type)
      .filter((job) => !q || `${job.title} ${job.company}`.toLowerCase().includes(q))
      .map((job) => ({ ...job, distance: distanceKm(origin, job.coords) }))
      .filter((job) => (area ? insideArea(job.coords, area) : radiusKm == null || job.distance <= radiusKm))
      .sort((a, b) => a.distance - b.distance)
  }, [origin, type, radiusKm, query, area])

  const selectedJob = visibleJobs.find((job) => job.id === selectedId) ?? null
  const nextRadius = RADII[RADII.findIndex((r) => r.km === radiusKm) + 1]

  // Esc — tanlangan majmua kartasini yopadi
  useEffect(() => {
    if (!selectedJob) return undefined
    const onKey = (event) => event.key === 'Escape' && setSelectedId(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedJob])

  useEffect(() => {
    if (!sheetOpen) return undefined
    const onKey = (event) => event.key === 'Escape' && setSheetOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheetOpen])

  function goBack() {
    // Saytga to‘g‘ridan-to‘g‘ri shu sahifadan kirilgan bo‘lsa — bosh sahifaga
    if (location.key === 'default') navigate('/')
    else navigate(-1)
  }

  function toggleSearch() {
    if (searchOpen) setQuery('')
    setSearchOpen((value) => !value)
  }

  function toggleDraw() {
    if (area) setArea(null)
    else {
      setSelectedId(null)
      setDrawing((value) => !value)
    }
  }

  function finishDrawing(points) {
    setArea(points)
    setDrawing(false)
  }

  function changeRadius(km) {
    setArea(null)
    setRadiusKm(km)
  }

  function selectFromList(id) {
    setSelectedId(id)
    setSheetOpen(false)
  }

  function enableLocation() {
    setUseFallback(false)
    geo.request()
  }

  return (
    <div className="jobs-map-page">
      <div
        className={`jmp-sheet-backdrop${sheetOpen ? ' is-open' : ''}`}
        onClick={() => setSheetOpen(false)}
        aria-hidden="true"
      />

      <aside className={`jmp-panel${sheetOpen ? ' is-open' : ''}`} aria-label={tr('Yaqin atrofdagi majmualar')}>
        <header className="jmp-panel__head">
          <button
            type="button"
            className="jmp-panel__close"
            onClick={() => setSheetOpen(false)}
            aria-label={tr('Ro‘yxatni yopish')}
          >
            <X size={18} strokeWidth={2.4} />
          </button>
          <h1 className="jmp-panel__title">{tr('Yaqin atrofdagi majmualar')}</h1>
          <p className="jmp-panel__subtitle">Sport majmualari sizdan uzoqligi bo&apos;yicha saralangan</p>
          <LocationStatus geo={geo} origin={origin} onEnable={enableLocation} />
        </header>

        {origin ? (
          <>
            <div className="jmp-filters">
              <div className="jmp-filter">
                <span className="jmp-filter__label" id="jmp-radius-label">
                  {tr('Qidiruv radiusi')}
                </span>
                <div className="jmp-segmented" role="radiogroup" aria-labelledby="jmp-radius-label">
                  {RADII.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      role="radio"
                      aria-checked={radiusKm === r.km}
                      className={`jmp-segmented__item${radiusKm === r.km ? ' is-active' : ''}`}
                      onClick={() => changeRadius(r.km)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="jmp-filter">
                <span className="jmp-filter__label" id="jmp-type-label">
                  {tr('Joy turi')}
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
                  {visibleJobs.length} {tr('ta joy')}
                </p>
                <p className="jmp-results__hint">
                  {area ? tr('Chizilgan hudud') : radiusKm ? `${radiusKm} km ichida` : tr('Barcha hududlar')} {tr('· eng yaqini birinchi')}
                </p>
              </div>

              {visibleJobs.length ? (
                <ul className="jmp-list">
                  {visibleJobs.map((job) => (
                    <li key={job.id}>
                      <JobItem
                        job={job}
                        active={job.id === selectedId}
                        onSelect={() => selectFromList(job.id)}
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
                  <p className="jmp-empty__text">{tr('Qidiruv hududini kengaytiring yoki boshqa joy turini tanlang.')}</p>
                  {area ? (
                    <button type="button" className="jmp-btn jmp-btn--primary" onClick={() => setArea(null)}>
                      {tr('Chizilgan hududni tozalash')}
                    </button>
                  ) : nextRadius && (
                    <button type="button" className="jmp-btn jmp-btn--primary" onClick={() => changeRadius(nextRadius.km)}>
                      {nextRadius.km ? `${nextRadius.label} gacha kengaytirish` : tr('Barchasini ko\'rsatish')}
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
              <span>1</span>{tr('Joylashuvingizni yoqing')}
            </li>
            <li>
              <span>2</span>{tr('Radius va joy turini tanlang')}
            </li>
            <li>
              <span>3</span>{tr('Eng yaqin maydonni bron qiling')}
            </li>
          </ol>
        )}
      </aside>

      <section className="jmp-map" aria-label={tr('Sport majmualari xaritasi')}>
        <JobsMap
          origin={origin}
          jobs={origin ? visibleJobs : MAPPABLE_JOBS}
          radiusKm={radiusKm}
          selectedId={selectedId}
          hoveredId={hoveredId}
          onSelect={setSelectedId}
          interactive={Boolean(origin)}
          originLabel={located ? tr('Siz shu yerdasiz') : null}
          drawing={drawing}
          onDrawEnd={finishDrawing}
          area={area}
        />

        {/* Mobil: xarita ustidagi suzuvchi boshqaruvlar */}
        <div className="jmp-mtop">
          <button type="button" className="jmp-fab" onClick={goBack} aria-label={tr('Orqaga')}>
            <ChevronLeft size={24} strokeWidth={2.2} />
          </button>

          {searchOpen ? (
            <label className="jmp-mtop__card jmp-mtop__search">
              <Search size={18} aria-hidden="true" />
              <input
                type="text"
                enterKeyHint="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tr('Majmua qidirish...')}
                aria-label={tr('Majmua qidirish')}
                autoFocus
              />
            </label>
          ) : (
            <div className="jmp-mtop__card">
              <strong>{tr('Xarita')}</strong>
              <span>
                {!origin
                  ? tr('Joylashuvni yoqing')
                  : area
                    ? `Hududda ${visibleJobs.length} ta majmua`
                    : `${visibleJobs.length} ta majmua`}
              </span>
            </div>
          )}

          <button
            type="button"
            className="jmp-fab"
            onClick={toggleSearch}
            aria-label={searchOpen ? tr('Qidiruvni yopish') : tr('Qidirish')}
            aria-pressed={searchOpen}
          >
            {searchOpen ? <X size={21} strokeWidth={2.2} /> : <Search size={21} strokeWidth={2.2} />}
          </button>
          <button type="button" className="jmp-fab" onClick={() => setSheetOpen(true)} aria-label={tr('Filtrlar')}>
            <SlidersHorizontal size={20} strokeWidth={2.2} />
          </button>
        </div>

        {drawing && (
          <div className="jmp-draw-hint" role="status">
            <Lasso size={18} aria-hidden="true" />
            <span>{tr('Barmog‘ingiz bilan hududni aylantirib chizing')}</span>
            <button type="button" onClick={() => setDrawing(false)}>
              {tr('Bekor qilish')}
            </button>
          </div>
        )}

        {origin && (
          <button
            type="button"
            className={`jmp-draw-btn${drawing || area ? ' is-active' : ''}`}
            onClick={toggleDraw}
            aria-pressed={drawing || Boolean(area)}
            aria-label={area ? tr('Chizilgan hududni tozalash') : drawing ? tr('Chizishni bekor qilish') : tr('Hududni chizib belgilash')}
            title={area ? tr('Hududni tozalash') : tr('Chizib belgilash')}
          >
            {area ? <X size={22} strokeWidth={2.2} /> : <Lasso size={22} strokeWidth={2.2} />}
          </button>
        )}

        {origin && !drawing && (
          <button type="button" className="jmp-list-toggle" onClick={() => setSheetOpen(true)}>
            <List size={20} strokeWidth={2.2} aria-hidden="true" />
            <span>
              Ro&apos;yxat<span className="jmp-list-toggle__more"> ko&apos;rinishida</span>
            </span>
          </button>
        )}

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
          <span className="jmp-location__title">{tr('Joylashuvingiz aniqlandi')}</span>
          {geo.position.accuracy ? (
            <span className="jmp-location__meta">{tr('Aniqlik ±')}{Math.round(geo.position.accuracy)} m</span>
          ) : null}
        </span>
        <button type="button" className="jmp-icon-btn" onClick={onEnable} aria-label={tr('Joylashuvni yangilash')} title={tr('Yangilash')}>
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
          <span className="jmp-location__title">{tr('Toshkent markazi')}</span>
          <span className="jmp-location__meta">Taxminiy joylashuv bo&apos;yicha</span>
        </span>
        {geo.status !== 'unsupported' && (
          <button type="button" className="jmp-btn jmp-btn--soft jmp-btn--sm" onClick={onEnable}>
            {tr('Aniqlash')}
          </button>
        )}
      </div>
    )
  }
  return null
}

const PERMISSION_COPY = {
  idle: {
    title: tr('Yaqin atrofingizdagi majmualarni toping'),
    text: tr('Joylashuvingizni yoqing — sport majmualarini sizdan qancha uzoqligi bo\'yicha saralab ko\'rsatamiz.'),
    action: 'Joylashuvni yoqish',
  },
  locating: {
    title: tr('Joylashuvingiz aniqlanmoqda…'),
    text: tr('Brauzer so\'ragan oynada «Ruxsat berish» tugmasini bosing.'),
  },
  denied: {
    title: tr('Joylashuvga ruxsat berilmagan'),
    text: tr('Manzil satridagi qulf belgisini bosing → «Joylashuv» → «Ruxsat berish», so\'ng qayta urinib ko\'ring.'),
    action: 'Qayta urinish',
  },
  unavailable: {
    title: tr('Joylashuvni aniqlab bo‘lmadi'),
    text: tr('GPS yoki internet aloqasini tekshirib, qayta urinib ko\'ring.'),
    action: 'Qayta urinish',
  },
  unsupported: {
    title: tr('Joylashuv bu yerda ishlamaydi'),
    text: tr('Brauzeringiz joylashuvni bera olmaydi. Toshkent bo\'yicha majmualarni ko\'rishingiz mumkin.'),
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
          {tr('Joylashuvingiz faqat qurilmangizda ishlatiladi va saqlanmaydi.')}
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
    <span className="jmp-verified" role="img" aria-label={tr('Tasdiqlangan majmua')} title={tr('Tasdiqlangan majmua')}>
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
      <button type="button" className="jmp-selected__close" onClick={onClose} aria-label={tr('Yopish')}>
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
          {formatDistance(job.distance)} {tr('uzoqlikda ·')} {job.location}
        </li>
        <li>
          <FiActivity aria-hidden="true" />
          {job.typeLabel} · {job.category}
        </li>
      </ul>

      <div className="jmp-selected__actions">
        <Link to={`/bron/${job.id}`} className="jmp-btn jmp-btn--primary">
          {tr('Batafsil')}
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
