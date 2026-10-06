import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiBookmark,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiCreditCard,
  FiEye,
  FiLink,
  FiMapPin,
  FiNavigation,
  FiShare2,
  FiUser,
  FiUsers,
} from 'react-icons/fi'
import { FaFacebookF, FaLinkedinIn, FaTelegram, FaXTwitter } from 'react-icons/fa6'
import { getSportEvent, sportEvents } from '../data/campaigns.js'
import { useLocalStorageState } from '../hooks/useLocalStorageState.js'
import { useReadingProgress } from '../hooks/useReadingProgress.js'
import { trackEventView } from '../services/catalog.js'
import './NewsDetailPage.css'
import './EventDetailPage.css'

const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']
const WEEKDAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

// Sanalar Toshkent vaqtida ko‘rsatiladi (UTC+5)
const tashkent = (iso) => new Date(new Date(iso).getTime() + 5 * 3600 * 1000)
const formatDay = (iso) => {
  const d = tashkent(iso)
  return `${d.getUTCDate()}-${MONTHS[d.getUTCMonth()]}`
}
const formatTime = (iso) => tashkent(iso).toISOString().slice(11, 16)
const weekday = (iso) => WEEKDAYS[tashkent(iso).getUTCDay()]
const isSameDay = (a, b) => formatDay(a) === formatDay(b)

function dateRange(event) {
  const year = tashkent(event.startsAt).getUTCFullYear()
  return isSameDay(event.startsAt, event.endsAt)
    ? `${formatDay(event.startsAt)}, ${year}`
    : `${formatDay(event.startsAt)} – ${formatDay(event.endsAt)}, ${year}`
}

function eventStatus(event, now) {
  if (now > new Date(event.endsAt)) return { key: 'ended', label: 'Yakunlangan' }
  if (now >= new Date(event.startsAt)) return { key: 'live', label: 'Davom etmoqda' }
  if (event.capacity > 0 && event.registered / event.capacity >= 0.9) return { key: 'few', label: 'Joylar tugayapti' }
  return { key: 'open', label: 'Ro‘yxat ochiq' }
}

/** Har daqiqada yangilanadigan joriy vaqt (ortga sanoq uchun) */
function useNow(interval = 30_000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

function downloadIcs(event) {
  const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const esc = (t) => t.replace(/[,;\\]/g, (m) => `\\${m}`)
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SportON//Tadbirlar//UZ',
    'BEGIN:VEVENT',
    `UID:${event.id}@sporton.uz`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(event.startsAt)}`,
    `DTEND:${stamp(event.endsAt)}`,
    `SUMMARY:${esc(event.title)}`,
    `LOCATION:${esc(event.venue.address)}`,
    `DESCRIPTION:${esc(event.excerpt)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `${event.id}.ics` })
  a.click()
  URL.revokeObjectURL(url)
}

export default function EventDetailPage() {
  const { eventId } = useParams()
  if (!getSportEvent(eventId)) return <EventNotFound />
  // key: boshqa tadbirga o‘tganda holat yangilanadi
  return <EventDetailView key={eventId} eventId={eventId} />
}

function EventNotFound() {
  return (
    <div className="news-page">
      <div className="container news-notfound">
        <h1>Tadbir topilmadi</h1>
        <p>Bu tadbir o‘chirilgan yoki manzil noto‘g‘ri.</p>
        <Link to="/#tadbirlar" className="news-notfound__btn">Barcha tadbirlar</Link>
      </div>
    </div>
  )
}

function EventDetailView({ eventId }) {
  const event = useMemo(() => getSportEvent(eventId), [eventId])
  const index = sportEvents.indexOf(event)
  const prev = sportEvents[index - 1]
  const next = sportEvents[index + 1]
  const others = sportEvents.filter((e) => e.id !== event.id)

  const now = useNow()
  const status = eventStatus(event, now)
  const [joined, setJoined] = useLocalStorageState(`sporton:event:${event.id}`, '')
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const ticketRef = useRef(null)
  const articleRef = useRef(null)
  const progress = useReadingProgress(articleRef)

  useEffect(() => {
    window.scrollTo({ top: 0 })
    trackEventView(event.id)
  }, [event.id])

  const isJoined = joined === 'yes'
  const taken = event.registered + (isJoined ? 1 : 0)
  const fill = event.capacity > 0 ? Math.min(100, Math.round((taken / event.capacity) * 100)) : 0
  const left = Math.max(0, event.capacity - taken)
  const canJoin = status.key === 'open' || status.key === 'few'

  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const enc = encodeURIComponent
  const mapUrl = `https://yandex.uz/maps/?text=${enc(event.venue.address)}`
  const shareLinks = [
    { label: 'Telegram', icon: <FaTelegram />, href: `https://t.me/share/url?url=${enc(pageUrl)}&text=${enc(event.title)}` },
    { label: 'Facebook', icon: <FaFacebookF />, href: `https://www.facebook.com/sharer/sharer.php?u=${enc(pageUrl)}` },
    { label: 'X', icon: <FaXTwitter />, href: `https://x.com/intent/tweet?url=${enc(pageUrl)}&text=${enc(event.title)}` },
    { label: 'LinkedIn', icon: <FaLinkedinIn />, href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(pageUrl)}` },
  ]

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
        await navigator.share({ title: event.title, url: pageUrl })
      } catch {
        /* bekor qilindi */
      }
    } else {
      copyLink()
    }
  }

  const scrollToTicket = () => ticketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const facts = [
    { icon: <FiCalendar />, label: 'Sana', value: dateRange(event), sub: weekday(event.startsAt) },
    { icon: <FiClock />, label: 'Boshlanish', value: formatTime(event.startsAt), sub: `Tugash: ${formatTime(event.endsAt)}` },
    { icon: <FiMapPin />, label: 'Manzil', value: event.venue.name, sub: event.location },
    { icon: <FiCreditCard />, label: 'Ishtirok to‘lovi', value: event.fee },
    event.prize && { icon: <FiAward />, label: 'Sovrin jamg‘armasi', value: event.prize },
    { icon: <FiBarChart2 />, label: 'Daraja', value: event.level, sub: `Yosh: ${event.age}` },
  ].filter(Boolean)

  return (
    <div className="news-detail ev-detail">
      <div className="news-detail__progress" style={{ transform: `scaleX(${progress})` }} />

      <div className="container">
        <nav className="news-detail__crumbs" aria-label="Breadcrumb">
          <Link to="/">Bosh sahifa</Link>
          <span>/</span>
          <Link to="/#tadbirlar">Sport tadbirlari</Link>
          <span>/</span>
          <strong>{event.category}</strong>
        </nav>

        <header className="news-head">
          <div className="news-head__tags">
            <span className="news-head__cat">{event.category}</span>
            <span className={`ev-status ev-status--${status.key}`}>
              <span className="ev-status__dot" />
              {status.label}
            </span>
          </div>
          <h1 className="news-head__title">{event.title}</h1>
          <p className="news-head__lead">{event.excerpt}</p>

          <div className="news-head__meta">
            <div className="news-head__author">
              <span className="news-head__avatar">
                <FiUser />
              </span>
              <div>
                <strong>{event.organizer.name}</strong>
                <span>{event.organizer.role}</span>
              </div>
            </div>
            <ul className="news-head__stats">
              <li><FiCalendar /> {dateRange(event)}</li>
              <li><FiClock /> {formatTime(event.startsAt)}</li>
              <li><FiUsers /> {taken.toLocaleString('ru-RU')} ishtirokchi</li>
              <li><FiEye /> {event.views.toLocaleString('ru-RU')}</li>
            </ul>
          </div>
        </header>

        <figure className="news-cover ev-cover">
          <img src={event.image} alt={event.title} />
          <div className="ev-cover__ticket" aria-hidden="true">
            <span className="ev-cover__day">{formatDay(event.startsAt)}</span>
            <span className="ev-cover__year">{tashkent(event.startsAt).getUTCFullYear()}</span>
            <span className="ev-cover__time">{formatTime(event.startsAt)}</span>
          </div>
        </figure>

        <div className="news-detail__grid">
          {/* ===== Chap: harakatlar paneli ===== */}
          <aside className="news-rail" aria-label="Tadbir amallari">
            <button
              type="button"
              className={`news-rail__btn ${saved ? 'is-active' : ''}`}
              onClick={() => setSaved((v) => !v)}
              aria-pressed={saved}
              aria-label="Saqlash"
            >
              <FiBookmark />
            </button>
            <button type="button" className="news-rail__btn" onClick={() => downloadIcs(event)} aria-label="Kalendarga qo‘shish">
              <FiCalendar />
            </button>
            <button type="button" className="news-rail__btn" onClick={share} aria-label="Ulashish">
              {copied ? <FiCheck /> : <FiShare2 />}
            </button>
            {canJoin && (
              <button
                type="button"
                className={`news-rail__btn ${isJoined ? 'is-active' : ''}`}
                onClick={scrollToTicket}
                aria-label="Ro‘yxatdan o‘tish"
              >
                <FiCheckCircle />
              </button>
            )}
          </aside>

          {/* ===== Markaz ===== */}
          <div className="news-detail__main">
            <div className="ev-facts">
              {facts.map((f) => (
                <div key={f.label} className="ev-fact">
                  <span className="ev-fact__icon">{f.icon}</span>
                  <span className="ev-fact__text">
                    <small>{f.label}</small>
                    <strong>{f.value}</strong>
                    {f.sub && <em>{f.sub}</em>}
                  </span>
                </div>
              ))}
            </div>

            <article className="news-article ev-article" ref={articleRef}>
              {event.about.length > 0 && (
                <>
                  <h2 className="ev-h2">Tadbir haqida</h2>
                  <p className="news-article__lead">{event.about[0]}</p>
                  {event.about.slice(1).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </>
              )}

              {event.includes.length > 0 && (
                <>
                  <h2 className="ev-h2">Ishtirokchilar uchun</h2>
                  <ul className="ev-includes">
                    {event.includes.map((item) => (
                      <li key={item}>
                        <span><FiCheck /></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {event.schedule.length > 0 && (
                <>
                  <h2 className="ev-h2">Dastur</h2>
                  <ol className="ev-timeline">
                    {event.schedule.map((s, i) => (
                      <li key={i}>
                        <span className="ev-timeline__time">{s.time}</span>
                        <span className="ev-timeline__body">
                          <strong>{s.label}</strong>
                          {s.note && <span>{s.note}</span>}
                        </span>
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {event.rules.length > 0 && (
                <>
                  <h2 className="ev-h2">Shartlar va talablar</h2>
                  <ul className="ev-rules">
                    {event.rules.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </>
              )}

              <h2 className="ev-h2">O‘tkaziladigan joy</h2>
              <div className="ev-venue">
                <span className="ev-venue__pin"><FiMapPin /></span>
                <div className="ev-venue__text">
                  <strong>{event.venue.name}</strong>
                  <span>{event.venue.address}</span>
                </div>
                <a href={mapUrl} target="_blank" rel="noreferrer" className="ev-venue__btn">
                  <FiNavigation /> Yo‘nalish
                </a>
              </div>

              {event.faq?.length > 0 && (
                <>
                  <h2 className="ev-h2">Ko‘p beriladigan savollar</h2>
                  <div className="ev-faq">
                    {event.faq.map((f) => (
                      <details key={f.q}>
                        <summary>
                          {f.q}
                          <FiChevronDown />
                        </summary>
                        <p>{f.a}</p>
                      </details>
                    ))}
                  </div>
                </>
              )}
            </article>

            <section className="news-share">
              <div className="news-share__text">
                <h2>Birga qatnashamizmi?</h2>
                <p>Tadbirni do‘stlaringiz va jamoangiz bilan ulashing.</p>
              </div>
              <div className="news-share__actions">
                {shareLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="news-share__icon"
                    aria-label={`${s.label} orqali ulashish`}
                  >
                    {s.icon}
                  </a>
                ))}
                <button type="button" className="news-share__icon" onClick={copyLink} aria-label="Havolani nusxalash">
                  {copied ? <FiCheck /> : <FiLink />}
                </button>
              </div>
            </section>

            <nav className="news-pager" aria-label="Boshqa tadbirlar">
              {prev ? (
                <Link to={`/tadbir/${prev.id}`} className="news-pager__item">
                  <span><FiArrowLeft /> Oldingi tadbir</span>
                  <strong>{prev.title}</strong>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link to={`/tadbir/${next.id}`} className="news-pager__item news-pager__item--next">
                  <span>Keyingi tadbir <FiArrowRight /></span>
                  <strong>{next.title}</strong>
                </Link>
              )}
            </nav>
          </div>

          {/* ===== O‘ng: chipta va boshqa tadbirlar ===== */}
          <aside className="news-side">
            <section className="ev-ticket" ref={ticketRef} id="royxat">
              <div className="ev-ticket__head">
                <span className="ev-ticket__label">
                  {status.key === 'ended' ? 'Tadbir yakunlandi' : status.key === 'live' ? 'Hozir davom etmoqda' : 'Boshlanishiga'}
                </span>
                {canJoin ? <Countdown to={event.startsAt} now={now} /> : (
                  <strong className="ev-ticket__date">{dateRange(event)}</strong>
                )}
              </div>

              <div className="ev-ticket__body">
                <div className="ev-ticket__price">
                  <span>Ishtirok to‘lovi</span>
                  <strong>{event.fee}</strong>
                </div>

                <div className="ev-ticket__seats">
                  <div className="ev-ticket__seats-row">
                    <span><FiUsers /> {taken.toLocaleString('ru-RU')} / {event.capacity.toLocaleString('ru-RU')}</span>
                    <span>{fill}%</span>
                  </div>
                  <div className="ev-ticket__bar" role="progressbar" aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100}>
                    <span style={{ width: `${fill}%` }} />
                  </div>
                  {canJoin && <small>{left.toLocaleString('ru-RU')} ta joy qoldi</small>}
                </div>

                {isJoined ? (
                  <div className="ev-ticket__done">
                    <FiCheckCircle />
                    <div>
                      <strong>Siz ro‘yxatdasiz</strong>
                      <span>Tafsilotlar SMS orqali yuboriladi</span>
                    </div>
                  </div>
                ) : null}

                <button
                  type="button"
                  className={`ev-ticket__btn ${isJoined ? 'is-secondary' : ''}`}
                  disabled={!canJoin}
                  onClick={() => setJoined(isJoined ? '' : 'yes')}
                >
                  {!canJoin ? status.label : isJoined ? 'Ro‘yxatdan chiqish' : 'Ro‘yxatdan o‘tish'}
                </button>
                <button type="button" className="ev-ticket__ghost" onClick={() => downloadIcs(event)}>
                  <FiCalendar /> Kalendarga qo‘shish
                </button>
              </div>
            </section>

            {others.length > 0 && (
            <section className="news-side__card">
              <h2 className="news-side__title">Boshqa tadbirlar</h2>
              <ol className="news-side__list">
                {others.map((item) => (
                  <li key={item.id}>
                    <Link to={`/tadbir/${item.id}`} className="news-side__item ev-side__item">
                      <span className="ev-side__date">
                        <strong>{formatDay(item.startsAt).split('-')[0]}</strong>
                        {MONTHS[tashkent(item.startsAt).getUTCMonth()].slice(0, 3)}
                      </span>
                      <div className="news-side__body">
                        <strong>{item.title}</strong>
                        <span>{item.category} · {item.location}</span>
                      </div>
                      <img src={item.image} alt="" loading="lazy" />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
            )}
          </aside>
        </div>

        {others.length > 0 && (
        <section className="news-related">
          <div className="news-related__head">
            <h2>Sizga yoqishi mumkin</h2>
            <Link to="/bolim/musobaqalar" className="news-related__all">
              Barcha musobaqa va tadbirlar <FiArrowRight />
            </Link>
          </div>
          <div className="news-related__grid">
            {others.slice(0, 3).map((item) => (
              <Link key={item.id} to={`/tadbir/${item.id}`} className="news-card">
                <div className="news-card__media">
                  <img src={item.image} alt="" loading="lazy" />
                  <span className="news-card__cat">{item.category}</span>
                </div>
                <div className="news-card__body">
                  <span className="news-card__date"><FiCalendar /> {dateRange(item)} · {formatTime(item.startsAt)}</span>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        )}

        <Link to="/#tadbirlar" className="ev-back">
          <FiArrowLeft /> Barcha sport tadbirlari
        </Link>
      </div>
    </div>
  )
}

function Countdown({ to, now }) {
  const diff = Math.max(0, new Date(to) - now)
  const parts = [
    { value: Math.floor(diff / 86_400_000), label: 'kun' },
    { value: Math.floor(diff / 3_600_000) % 24, label: 'soat' },
    { value: Math.floor(diff / 60_000) % 60, label: 'daqiqa' },
  ]
  return (
    <div className="ev-countdown" role="timer" aria-live="off">
      {parts.map((p) => (
        <span key={p.label}>
          <strong>{String(p.value).padStart(2, '0')}</strong>
          {p.label}
        </span>
      ))}
    </div>
  )
}
