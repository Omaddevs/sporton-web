import { tr } from '../i18n/index.js'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  BadgeCheck,
  CircleParking,
  Coffee,
  Dumbbell,
  Gift,
  Lock,
  ShowerHead,
  Snowflake,
  Star,
  UserCheck,
  Wifi,
} from 'lucide-react'
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBookmark,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEye,
  FiGrid,
  FiHeart,
  FiMapPin,
  FiMessageCircle,
  FiNavigation,
  FiPlay,
  FiPhone,
  FiSend,
  FiShare2,
  FiX,
} from 'react-icons/fi'
import { FaInstagram, FaTelegram } from 'react-icons/fa6'
import ComplexCard from '../components/SportComplexes/ComplexCard.jsx'
import {
  complexes,
  FALLBACK_IMAGE,
  formatPrice,
  getComplexById,
  getSimilarComplexes,
  parsePrice,
  summarizeReviews,
} from '../data/complexes.js'
import { useAuth } from '../context/auth.js'
import { api } from '../services/apiClient.js'
import { loadComplexPreview, trackView } from '../services/catalog.js'
import { useAuthGate } from '../hooks/useAuthGate.jsx'
import { useLike } from '../hooks/useLike.js'
import PhoneReveal from '../components/PhoneReveal/PhoneReveal.jsx'
import { BOOKING_MODES, bookingModeOf, isTimedService } from '../utils/booking.js'
import { useSeo } from '../hooks/useSeo.js'
import { useSaved } from '../hooks/useSaved.js'
import { formatRelative } from '../data/news.js'
import { formatPhone, isValidPhone, toLocalDigits } from '../utils/phone.js'
import { isEmbed, mediaThumb } from '../utils/media.js'
import { externalMapLinks } from '../utils/mapTiles.js'
import './ComplexDetailPage.css'

// Leaflet faqat detail sahifada kerak — asosiy bundle'ga qo'shilmasin
const LocationMap = lazy(() => import('../components/LocationMap/LocationMap.jsx'))

const AMENITY_ICONS = {
  shower: ShowerHead,
  parking: CircleParking,
  wifi: Wifi,
  locker: Lock,
  cafe: Coffee,
  inventory: Dumbbell,
  coach: UserCheck,
  ac: Snowflake,
}

const WEEKDAYS = ['Yak', 'Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan'].map((d) => tr(d))
const MAX_REVIEW = 1000

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function splitPrice(price = '') {
  const [amount, unit] = price.split(' / ')
  return { amount, unit }
}

function buildDays() {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const iso = [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((n) => String(n).padStart(2, '0')).join('-')
    return {
      index: i,
      iso,
      label: i === 0 ? tr('Bugun') : i === 1 ? tr('Ertaga') : WEEKDAYS[date.getDay()],
      day: date.getDate(),
    }
  })
}

/** “07:00 - 23:00” → [7, 8, …, 22]; «24/7» → 0–23; «06:00 - 00:00» → 6–23 */
function buildHours(hours) {
  // «24/7» — kun bo‘yi (backend ham 00:00–24:00 ni qabul qiladi)
  if (hours.trim() === '24/7') return Array.from({ length: 24 }, (_, i) => i)
  const [from, to] = hours.split(' - ').map((part) => Number.parseInt(part, 10))
  if (Number.isNaN(from) || Number.isNaN(to)) return Array.from({ length: 16 }, (_, i) => 8 + i)
  const end = to <= from ? 24 : to
  return Array.from({ length: end - from }, (_, i) => from + i)
}

export default function ComplexDetailPage() {
  const { complexId } = useParams()
  const [searchParams] = useSearchParams()
  const preview = useComplexPreview(complexId, searchParams.get('preview'))
  if (preview.status === 'loading') {
    return (
      <div className="cx-page">
        <div className="container cx-notfound">
          <p>{tr('Yuklanmoqda…')}</p>
        </div>
      </div>
    )
  }
  if (!getComplexById(complexId)) return <ComplexNotFound message={preview.error} />
  return (
    <>
      {preview.status === 'ready' && preview.draft && (
        <div className="cx-preview-banner" role="status">
          {tr('Oldindan ko‘rish: bu majmua hali saytda e’lon qilinmagan — faqat havola egasi ko‘radi.')}
        </div>
      )}
      {/* key: boshqa majmuaga o‘tganda holat (tanlangan xizmat, vaqt, like) yangilanadi */}
      <ComplexDetailView key={complexId} complexId={complexId} />
    </>
  )
}

/** Admin/kabinetdagi «Oldindan ko‘rish» havolasi: ?preview=<imzolangan token> */
function useComplexPreview(complexId, token) {
  const [state, setState] = useState(() => ({ key: null, status: token ? 'loading' : 'idle' }))
  const key = token ? `${complexId}:${token}` : null
  if (state.key !== key) setState({ key, status: token ? 'loading' : 'idle' })

  useEffect(() => {
    if (!token) return undefined
    let active = true
    loadComplexPreview(complexId, token)
      .then((complex) => active && setState({ key: `${complexId}:${token}`, status: 'ready', draft: complex.status !== 'published' }))
      .catch((err) => active && setState({ key: `${complexId}:${token}`, status: 'error', error: err.message }))
    return () => {
      active = false
    }
  }, [complexId, token])
  return state
}

function ComplexNotFound({ message }) {
  return (
    <div className="cx-page">
      <div className="container cx-notfound">
        <h1>{tr('Majmua topilmadi')}</h1>
        <p>{message || tr('Bu sahifa o‘chirilgan yoki manzil noto‘g‘ri. Boshqa majmualarni ko‘rib chiqing.')}</p>
        <Link to="/#majmualar" className="cx-btn cx-btn--primary">
          {tr('Barcha majmualar')} <FiArrowRight />
        </Link>
      </div>
    </div>
  )
}

function ComplexDetailView({ complexId }) {
  const complex = useMemo(() => getComplexById(complexId), [complexId])
  useSeo({
    title: `${complex.name}${complex.city ? ` — ${complex.city}` : ''}`,
    description: complex.tagline || complex.about,
    image: complex.bannerImage || complex.images?.[0],
    type: 'place',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'SportsActivityLocation',
      name: complex.name,
      description: complex.about || undefined,
      image: complex.images?.[0] ? new URL(complex.images[0], window.location.origin).href : undefined,
      address: complex.location ? { '@type': 'PostalAddress', streetAddress: complex.location, addressCountry: 'UZ' } : undefined,
      geo: complex.coords ? { '@type': 'GeoCoordinates', latitude: complex.coords.lat, longitude: complex.coords.lng } : undefined,
      openingHours: complex.hours || undefined,
      aggregateRating: complex.rating && complex.reviews ? { '@type': 'AggregateRating', ratingValue: complex.rating, reviewCount: complex.reviews } : undefined,
    },
  })
  const similar = useMemo(() => getSimilarComplexes(complex, 4), [complex])
  const sidebarComplexes = useMemo(
    () => complexes.filter((c) => c.id !== complex.id && c.verified).slice(0, 4),
    [complex.id],
  )

  const like = useLike('complex', complex.id)
  const [saved, toggleSave] = useSaved('companies', complex.id)
  const [copied, setCopied] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const [searchParams] = useSearchParams()
  const [serviceId, setServiceId] = useState(() => {
    // /bron/:id sahifasidan «Bron qilish» bosilganda shu xizmat tanlangan holda ochiladi
    const fromQuery = Number(searchParams.get('xizmat'))
    return complex.services.some((s) => s.id === fromQuery) ? fromQuery : (complex.services[0]?.id ?? null)
  })
  const reviewsRef = useRef(null)
  const bookingRef = useRef(null)

  useEffect(() => {
    if (window.location.hash === '#bron') bookingRef.current?.scrollIntoView({ block: 'start' })
    else window.scrollTo({ top: 0 })
    trackView(complex.id)
  }, [complex.id])

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* ignore */
    }
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: complex.name, url: pageUrl })
      } catch {
        /* bekor qilindi */
      }
    } else {
      copyLink()
    }
  }

  const chooseService = (id) => {
    setServiceId(id)
    // Kompyuterda bron kartasi yonda doim ko‘rinadi, mobil’da esa unga qaytaramiz
    if (window.matchMedia('(max-width: 1023px)').matches) {
      bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const scrollToReviews = () =>
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const { gallery } = complex
  const extraItems = gallery.length - 5
  const videoCount = gallery.filter((m) => m.type === 'video').length

  return (
    <div className="cx-detail">
      <div className="container">
        <nav className="cx-detail__crumbs" aria-label={tr('Breadcrumb')}>
          <Link to="/">{tr('Bosh sahifa')}</Link>
          <span>/</span>
          <Link to="/#majmualar">{tr('Sport majmualari')}</Link>
          <span>/</span>
          <strong>{complex.name}</strong>
        </nav>

        <header className="cx-head">
          <div className="cx-head__tags">
            <span className="cx-head__cat">{tr(complex.industry)}</span>
            {complex.verified && (
              <span className="cx-head__badge cx-head__badge--green">
                <BadgeCheck size={13} /> {tr('Tasdiqlangan')}
              </span>
            )}
            {complex.hasTrial && (
              <span className="cx-head__badge cx-head__badge--orange">
                <Gift size={13} /> {tr('Bepul sinov darsi')}
              </span>
            )}
          </div>
          <h1 className="cx-head__title">{complex.name}</h1>
          <p className="cx-head__lead">{tr(complex.tagline)}</p>

          <div className="cx-head__meta">
            <div className="cx-head__owner">
              <span className="cx-head__avatar" style={{ background: complex.color }}>
                {complex.name.charAt(0)}
              </span>
              <div>
                <strong>{tr(complex.location)}</strong>
                <span>{complex.sports.map((s) => tr(s)).join(' · ')}</span>
              </div>
            </div>
            <ul className="cx-head__stats">
              <li>
                <button type="button" className="cx-head__rating" onClick={scrollToReviews}>
                  <Star size={15} />{' '}
                  {complex.rating ? (
                    <>
                      <b>{complex.rating}</b> ({complex.reviews} {tr('sharh)')}
                    </>
                  ) : (
                    tr('Hali sharh yo‘q')
                  )}
                </button>
              </li>
              <li><FiClock /> {complex.hours}</li>
              <li><FiEye /> {complex.views.toLocaleString('ru-RU')}</li>
            </ul>
          </div>
        </header>

        {/* ===== Rasmlar mozaikasi ===== */}
        <div className="cx-gallery">
          {gallery.slice(0, 5).map((item, index) => (
            <button
              key={item.url}
              type="button"
              className={`cx-gallery__item ${index === 0 ? 'cx-gallery__item--main' : ''}`}
              onClick={() => setLightbox(index)}
              aria-label={`${index + 1}-${item.type === 'video' ? tr('videoni ochish') : tr('rasmni kattalashtirish')}`}
            >
              <MediaThumb item={item} eager={index === 0} />
              {index === 4 && extraItems > 0 && <span className="cx-gallery__more">+{extraItems}</span>}
            </button>
          ))}
          <button type="button" className="cx-gallery__all" onClick={() => setLightbox(0)}>
            <FiGrid /> {tr('Barchasi (')}{gallery.length}){videoCount > 0 && ` · ${videoCount} ${tr('video')}`}
          </button>
        </div>

        <div className="cx-detail__grid">
          {/* ===== Chap: harakatlar paneli ===== */}
          <aside className="cx-rail" aria-label={tr('Majmua amallari')}>
            <button
              type="button"
              className={`cx-rail__btn ${like.liked ? 'is-active' : ''}`}
              onClick={like.toggle}
              aria-pressed={like.liked}
              aria-label={tr('Yoqdi')}
            >
              <FiHeart />
              <span>{like.count}</span>
            </button>
            <button type="button" className="cx-rail__btn" onClick={scrollToReviews} aria-label={tr('Sharhlar')}>
              <FiMessageCircle />
              <span>{complex.reviews}</span>
            </button>
            <button
              type="button"
              className={`cx-rail__btn ${saved ? 'is-active' : ''}`}
              onClick={toggleSave}
              aria-pressed={saved}
              aria-label={tr('Saqlash')}
            >
              <FiBookmark />
            </button>
            <button type="button" className="cx-rail__btn" onClick={share} aria-label={tr('Ulashish')}>
              {copied ? <FiCheck /> : <FiShare2 />}
            </button>
          </aside>

          {/* ===== Markaz ===== */}
          <div className="cx-detail__main">
            <section className="cx-section">
              <h2 className="cx-section__title">{tr('Majmua haqida')}</h2>
              <p className="cx-about">{tr(complex.about)}</p>

              <ul className="cx-facts">
                <li>
                  <span>{tr('Ish vaqti')}</span>
                  <strong>{complex.hours}</strong>
                </li>
                <li>
                  <span>{tr('Faoliyatda')}</span>
                  <strong>{complex.years} {tr('yil')}</strong>
                </li>
                <li>
                  <span>{tr('Murabbiylar')}</span>
                  <strong>{complex.employees}</strong>
                </li>
                <li>
                  <span>{tr('Xizmatlar')}</span>
                  <strong>{complex.services.length}</strong>
                </li>
              </ul>
            </section>

            <Services complex={complex} selectedId={serviceId} onChoose={chooseService} />

            {complex.amenities.length > 0 && (
            <section className="cx-section">
              <h2 className="cx-section__title">{tr('Qulayliklar')}</h2>
              <ul className="cx-amenities">
                {complex.amenities.map((item) => {
                  const Icon = AMENITY_ICONS[item.id]
                  return (
                    <li key={item.id}>
                      <span className="cx-amenities__icon" aria-hidden="true">
                        {Icon && <Icon size={18} />}
                      </span>
                      {item.label}
                    </li>
                  )
                })}
              </ul>
            </section>
            )}

            <section className="cx-section">
              <h2 className="cx-section__title">{tr('Manzil va aloqa')}</h2>
              <div className="cx-location">
                {complex.coords ? (
                  <div className="cx-location__map cx-location__map--live">
                    <Suspense fallback={null}>
                      <LocationMap coords={complex.coords} title={complex.name} />
                    </Suspense>
                  </div>
                ) : (
                  <div className="cx-location__map" aria-hidden="true">
                    <span className="cx-location__pin">
                      <FiMapPin />
                    </span>
                  </div>
                )}
                <div className="cx-location__body">
                  <ul className="cx-location__list">
                    <li><FiMapPin /> {tr(complex.location)}</li>
                    <li><FiClock /> {/^\d/.test(complex.hours) ? `${tr('Har kuni')}, ${tr(complex.hours)}` : tr(complex.hours)}</li>
                    {complex.hasPhone && (
                      <li><FiPhone /> <PhoneReveal complexId={complex.id} icon={false} className="cx-phone-link" /></li>
                    )}
                    {complex.telegram && (
                      <li>
                        <FaTelegram />
                        <a href={`https://t.me/${complex.telegram.slice(1)}`} target="_blank" rel="noreferrer">
                          {complex.telegram}
                        </a>
                      </li>
                    )}
                  </ul>
                  {complex.coords && (
                    <div className="cx-location__apps">
                      <span>{tr('Xaritada ochish:')}</span>
                      {externalMapLinks(complex.coords, complex.name).map((app) => (
                        <a
                          key={app.id}
                          className={`cx-location__app cx-location__app--${app.id}`}
                          href={app.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FiNavigation /> {app.label}
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="cx-location__actions">
                    <Link to="/xarita" className="cx-btn cx-btn--ghost">
                      {tr('Barcha majmualar xaritada')} <FiArrowUpRight />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <Reviews ref={reviewsRef} complex={complex} />
          </div>

          {/* ===== O‘ng: bron + boshqa majmualar ===== */}
          <aside className="cx-side">
            <Booking ref={bookingRef} complex={complex} serviceId={serviceId} onServiceChange={setServiceId} />

            <section className="cx-side__card">
              <h2 className="cx-side__title">{tr('Boshqa majmualar')}</h2>
              <ol className="cx-side__list">
                {sidebarComplexes.map((item) => (
                  <li key={item.id}>
                    <Link to={`/sport-majmua/${item.id}`} className="cx-side__item">
                      <img src={item.images[0]} alt="" loading="lazy" />
                      <div className="cx-side__body">
                        <strong>{item.name}</strong>
                        <span>
                          {item.rating ? (
                            <>
                              <Star size={11} /> {item.rating} ·{' '}
                            </>
                          ) : null}
                          {item.sports.slice(0, 2).map((s) => tr(s)).join(', ')}
                        </span>
                        {item.minPrice && <em>{formatPrice(item.minPrice)} {tr('so‘mdan')}</em>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>

        <section className="cx-related">
          <div className="cx-related__head">
            <h2>{tr('O‘xshash majmualar')}</h2>
            <Link to="/#majmualar" className="cx-related__all">
              {tr('Barcha majmualar')} <FiArrowRight />
            </Link>
          </div>
          <ul className="cx-related__grid">
            {similar.map((item) => (
              <li key={item.id}>
                <ComplexCard complex={item} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {lightbox !== null && (
        <Lightbox items={gallery} index={lightbox} onChange={setLightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  )
}

function Services({ complex, selectedId, onChoose }) {
  const [sport, setSport] = useState('all')
  const list = sport === 'all' ? complex.services : complex.services.filter((s) => s.category === sport)

  return (
    <section className="cx-section">
      <div className="cx-section__head">
        <h2 className="cx-section__title">{tr('Xizmatlar va narxlar')}</h2>
        {complex.sports.length > 1 && (
          <div className="cx-tabs" role="tablist" aria-label={tr('Sport turi')}>
            {['all', ...complex.sports].map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={sport === item}
                onClick={() => setSport(item)}
              >
                {item === 'all' ? tr('Barchasi') : tr(item)}
              </button>
            ))}
          </div>
        )}
      </div>

      <ul className="cx-services">
        {list.map((service) => {
          const { amount, unit } = splitPrice(service.salary)
          const active = service.id === selectedId
          return (
            <li key={service.id} className={`cx-service ${active ? 'is-active' : ''}`}>
              <div className="cx-service__info">
                <Link to={`/bron/${service.id}`} className="cx-service__title">
                  {service.title}
                </Link>
                <p className="cx-service__meta">
                  <span>{tr(service.category)}</span>
                  <span>{tr(service.typeLabel)}</span>
                  <span>{tr(service.hours)}</span>
                  <span className={`cx-service__mode cx-service__mode--${bookingModeOf(service)}`}>
                    {BOOKING_MODES[bookingModeOf(service)].label}
                  </span>
                </p>
              </div>
              <div className="cx-service__price">
                <strong>{tr(amount)}</strong>
                {unit && <span>/ {tr(unit)}</span>}
              </div>
              <button
                type="button"
                className={`cx-btn ${active ? 'cx-btn--primary' : 'cx-btn--ghost'}`}
                onClick={() => onChoose(service.id)}
                aria-pressed={active}
              >
                {active ? <><FiCheck /> {tr('Tanlandi')}</> : tr('Tanlash')}
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Booking({ ref, complex, serviceId, onServiceChange }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const days = useMemo(() => buildDays(), [])
  const [day, setDay] = useState(0)
  const [time, setTime] = useState(null)
  const [busy, setBusy] = useState({})
  const [reload, setReload] = useState(0)
  const [step, setStep] = useState('pick')
  const [contact, setContact] = useState(() => ({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : '',
    phone: user?.phone ?? '',
    note: '',
  }))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)
  const service = complex.services.find((s) => s.id === serviceId) ?? complex.services[0]
  // Bron usuli admin panelda belgilanadi: slot — sana/vaqt; request — vaqtsiz ariza; call — faqat aloqa
  const mode = bookingModeOf(service)
  const online = !isTimedService(service)
  const nowHour = new Date().getHours()

  // Haqiqiy band vaqtlar — backenddan
  useEffect(() => {
    if (!service || online) return undefined
    const controller = new AbortController()
    api(`/services/${service.id}/availability?from=${days[0].iso}&days=${days.length}`, { signal: controller.signal })
      .then((data) => setBusy(data.busy ?? {}))
      .catch(() => null)
    return () => controller.abort()
  }, [service, online, days, reload])

  const slots = useMemo(() => {
    const taken = busy[days[day].iso] ?? []
    return buildHours(service?.hours ?? complex.hours).map((hour) => ({
      hour,
      label: `${String(hour).padStart(2, '0')}:00`,
      busy: taken.includes(hour) || (day === 0 && hour <= nowHour),
    }))
  }, [service, complex.hours, day, days, busy, nowHour])

  const freeCount = slots.filter((slot) => !slot.busy).length
  const price = parsePrice(service?.salary)
  const { unit } = splitPrice(service?.salary)

  if (!service) return null

  const canContinue = mode !== 'call' && (online || time !== null)
  const isRequest = mode !== 'slot'

  function next() {
    if (!canContinue) return
    if (!user) {
      navigate('/kirish', { state: { from: `${location.pathname}#bron` } })
      return
    }
    setError('')
    setStep('contact')
  }

  async function submit(event) {
    event.preventDefault()
    const name = contact.name.trim()
    if (name.length < 2) return setError(tr('Ismingizni kiriting'))
    if (!isValidPhone(contact.phone)) return setError(tr('Telefon raqamni to‘liq kiriting'))
    setSubmitting(true)
    setError('')
    try {
      const { booking } = await api('/bookings', {
        method: 'POST',
        body: {
          serviceId: service.id,
          date: online ? null : days[day].iso,
          hour: online ? null : time,
          name,
          phone: toLocalDigits(contact.phone),
          note: contact.note.trim() || undefined,
        },
      })
      setDone(booking)
      setStep('done')
      setTime(null)
      setReload((n) => n + 1)
    } catch (err) {
      setError(err.message)
      if (err.code === 'SLOT_TAKEN' || err.code === 'SLOT_PAST') {
        setTime(null)
        setStep('pick')
        setReload((n) => n + 1)
      }
      if (err.status === 401) navigate('/kirish', { state: { from: `${location.pathname}#bron` } })
    } finally {
      setSubmitting(false)
    }
  }

  const contacts = (
    <div className="cx-book__contacts">
      {complex.hasPhone && <PhoneReveal complexId={complex.id} className="cx-btn cx-btn--ghost" label={tr('Qo‘ng‘iroq')} />}
      {complex.telegram && (
        <a
          href={`https://t.me/${complex.telegram.slice(1)}`}
          target="_blank"
          rel="noreferrer"
          className="cx-btn cx-btn--ghost"
        >
          <FaTelegram /> {tr('Telegram')}
        </a>
      )}
    </div>
  )

  if (step === 'done' && done) {
    return (
      <section className="cx-book" ref={ref} id="bron">
        <div className="cx-book__done" role="status">
          <span className="cx-book__done-icon" aria-hidden="true">
            <FiCheck />
          </span>
          <h3>{isRequest ? tr('Ariza qabul qilindi') : tr('Bron qabul qilindi')}</h3>
          <p>
            {isRequest ? tr('Ariza') : tr('Bron')} {tr('kodi:')} <b>{done.code}</b>
          </p>
          <dl className="cx-book__summary">
            <div>
              <dt>{service.title}</dt>
              <dd>{service.salary}</dd>
            </div>
            {done.date && (
              <div>
                <dt>{tr('Vaqt')}</dt>
                <dd>
                  {done.date.split('-').reverse().join('.')} · {String(done.hour).padStart(2, '0')}:00
                </dd>
              </div>
            )}
          </dl>
          <p className="cx-book__note">
            {isRequest
              ? tr('Majmua siz bilan bog‘lanib, vaqt va shartlarni kelishadi. Holatni profilingizda kuzating.')
              : tr('Majmua bronni tasdiqlagach, sizga xabar beramiz. Holatni profilingizda kuzating.')}
          </p>
          <Link to="/profil" className="cx-book__cta">
            {tr('Bronlarimni ko‘rish')}
          </Link>
          <button type="button" className="cx-btn cx-btn--ghost" onClick={() => setStep('pick')}>
            {isRequest ? tr('Yana ariza qoldirish') : tr('Yana bron qilish')}
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="cx-book" ref={ref} id="bron">
      <div className="cx-book__head">
        <p className="cx-book__price">
          {complex.minPrice ? (
            <>
              {formatPrice(complex.minPrice)} {tr('so‘m')}<span>{tr('dan')}</span>
            </>
          ) : (
            tr(complex.priceNote ?? 'Narxi kelishiladi')
          )}
        </p>
        {!online && (
          <p className={`cx-book__status ${freeCount < 4 ? 'is-low' : ''}`}>
            <span aria-hidden="true" />
            {freeCount === 0 ? tr('Bu kunga joy yo‘q') : freeCount < 4 ? tr('Kam joy qoldi') : tr('Bo‘sh joy bor')}
          </p>
        )}
      </div>

      {step === 'pick' ? (
        <>
          <label className="cx-book__field">
            <span>{tr('Xizmat')}</span>
            <select
              value={service.id}
              onChange={(e) => {
                onServiceChange(Number(e.target.value))
                setTime(null)
              }}
            >
              {complex.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>

          {!online && (
            <>
              <div className="cx-book__field">
                <span>{tr('Sana')}</span>
                <div className="cx-book__days">
                  {days.map((d) => (
                    <button
                      key={d.index}
                      type="button"
                      className={day === d.index ? 'is-active' : ''}
                      aria-pressed={day === d.index}
                      onClick={() => {
                        setDay(d.index)
                        setTime(null)
                      }}
                    >
                      <small>{d.label}</small>
                      <b>{d.day}</b>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cx-book__field">
                <span>
                  {tr('Vaqt')} <em>{freeCount} {tr('ta bo‘sh')}</em>
                </span>
                <div className="cx-book__slots">
                  {slots.map((slot) => (
                    <button
                      key={slot.hour}
                      type="button"
                      disabled={slot.busy}
                      className={time === slot.hour ? 'is-active' : ''}
                      aria-pressed={time === slot.hour}
                      onClick={() => setTime(slot.hour)}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <dl className="cx-book__summary">
            <div>
              <dt>{service.title}</dt>
              <dd>{price ? `${formatPrice(price)} ${tr('so‘m')}` : tr(service.salary)}</dd>
            </div>
            {mode === 'slot' && unit && (
              <div>
                <dt>{tr('Davomiyligi')}</dt>
                <dd>1 {tr(unit)}</dd>
              </div>
            )}
            {mode === 'slot' && (
              <div className="cx-book__total">
                <dt>{tr('Jami')}</dt>
                <dd>{price ? `${formatPrice(price)} ${tr('so‘m')}` : tr(service.salary)}</dd>
              </div>
            )}
          </dl>

          {mode === 'request' && (
            <p className="cx-book__info">
              {tr('Bu xizmatga vaqt tanlanmaydi: ariza qoldiring, majmua siz bilan bog‘lanib jadval va shartlarni kelishadi.')}
            </p>
          )}
          {mode === 'call' && (
            <div className="cx-book__info">
              <p>
                {tr('Bu xizmatni onlayn band qilib bo‘lmaydi')}
                {unit === 'oy' ? tr(' (oylik abonement)') : ''}. {tr('Shartlar va bo‘sh joylarni majmuadan so‘rang.')}
              </p>
              {complex.hasPhone ? (
                <PhoneReveal complexId={complex.id} className="cx-book__cta" />
              ) : (
                !complex.telegram && <p>{tr('Majmua aloqa ma’lumotlarini hali kiritmagan.')}</p>
              )}
            </div>
          )}

          {error && (
            <p className="cx-book__error" role="alert">
              {error}
            </p>
          )}
          {mode !== 'call' && (
            <>
              <button
                type="button"
                className={`cx-book__cta ${canContinue ? '' : 'is-disabled'}`}
                aria-disabled={!canContinue}
                onClick={next}
              >
                {!canContinue
                  ? tr('Vaqtni tanlang')
                  : !user
                    ? tr('{action} uchun kiring', { action: BOOKING_MODES[mode].cta })
                    : isRequest
                      ? BOOKING_MODES[mode].cta
                      : tr('Davom etish')}
              </button>
              <p className="cx-book__note">
                {isRequest
                  ? tr('Ariza bepul · Majmua siz bilan bog‘lanadi')
                  : tr('Majmua tasdiqlagach xabar olasiz · Bepul bekor qilish (3 soat oldin)')}
              </p>
            </>
          )}
        </>
      ) : (
        <form className="cx-book__form" onSubmit={submit} noValidate>
          <p className="cx-book__picked">
            <b>{service.title}</b>
            <span>
              {online
                ? tr('Vaqt majmua bilan kelishiladi')
                : `${days[day].label}, ${days[day].day} · ${String(time).padStart(2, '0')}:00`}
            </span>
          </p>
          <label className="cx-book__field">
            <span>{tr('Ismingiz')}</span>
            <input
              value={contact.name}
              onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
              autoComplete="name"
              maxLength={80}
              required
            />
          </label>
          <label className="cx-book__field">
            <span>{tr('Telefon')}</span>
            <input
              value={contact.phone ? formatPhone(contact.phone) : ''}
              onChange={(e) => setContact((c) => ({ ...c, phone: toLocalDigits(e.target.value) }))}
              inputMode="tel"
              autoComplete="tel"
              placeholder="+998 90 123 45 67"
              required
            />
          </label>
          <label className="cx-book__field">
            <span>{tr('Izoh (ixtiyoriy)')}</span>
            <textarea
              rows={2}
              value={contact.note}
              maxLength={500}
              onChange={(e) => setContact((c) => ({ ...c, note: e.target.value }))}
              placeholder={tr('Masalan: 10 kishilik jamoa')}
            />
          </label>
          {error && (
            <p className="cx-book__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="cx-book__cta" disabled={submitting}>
            {submitting ? tr('Yuborilmoqda…') : isRequest ? tr('Arizani yuborish') : tr('Bronni tasdiqlash')}
          </button>
          <button type="button" className="cx-btn cx-btn--ghost" onClick={() => setStep('pick')} disabled={submitting}>
            <FiChevronLeft /> {tr('Orqaga')}
          </button>
        </form>
      )}

      {contacts}
    </section>
  )
}

function Stars({ value, size = 14 }) {
  return (
    <span className="cx-stars" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= Math.round(value) ? 'is-on' : ''} />
      ))}
    </span>
  )
}

const AVATAR_COLORS = ['#1e6ff5', '#c026d3', '#16a34a', '#ea580c', '#0d9488', '#7c3aed']
const avatarColor = (name = '') => AVATAR_COLORS[[...name].reduce((s, c) => s + c.charCodeAt(0), 0) % AVATAR_COLORS.length]

function Reviews({ ref, complex }) {
  const { user } = useAuth()
  const { guard, modal } = useAuthGate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const summary = summarizeReviews(reviews)

  useEffect(() => {
    const controller = new AbortController()
    api(`/complexes/${encodeURIComponent(complex.id)}/reviews`, { signal: controller.signal })
      .then((data) => setReviews(data.reviews ?? []))
      .catch(() => null)
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [complex.id])

  const submit = async (e) => {
    e?.preventDefault()
    // Sharhni faqat ro‘yxatdan o‘tgan foydalanuvchi yozadi
    if (!guard('comment')) return
    const value = text.trim()
    if (value.length < 3 || sending) return
    setSending(true)
    setError('')
    try {
      const { review } = await api(`/complexes/${encodeURIComponent(complex.id)}/reviews`, {
        method: 'POST',
        body: { rating, text: value },
      })
      setReviews((prev) => [{ ...review, isNew: true }, ...prev])
      setText('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="cx-section cx-reviews" ref={ref} id="sharhlar">
      <h2 className="cx-section__title">
        {tr('Sharhlar')} <span>{summary.total}</span>
      </h2>

      {summary.total > 0 ? (
        <div className="cx-score">
          <div className="cx-score__big">
            <strong>{summary.average}</strong>
            <Stars value={summary.average} size={16} />
            <span>{summary.total} {tr('ta baho')}</span>
          </div>
          <ul className="cx-score__bars">
            {summary.breakdown.map((row) => (
              <li key={row.stars}>
                <span>{row.stars}</span>
                <Star size={12} className="is-on" />
                <span className="cx-score__bar">
                  <span style={{ width: `${row.percent}%` }} />
                </span>
                <em>{row.percent}%</em>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && <p className="cx-reviews__empty">{tr('Hali sharh yo‘q. Birinchi bo‘lib taassurotingizni qoldiring!')}</p>
      )}

      <form className="cx-form" onSubmit={submit}>
        <div className="cx-form__rate">
          <span>{tr('Bahoingiz:')}</span>
          <div className="cx-form__stars" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={tr('{n} yulduz', { n })}
                aria-pressed={rating === n}
                onMouseEnter={() => setHover(n)}
                onClick={() => setRating(n)}
              >
                <Star size={22} className={n <= (hover || rating) ? 'is-on' : ''} />
              </button>
            ))}
          </div>
        </div>
        <textarea
          placeholder={user ? tr('Majmua haqida taassurotlaringizni yozing…') : tr('Sharh yozish uchun ro‘yxatdan o‘ting yoki kiring…')}
          rows={3}
          value={text}
          maxLength={MAX_REVIEW}
          readOnly={!user}
          onFocus={() => !user && guard('comment')}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit(e)
          }}
        />
        {error && (
          <p className="cx-book__error" role="alert">
            {error}
          </p>
        )}
        <div className="cx-form__bar">
          <span>{MAX_REVIEW - text.length}</span>
          <button type="submit" className="cx-btn cx-btn--primary" disabled={Boolean(user) && (text.trim().length < 3 || sending)}>
            {sending ? tr('Yuborilmoqda…') : tr('Sharh qoldirish')} <FiSend />
          </button>
        </div>
      </form>
      {modal}

      <ul className="cx-reviews__list">
        {reviews.map((review) => (
          <li key={review.id} className={`cx-review ${review.isNew ? 'is-new' : ''}`}>
            <span className="cx-avatar" style={{ background: avatarColor(review.author) }}>
              {initials(review.author)}
            </span>
            <div className="cx-review__content">
              <div className="cx-review__meta">
                <strong>{review.author}</strong>
                <Stars value={review.rating} size={12} />
                <span>{formatRelative(review.createdAt)}</span>
              </div>
              <p>{review.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Galereya kichik ko‘rinishi: rasm, YouTube muqovasi yoki videoning birinchi kadri */
function MediaThumb({ item, eager = false }) {
  const thumb = mediaThumb(item)
  return (
    <>
      {thumb ? (
        <img
          src={thumb}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          onError={(event) => {
            event.currentTarget.src = FALLBACK_IMAGE
          }}
        />
      ) : item.type === 'video' && !isEmbed(item) ? (
        <video src={`${item.url}#t=0.5`} muted playsInline preload="metadata" />
      ) : (
        <span className="cx-media-ph">
          <FaInstagram aria-hidden="true" />
        </span>
      )}
      {item.type === 'video' && (
        <span className="cx-media-play" aria-hidden="true">
          <FiPlay />
        </span>
      )}
    </>
  )
}

function MediaStage({ item }) {
  const stop = (e) => e.stopPropagation()
  if (item.type === 'image') return <img src={item.url} alt="" onClick={stop} />
  if (isEmbed(item)) {
    const src = item.provider === 'youtube' ? `${item.url}?autoplay=1&rel=0` : item.url
    return (
      <iframe
        key={item.url}
        className={`cx-lightbox__frame ${item.provider === 'instagram' ? 'is-portrait' : ''}`}
        src={src}
        title={tr('Video')}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        onClick={stop}
      />
    )
  }
  return <video key={item.url} className="cx-lightbox__video" src={item.url} controls autoPlay playsInline onClick={stop} />
}

function Lightbox({ items, index, onChange, onClose }) {
  const count = items.length
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onChange((index + 1) % count)
      if (e.key === 'ArrowLeft') onChange((index - 1 + count) % count)
    }
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  }, [index, count, onChange, onClose])

  return (
    <div className="cx-lightbox" role="dialog" aria-modal="true" aria-label={tr('Rasm va videolar')} onClick={onClose}>
      <button type="button" className="cx-lightbox__close" aria-label={tr('Yopish')} onClick={onClose}>
        <FiX />
      </button>
      <span className="cx-lightbox__count">
        {index + 1} / {count}
      </span>
      <button
        type="button"
        className="cx-lightbox__nav cx-lightbox__nav--prev"
        aria-label={tr('Oldingi')}
        onClick={(e) => {
          e.stopPropagation()
          onChange((index - 1 + count) % count)
        }}
      >
        <FiChevronLeft />
      </button>
      <MediaStage item={items[index]} />
      <button
        type="button"
        className="cx-lightbox__nav cx-lightbox__nav--next"
        aria-label={tr('Keyingi')}
        onClick={(e) => {
          e.stopPropagation()
          onChange((index + 1) % count)
        }}
      >
        <FiChevronRight />
      </button>
      <div className="cx-lightbox__thumbs" onClick={(e) => e.stopPropagation()}>
        {items.map((item, i) => (
          <button
            key={item.url}
            type="button"
            className={i === index ? 'is-active' : ''}
            onClick={() => onChange(i)}
            aria-label={`${i + 1}-${item.type === 'video' ? tr('video') : tr('rasm')}`}
          >
            <MediaThumb item={item} />
          </button>
        ))}
      </div>
    </div>
  )
}
