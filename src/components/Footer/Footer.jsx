import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
  FiGlobe,
  FiActivity,
  FiMail,
} from 'react-icons/fi'
import { ShieldCheck } from 'lucide-react'
import {
  FaInstagram,
  FaTelegram,
} from 'react-icons/fa6'
import { LANGUAGES } from '../../data/languages.js'
import { useLocalStorageState } from '../../hooks/useLocalStorageState.js'
import { SOCIAL_LINKS } from '../../data/social.js'
import BrandLogo from '../Brand/BrandLogo.jsx'
import { api } from '../../services/apiClient.js'
import './Footer.css'
import { tr } from '../../i18n/index.js'

const SOCIALS = [
  { id: 'telegram', label: tr('Telegram'), Icon: FaTelegram, href: SOCIAL_LINKS.telegram.href },
  { id: 'instagram', label: tr('Instagram'), Icon: FaInstagram, href: SOCIAL_LINKS.instagram.href },
]

const PLATFORM_LINKS = [
  { label: tr('Bosh sahifa'), to: '/' },
  { label: tr('Loyiha haqida'), to: '/sahifa/loyiha-haqida' },
  { label: tr('Majmua qo‘shish'), to: '/sahifa/elon-joylash' },
  { label: tr('Sport majmualari'), href: '/#majmualar' },
  { label: tr('Sport yangiliklari'), href: '/#yangiliklar' },
  { label: tr('Sport tadbirlari'), href: '/#tadbirlar' },
  { label: tr('Aloqa'), to: '/sahifa/aloqa' },
]

const CATEGORY_LINKS = [
  { label: tr('Barcha sport turlari'), to: '/sport-turlari' },
  { label: tr('Futbol'), to: '/sport/futbol' },
  { label: tr('Fitnes va trenajyor zal'), to: '/sport/fitnes' },
  { label: tr('Suzish'), to: '/sport/suzish' },
  { label: tr('Tennis'), to: '/sport/tennis' },
  { label: tr('Boks va MMA'), to: '/sport/boks' },
  { label: tr('Boshqa sport turlari'), to: '/sport/boshqa', accent: true },
]

const SUPPORT_LINKS = [
  { label: tr('Yordam markazi'), to: '/sahifa/yordam-markazi' },
  { label: tr('Savol-javob'), to: '/sahifa/savol-javob' },
  { label: tr('Bizga yozing'), to: '/sahifa/bizga-yozing' },
  { label: tr('Foydalanish shartlari'), to: '/sahifa/foydalanish-shartlari' },
  { label: tr('Maxfiylik siyosati'), to: '/sahifa/maxfiylik-siyosati' },
  { label: tr('Xavfsizlik'), to: '/sahifa/xavfsizlik' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribe, setSubscribe] = useState({ status: 'idle', message: '' })

  async function handleSubscribe(event) {
    event.preventDefault()
    setSubscribe({ status: 'loading', message: '' })
    try {
      await api('/subscribe', { method: 'POST', body: { email: email.trim() } })
      setEmail('')
      setSubscribe({ status: 'success', message: 'Rahmat! Siz obuna bo‘ldingiz.' })
    } catch (err) {
      setSubscribe({ status: 'error', message: err.message })
    }
  }
  const [langId, setLangId] = useLocalStorageState('sporton-lang', 'uz')
  const [langOpen, setLangOpen] = useState(false)
  const langRef = useRef(null)
  const language = LANGUAGES.find((item) => item.id === langId) ?? LANGUAGES[0]

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!langOpen) return undefined

    function onPointerDown(event) {
      if (langRef.current?.contains(event.target)) return
      setLangOpen(false)
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') setLangOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [langOpen])

  return (
    <footer className="site-footer">
      <div className="site-footer__decor" aria-hidden="true">
        <img
          className="site-footer__watermark site-footer__watermark--left"
          src="/images/logo-icon.svg"
          alt=""
        />
        <img
          className="site-footer__watermark site-footer__watermark--right"
          src="/images/logo-icon.svg"
          alt=""
        />
      </div>
      <div className="container">
        <div className="footer-cta">
          <div className="footer-cta__inner">
            <div className="footer-cta__copy">
              <h3 className="footer-cta__title">
                Chegirmalar va yangi majmualardan birinchi bo&apos;lib xabardor bo&apos;ling!
              </h3>
              <p className="footer-cta__subtitle">
                {tr('Sport yangiliklari, tadbirlar va maxsus takliflar endilikda email orqali.')}
              </p>
            </div>

            <div className="footer-cta__form-wrap">
              <form
                className="footer-cta__form"
                onSubmit={handleSubscribe}
              >
                <FiMail className="footer-cta__mail" aria-hidden="true" />
                <input
                  type="email"
                  required
                  placeholder={tr('Email manzilingizni kiriting...')}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-label={tr('Email manzilingizni kiriting')}
                />
                <button type="submit" className="footer-cta__submit" disabled={subscribe.status === 'loading'}>
                  Obuna bo&apos;lish
                  <FiArrowRight aria-hidden="true" />
                </button>
              </form>
              {subscribe.message && (
                <p
                  className={`footer-cta__status footer-cta__status--${subscribe.status}`}
                  role={subscribe.status === 'error' ? 'alert' : 'status'}
                >
                  {subscribe.message}
                </p>
              )}
              <p className="footer-cta__note">
                <ShieldCheck aria-hidden="true" strokeWidth={2.25} />
                Biz sizning ma&apos;lumotlaringizni hech qachon uchinchi shaxslarga bermaymiz.
              </p>
            </div>

            <div className="footer-cta__visual" aria-hidden="true">
              <svg className="footer-cta__sparks" viewBox="0 0 48 48" fill="none">
                <path d="M30 6 L18 34" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
                <path d="M38 10 L26 38" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
                <path d="M22 4 L10 32" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
              </svg>
              <div className="footer-cta__photo footer-cta__photo--sport">
                <span className="footer-cta__photo-frame">
                  <img src="/images/sport/footer-cta.jpg" alt="" width={240} height={280} />
                </span>
                <span className="footer-cta__photo-badge">ON</span>
              </div>
              <div className="footer-cta__scribble">
                <p className="footer-cta__handwrite">
                  Sog&apos;lom hayot
                  <br />
                  {tr('shu yerdan boshlanadi!')}
                </p>
                <svg className="footer-cta__arrow" viewBox="0 0 80 90" fill="none">
                  <path
                    d="M48 6 C66 22, 70 42, 52 62 C42 74, 28 80, 12 82"
                    stroke="#fff"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M28 70 L10 84 L30 82"
                    stroke="#fff"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-brand__logo" aria-label={tr('SportON — bosh sahifa')}>
              <BrandLogo size="lg" />
            </Link>
            <p className="footer-brand__tagline">{tr('Sport — bir platformada')}</p>
            <p className="footer-brand__text">
              SportON – O&apos;zbekistondagi sport majmualarini topish va bron qilish, mashg&apos;ulotlar,
              sport yangiliklari va tadbirlarni bir joyga jamlagan zamonaviy platforma. Biz sog&apos;lom
              va faol hayotga ishonamiz.
            </p>
            <div className="footer-brand__socials">
              {SOCIALS.map(({ id, label, Icon, href }) => (
                <a
                  key={id}
                  href={href}
                  className="footer-brand__social"
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <FooterNav title={tr('Platforma')} links={PLATFORM_LINKS} />
          <FooterNav title={tr('Sport turlari')} links={CATEGORY_LINKS} />
          <FooterNav title={tr('Qo\'llab-quvvatlash')} links={SUPPORT_LINKS} />


          <p className="footer-main__quote" aria-hidden="true">
            Katta g&apos;alabalar kichik qadamlardan boshlanadi
          </p>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom__copy">
            <p>&copy; {new Date().getFullYear()} {tr('SportON.')}</p>
            <span>{tr('Barcha huquqlar himoyalangan.')}</span>
          </div>

          <p className="footer-bottom__motto">
            <FiActivity aria-hidden="true" />
            Harakat — sog&apos;lom hayot kaliti!
          </p>

          <div className="footer-bottom__tools">
            <div className="footer-lang" ref={langRef}>
              <button
                type="button"
                className="footer-lang__btn"
                aria-label={tr('Tilni tanlash')}
                aria-expanded={langOpen}
                onClick={() => setLangOpen((open) => !open)}
              >
                <FiGlobe />
                <span>{language.short}</span>
                <FiChevronDown className={langOpen ? 'is-open' : undefined} />
              </button>
              {langOpen ? (
                <div className="footer-lang__menu" role="listbox">
                  {LANGUAGES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={item.id === language.id}
                      className={item.id === language.id ? 'is-active' : undefined}
                      onClick={() => {
                        setLangId(item.id)
                        setLangOpen(false)
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className="footer-top"
              aria-label={tr('Yuqoriga qaytish')}
              onClick={scrollToTop}
            >
              <FiChevronUp />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterNav({ title, links }) {
  return (
    <nav className="footer-nav" aria-label={title}>
      <h4 className="footer-nav__title">{title}</h4>
      <ul className="footer-nav__list">
        {links.map(({ label, href, to, accent }) => {
          const className = accent
            ? 'footer-nav__link footer-nav__link--accent'
            : 'footer-nav__link'

          return (
            <li key={label}>
              {to ? (
                <Link to={to} className={className}>
                  {label}
                </Link>
              ) : (
                <a href={href} className={className}>
                  {label}
                </a>
              )}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
