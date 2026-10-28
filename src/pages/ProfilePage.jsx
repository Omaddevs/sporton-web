import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/auth.js'
import {
  FiAlertCircle,
  FiBell,
  FiCamera,
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiExternalLink,
  FiHeart,
  FiHelpCircle,
  FiImage,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiSend,
  FiSettings,
  FiShield,
  FiTrash2,
  FiUser,
} from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa6'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import Button from '../components/ui/Button.jsx'
import LogoIcon from '../components/icons/LogoIcon.jsx'
import { categories } from '../data/categories.js'
import { REGIONS } from '../data/regions.js'
import { PROFILE_SECTIONS, profileNavItems } from '../data/profile.js'
import { useNotifications } from '../hooks/useNotifications.js'
import { useProfile } from '../hooks/useProfile.js'
import * as authApi from '../services/authApi.js'
import { uploadMedia } from '../services/uploads.js'
import { formatPhone } from '../utils/phone.js'
import ProfileEditor from './profile/ProfileEditors.jsx'
import { ConfirmModal } from './profile/ProfileModal.jsx'
import {
  BookingsList,
  BookingsSection,
  HelpSection,
  NotificationsSection,
  SecuritySection,
  SettingsSection,
} from './profile/ProfileSections.jsx'
import { sortBookings } from './profile/profileUtils.js'
import './ProfilePage.css'
import './profile/ProfileSections.css'
import { tr } from '../i18n/index.js'

const navIcons = {
  user: FiUser,
  send: FiSend,
  heart: FiHeart,
  bell: FiBell,
  settings: FiSettings,
  shield: FiShield,
  help: FiHelpCircle,
  logout: FiLogOut,
}

const AVATAR_SIZE = 400
const AVATAR_MAX_BYTES = 8 * 1024 * 1024
const SPORT_TITLES = Object.fromEntries(categories.map((c) => [c.id, c.title]))
// Profilda hudud id’si saqlanadi; eski yozuvlarda — matn
const cityLabel = (city) => REGIONS.find((r) => r.id === city)?.label ?? city
// Admin panel va majmua kabineti (lokalda alohida port: VITE_PANEL_URL=http://localhost:3002)
const PANEL_URL = (import.meta.env.VITE_PANEL_URL || '').replace(/\/$/, '')
// Botga o‘z kontaktini yuborgan foydalanuvchining raqami tasdiqlanadi (va Telegram ulanadi)
const VERIFY_URL = `https://t.me/${authApi.TELEGRAM_BOT}?start=link`

/** Rasmni kvadrat qilib kesib, 400px JPEG’ga kichraytiradi — serverga yuklash uchun */
function squareAvatar(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const side = Math.min(img.width, img.height)
      const canvas = document.createElement('canvas')
      canvas.width = AVATAR_SIZE
      canvas.height = AVATAR_SIZE
      canvas
        .getContext('2d')
        .drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE)
      URL.revokeObjectURL(url)
      canvas.toBlob((blob) => (blob ? resolve(new File([blob], 'avatar.jpg', { type: 'image/jpeg' })) : reject(new Error(tr('Rasmni tayyorlab bo‘lmadi')))), 'image/jpeg', 0.88)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(tr('Rasmni o‘qib bo‘lmadi')))
    }
    img.src = url
  })
}

const initials = (name) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?'

const memberSince = (iso) =>
  iso ? new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''

/** Profil to‘ldirilishi — faqat haqiqiy maydonlar */
function getCompleteness(profile) {
  const items = [
    { label: tr('Raqam Telegram orqali tasdiqlangan'), done: profile.phoneVerified, action: 'verify' },
    { label: tr('Profil rasmi'), done: Boolean(profile.avatar), action: 'avatar' },
    { label: tr('Shahar'), done: Boolean(profile.city), action: 'edit' },
    { label: tr('Qiziqadigan sport turlari'), done: profile.sports.length > 0, action: 'edit' },
    { label: tr('O‘zim haqimda'), done: Boolean(profile.bio), action: 'edit' },
    { label: tr('Email'), done: Boolean(profile.email), action: 'edit' },
  ]
  const percent = Math.round((items.filter((item) => item.done).length / items.length) * 100)
  return { items, percent }
}

function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className="pf-toast" role="status" key={toast.id}>
      <FiCheckCircle aria-hidden />
      {toast.message}
    </div>
  )
}

function ProfileSidebar({ section, profile }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()

  return (
    <aside className="profile-side">
      <nav className="profile-nav" aria-label={tr('Profil menyusi')}>
        {profileNavItems.map((item) => {
          const Icon = navIcons[item.icon] || FiUser
          const badge = item.badge === 'notifications' ? unreadCount : 0
          const className = ['profile-nav__item', item.id === section ? 'is-active' : '', item.danger ? 'is-danger' : '']
            .filter(Boolean)
            .join(' ')
          const content = (
            <>
              <Icon aria-hidden />
              <span>{item.label}</span>
              {badge > 0 && <em className="profile-nav__badge">{badge > 9 ? '9+' : badge}</em>}
            </>
          )
          if (item.id === 'logout') {
            return (
              <button
                key={item.id}
                type="button"
                className={className}
                onClick={() => {
                  logout()
                  navigate('/kirish')
                }}
              >
                {content}
              </button>
            )
          }
          const to = item.to ?? (item.id === 'profil' ? '/profil' : `/profil?bolim=${item.id}`)
          return (
            <Link key={item.id} to={to} className={className} aria-current={item.id === section ? 'page' : undefined}>
              {content}
            </Link>
          )
        })}
      </nav>

      {profile.ownsComplexes ? (
        <div className="profile-premium-card is-active">
          <div className="profile-premium-card__icon" aria-hidden>
            <HiOutlineBuildingOffice2 />
          </div>
          <h3>{tr('Majmua kabineti')}</h3>
          <p>{tr('Bronlarni tasdiqlang, xizmatlar va majmua ma’lumotlarini boshqaring.')}</p>
          <a className="btn btn--outline profile-premium-card__btn" href={`${PANEL_URL}/kabinet`}>
            {tr('Kabinetga o‘tish')} <FiExternalLink aria-hidden />
          </a>
        </div>
      ) : (
        <div className="profile-premium-card">
          <div className="profile-premium-card__icon" aria-hidden>
            <HiOutlineBuildingOffice2 />
          </div>
          <h3>{tr('Majmuangiz bormi?')}</h3>
          <p>{tr('Sport majmuangizni SportON’ga qo‘shing — bronlarni onlayn qabul qiling.')}</p>
          <Link className="btn btn--primary profile-premium-card__btn" to="/majmua-qoshish">
            {tr('Majmua qo‘shish')}
          </Link>
        </div>
      )}
    </aside>
  )
}

function AvatarControl({ profile, busy, onPick, onRemove }) {
  const [menu, setMenu] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!menu) return undefined
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setMenu(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [menu])

  return (
    <div className="profile-hero__avatar-wrap" ref={ref}>
      {profile.avatar ? (
        <img src={profile.avatar} alt={profile.name} className="profile-hero__avatar" />
      ) : (
        <button type="button" className="profile-hero__avatar profile-hero__avatar--empty" onClick={onPick} aria-label={tr('Profil rasmini yuklash')}>
          {initials(profile.name)}
        </button>
      )}
      <button
        type="button"
        className="profile-hero__camera"
        aria-label={tr('Rasmni o‘zgartirish')}
        aria-expanded={profile.avatar ? menu : undefined}
        disabled={busy}
        onClick={() => (profile.avatar ? setMenu((v) => !v) : onPick())}
      >
        {busy ? <FiRefreshCw className="pf-spin" /> : <FiCamera />}
      </button>
      {menu && (
        <div className="pf-popover" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenu(false)
              onPick()
            }}
          >
            <FiImage aria-hidden /> {tr('Yangi rasm yuklash')}
          </button>
          <button
            type="button"
            role="menuitem"
            className="is-danger"
            onClick={() => {
              setMenu(false)
              onRemove()
            }}
          >
            <FiTrash2 aria-hidden /> {tr('Rasmni o‘chirish')}
          </button>
        </div>
      )}
    </div>
  )
}

function ProfileHero({ profile, avatarBusy, onEdit, onPickAvatar, onRemoveAvatar }) {
  const stats = [
    { label: tr('Bronlar'), value: profile.stats.bookings, to: '/profil?bolim=bronlar' },
    { label: tr('Yakunlangan mashg‘ulotlar'), value: profile.stats.completed, to: '/profil?bolim=bronlar' },
    { label: tr('Saqlanganlar'), value: profile.stats.favorites, to: '/saqlanganlar' },
    { label: tr('Sharhlarim'), value: profile.stats.reviews },
  ]

  return (
    <section className="profile-hero">
      <div className="profile-hero__bg" aria-hidden>
        <LogoIcon className="profile-hero__watermark profile-hero__watermark--main" size={280} />
        <LogoIcon className="profile-hero__watermark profile-hero__watermark--soft" size={180} />
      </div>
      <Button variant="outline" className="profile-hero__edit" icon={<FiEdit2 />} onClick={onEdit}>
        {tr('Profilni tahrirlash')}
      </Button>

      <div className="profile-hero__top">
        <AvatarControl profile={profile} busy={avatarBusy} onPick={onPickAvatar} onRemove={onRemoveAvatar} />

        <div className="profile-hero__info">
          <div className="profile-hero__name-row">
            <h1>{profile.name}</h1>
            {profile.phoneVerified && (
              <span className="profile-hero__verified" title={tr('Raqam Telegram orqali tasdiqlangan')}>
                <FiCheckCircle />
              </span>
            )}
          </div>
          <ul className="profile-hero__meta">
            {profile.city && (
              <li>
                <FiMapPin aria-hidden />
                {cityLabel(profile.city)}
              </li>
            )}
            {profile.phone && (
              <li>
                <FiPhone aria-hidden />
                {formatPhone(profile.phone)}
              </li>
            )}
            {profile.email && (
              <li>
                <FiMail aria-hidden />
                {profile.email}
              </li>
            )}
          </ul>
          {profile.bio ? (
            <p className="profile-hero__bio">{profile.bio}</p>
          ) : (
            <button type="button" className="pf-link" onClick={onEdit}>
              <FiPlus aria-hidden /> {tr('O‘zingiz haqingizda qisqacha yozing')}
            </button>
          )}
        </div>
      </div>

      <div className="profile-hero__stats">
        {stats.map((stat) =>
          stat.to ? (
            <Link key={stat.label} to={stat.to} className="profile-hero__stat is-link">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </Link>
          ) : (
            <div key={stat.label} className="profile-hero__stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ),
        )}
      </div>
    </section>
  )
}

function SectionHead({ title, action = tr('Tahrirlash'), onAction }) {
  return (
    <div className="profile-section__head">
      <h2>{title}</h2>
      {onAction && (
        <button type="button" className="profile-section__edit" onClick={onAction}>
          <FiEdit2 aria-hidden />
          {action}
        </button>
      )}
    </div>
  )
}

/** Raqam tasdiqlanmagan (eski hisob) — Telegram bot orqali tasdiqlash */
function VerifyPhoneCard({ onChecked }) {
  const { refresh } = useAuth()
  const [checking, setChecking] = useState(false)

  async function check() {
    setChecking(true)
    try {
      const me = await authApi.fetchMe()
      if (me) refresh(me)
      onChecked(me?.phoneVerified ? tr('Raqamingiz tasdiqlandi ✅') : tr('Hali tasdiqlanmagan — botga raqamingizni yuboring'))
    } finally {
      setChecking(false)
    }
  }

  return (
    <article className="profile-card pf-verify">
      <div className="pf-verify__icon" aria-hidden>
        <FiAlertCircle />
      </div>
      <div className="pf-verify__body">
        <h2>{tr('Raqamingizni tasdiqlang')}</h2>
        <p>
          {tr('Sharh va izoh yozish uchun raqamingiz Telegram orqali tasdiqlangan bo‘lishi kerak. Botni oching va «Raqamni yuborish» tugmasini bosing — bron xabarlari ham shu botga keladi.')}
        </p>
        <div className="pf-verify__actions">
          <a className="btn btn--primary" href={VERIFY_URL} target="_blank" rel="noreferrer">
            <FaTelegram aria-hidden /> {tr('Telegram’da tasdiqlash')}
          </a>
          <button type="button" className="pf-link" onClick={check} disabled={checking}>
            <FiRefreshCw aria-hidden /> {checking ? tr('Tekshirilmoqda…') : tr('Tasdiqladim — tekshirish')}
          </button>
        </div>
      </div>
    </article>
  )
}

function ProfileMain({ profile, onEdit, notify }) {
  const bookings = sortBookings(profile.bookings)
  const personal = [
    { label: tr('To‘liq ism'), value: profile.name },
    {
      label: tr('Telefon'),
      value: profile.phone && (
        <>
          {formatPhone(profile.phone)}{' '}
          <em className={`pf-badge${profile.phoneVerified ? '' : ' is-warning'}`}>{profile.phoneVerified ? 'tasdiqlangan' : 'tasdiqlanmagan'}</em>
        </>
      ),
    },
    { label: tr('Email'), value: profile.email },
    { label: tr('Shahar / hudud'), value: profile.city && cityLabel(profile.city) },
    { label: tr('SportON’da'), value: profile.createdAt && `${memberSince(profile.createdAt)} dan beri` },
  ]

  return (
    <section className="profile-main">
      <div className="profile-panels">
        {!profile.phoneVerified && <VerifyPhoneCard onChecked={notify} />}

        <article className="profile-card">
          <SectionHead title={tr('Shaxsiy ma’lumot')} onAction={onEdit} />
          <div className="profile-fields">
            {personal.map((field) => (
              <div key={field.label} className="profile-field">
                <span>{field.label}</span>
                {field.value ? (
                  <strong>{field.value}</strong>
                ) : (
                  <button type="button" className="pf-link" onClick={onEdit}>
                    <FiPlus aria-hidden /> {tr('Kiritish')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </article>

        <article className="profile-card">
          <SectionHead title={tr('Qiziqadigan sport turlari')} onAction={onEdit} />
          {profile.sports.length ? (
            <div className="profile-tags">
              {profile.sports.map((id) => (
                <Link key={id} to={`/sport/${id}`} className="profile-tag">
                  {SPORT_TITLES[id] ?? id}
                </Link>
              ))}
            </div>
          ) : (
            <button type="button" className="pf-empty-line" onClick={onEdit}>
              <FiPlus aria-hidden /> {tr('Sport turlarini tanlang — sizga mos majmualarni tezroq topasiz')}
            </button>
          )}
        </article>

        <article className="profile-card">
          <div className="profile-section__head">
            <h2>{tr('So‘nggi bronlar')}</h2>
            <Link to="/profil?bolim=bronlar" className="profile-section__edit">
              {tr('Barchasi')}
            </Link>
          </div>
          <BookingsList bookings={bookings} limit={3} empty={tr('Hali bron qilmagansiz')} />
        </article>
      </div>
    </section>
  )
}

function CompletenessRing({ percent }) {
  const size = 118
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="profile-ring" aria-label={tr('Profil to‘ldirilishi {n}%', { n: percent })}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle className="profile-ring__track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" />
        <circle
          className="profile-ring__progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="profile-ring__label">
        <strong>{percent}%</strong>
        <span>{tr('to‘ldirilgan')}</span>
      </div>
    </div>
  )
}

function ProfileWidgets({ completeness, runAction }) {
  const nextMissing = completeness.items.find((item) => !item.done)
  return (
    <aside className="profile-widgets">
      <article className="profile-card profile-complete">
        <h2>{tr('Profil to‘ldirilishi')}</h2>
        <CompletenessRing percent={completeness.percent} />
        <ul className="profile-complete__list">
          {completeness.items.map((item) => (
            <li key={item.label} className={item.done ? 'is-done' : ''}>
              <span className="profile-complete__check" aria-hidden>
                {item.done ? <FiCheck /> : null}
              </span>
              {item.done ? (
                item.label
              ) : (
                <button type="button" className="profile-complete__todo" onClick={() => runAction(item.action)}>
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
        <Button
          variant="primary"
          className="profile-complete__btn"
          disabled={!nextMissing}
          onClick={() => nextMissing && runAction(nextMissing.action)}
        >
          {nextMissing ? tr('Profilni to‘ldirish') : tr('Profil to‘liq to‘ldirilgan')}
        </Button>
      </article>
    </aside>
  )
}

export default function ProfilePage() {
  const { profile, update } = useProfile()
  const [params] = useSearchParams()
  const section = PROFILE_SECTIONS[params.get('bolim')] ? params.get('bolim') : 'profil'
  const [editing, setEditing] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [toast, setToast] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [section])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const notify = (message) => setToast({ id: Date.now(), message })

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="container profile-page__inner">
          <p className="pf-empty">
            {tr('Profilni ko‘rish uchun')} <Link to="/kirish" state={{ from: '/profil' }}>{tr('hisobingizga kiring')}</Link>.
          </p>
        </div>
      </div>
    )
  }

  const completeness = getCompleteness(profile)

  function runAction(action) {
    if (action === 'avatar') fileRef.current?.click()
    else if (action === 'verify') window.open(VERIFY_URL, '_blank', 'noopener')
    else setEditing(true)
  }

  async function onAvatarFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return notify(tr('Faqat rasm faylini yuklang'))
    if (file.size > AVATAR_MAX_BYTES) return notify(tr('Rasm hajmi 8 MB dan oshmasin'))
    setAvatarBusy(true)
    try {
      const { url } = await uploadMedia(await squareAvatar(file)).promise
      await update({ avatar: url })
      notify(tr('Profil rasmi yangilandi'))
    } catch (err) {
      notify(err.message)
    } finally {
      setAvatarBusy(false)
    }
  }

  const sectionProps = { profile, update, notify }

  return (
    <div className="profile-page">
      <div className="container profile-page__inner">
        <div className="profile-page__crumb">
          <Link to="/">{tr('Bosh sahifa')}</Link>
          <span>/</span>
          {section === 'profil' ? (
            <span>{tr('Mening profilim')}</span>
          ) : (
            <>
              <Link to="/profil">{tr('Mening profilim')}</Link>
              <span>/</span>
              <span>{PROFILE_SECTIONS[section]}</span>
            </>
          )}
        </div>

        <div className="profile-page__grid">
          <ProfileSidebar section={section} profile={profile} />
          <div className="profile-page__center">
            {section === 'profil' && (
              <>
                <ProfileHero
                  profile={profile}
                  avatarBusy={avatarBusy}
                  onEdit={() => setEditing(true)}
                  onPickAvatar={() => fileRef.current?.click()}
                  onRemoveAvatar={() => setConfirmRemove(true)}
                />
                <ProfileMain profile={profile} onEdit={() => setEditing(true)} notify={notify} />
              </>
            )}
            {section === 'bronlar' && <BookingsSection {...sectionProps} />}
            {section === 'bildirishnomalar' && <NotificationsSection />}
            {section === 'sozlamalar' && <SettingsSection {...sectionProps} />}
            {section === 'xavfsizlik' && <SecuritySection {...sectionProps} />}
            {section === 'yordam' && <HelpSection {...sectionProps} />}
          </div>
          <ProfileWidgets completeness={completeness} runAction={runAction} />
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarFile} />

      {editing && <ProfileEditor open profile={profile} update={update} notify={notify} onClose={() => setEditing(false)} />}
      <ConfirmModal
        open={confirmRemove}
        title={tr('Profil rasmini o‘chirasizmi?')}
        text={tr('Rasm o‘rniga ismingiz bosh harflari ko‘rsatiladi.')}
        confirmLabel={tr('O‘chirish')}
        onClose={() => setConfirmRemove(false)}
        onConfirm={async () => {
          setConfirmRemove(false)
          try {
            await update({ avatar: '' })
            notify(tr('Profil rasmi o‘chirildi'))
          } catch (err) {
            notify(err.message)
          }
        }}
      />
      <Toast toast={toast} />
    </div>
  )
}
