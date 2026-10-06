import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/auth.js'
import {
  FiBell,
  FiCamera,
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiEdit2,
  FiHeart,
  FiHelpCircle,
  FiImage,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiPlus,
  FiSend,
  FiSettings,
  FiShare2,
  FiShield,
  FiTrash2,
  FiUser,
  FiX,
} from 'react-icons/fi'
import { FaFacebookF, FaLinkedinIn, FaTelegram, FaXTwitter } from 'react-icons/fa6'
import { HiOutlineSparkles } from 'react-icons/hi2'
import Button from '../components/ui/Button.jsx'
import LogoIcon from '../components/icons/LogoIcon.jsx'
import { useNotifications } from '../hooks/useNotifications.js'
import { useProfile } from '../hooks/useProfile.js'
import { formatPhone, isValidPhone } from '../utils/phone.js'
import {
  LANGUAGE_FLAGS,
  premiumBenefits,
  premiumPlans,
  PROFILE_SECTIONS,
  profileNavItems,
  profileTabs,
} from '../data/profile.js'
import ProfileEditor from './profile/ProfileEditors.jsx'
import { ConfirmModal, ProfileModal } from './profile/ProfileModal.jsx'
import {
  BookingsList,
  BookingsSection,
  HelpSection,
  NotificationsSection,
  SecuritySection,
  SettingsSection,
} from './profile/ProfileSections.jsx'
import { formatDate, sortBookings } from './profile/profileUtils.js'
import { useBookingCancel } from './profile/useBookingCancel.jsx'
import './ProfilePage.css'
import './profile/ProfileSections.css'

const navIcons = {
  user: FiUser,
  send: FiSend,
  heart: FiHeart,
  bell: FiBell,
  message: FiMessageSquare,
  settings: FiSettings,
  shield: FiShield,
  help: FiHelpCircle,
  logout: FiLogOut,
}

const AVATAR_SIZE = 320
const AVATAR_MAX_BYTES = 5 * 1024 * 1024

/** Rasmni kvadrat qilib kesib, 320px JPEG’ga kichraytiradi — localStorage’ga sig‘ishi uchun */
function readAvatar(file) {
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
      resolve(canvas.toDataURL('image/jpeg', 0.86))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Rasmni o‘qib bo‘lmadi'))
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

function getCompleteness(profile) {
  const items = [
    {
      label: 'Shaxsiy ma’lumot',
      done: Boolean(profile.name && isValidPhone(profile.phone) && profile.email && profile.birthDate && profile.address),
      action: { type: 'personal' },
    },
    { label: 'Profil rasmi', done: Boolean(profile.avatar), action: 'avatar' },
    { label: 'Sport tajribasi', done: profile.experience.length > 0, action: { type: 'experience' } },
    { label: 'Yutuqlar', done: profile.education.length > 0, action: { type: 'education' } },
    { label: 'Sport turlari', done: profile.skills.length > 0, action: { type: 'skills' } },
    { label: 'Favqulodda aloqa raqami', done: isValidPhone(profile.emergencyPhone), action: { type: 'personal' } },
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

function ProfileSidebar({ section, profile, onPremium }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { unreadCount } = useNotifications()

  return (
    <aside className="profile-side">
      <nav className="profile-nav" aria-label="Profil menyusi">
        {profileNavItems.map((item) => {
          const Icon = navIcons[item.icon] || FiUser
          const badge = item.badge === 'notifications' ? unreadCount : item.badgeValue
          const className = [
            'profile-nav__item',
            item.id === section ? 'is-active' : '',
            item.danger ? 'is-danger' : '',
          ]
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
            <Link
              key={item.id}
              to={to}
              className={className}
              aria-current={item.id === section ? 'page' : undefined}
            >
              {content}
            </Link>
          )
        })}
      </nav>

      <div className={`profile-premium-card${profile.premium ? ' is-active' : ''}`}>
        <div className="profile-premium-card__icon" aria-hidden>
          <HiOutlineSparkles />
        </div>
        {profile.premium ? (
          <>
            <h3>Premium faol</h3>
            <p>
              {premiumPlans.find((plan) => plan.id === profile.premium.plan)?.label} obuna ·{' '}
              {formatDate(profile.premium.since)} dan beri. Barcha bronlarda 10% chegirma qo‘llanadi.
            </p>
            <Button variant="outline" className="profile-premium-card__btn" onClick={onPremium}>
              Obunani boshqarish
            </Button>
          </>
        ) : (
          <>
            <h3>Premium bo‘ling</h3>
            <p>Bronlarda chegirma, ustuvor joy va shaxsiy murabbiy maslahatlari.</p>
            <Button variant="primary" className="profile-premium-card__btn" onClick={onPremium}>
              Premiumga o‘tish
            </Button>
          </>
        )}
      </div>
    </aside>
  )
}

function AvatarControl({ profile, onPick, onRemove }) {
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
        <button type="button" className="profile-hero__avatar profile-hero__avatar--empty" onClick={onPick} aria-label="Profil rasmini yuklash">
          {initials(profile.name)}
        </button>
      )}
      <button
        type="button"
        className="profile-hero__camera"
        aria-label="Rasmni o‘zgartirish"
        aria-expanded={profile.avatar ? menu : undefined}
        onClick={() => (profile.avatar ? setMenu((v) => !v) : onPick())}
      >
        <FiCamera />
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
            <FiImage aria-hidden /> Yangi rasm yuklash
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
            <FiTrash2 aria-hidden /> Rasmni o‘chirish
          </button>
        </div>
      )}
    </div>
  )
}

function ProfileHero({ profile, openEditor, onPickAvatar, onRemoveAvatar }) {
  const stats = [
    { label: 'Bronlar', value: profile.bookings.length, to: '/profil?bolim=bronlar' },
    { label: 'Saqlangan joylar', value: profile.savedCount, to: '/saqlanganlar' },
    { label: 'Mashg‘ulot soatlari', value: profile.trainingHours },
    { label: 'Bonus ballar', value: profile.bonusPoints },
  ]

  return (
    <section className="profile-hero">
      <div className="profile-hero__bg" aria-hidden>
        <LogoIcon className="profile-hero__watermark profile-hero__watermark--main" size={280} />
        <LogoIcon className="profile-hero__watermark profile-hero__watermark--soft" size={180} />
      </div>
      <Button variant="outline" className="profile-hero__edit" icon={<FiEdit2 />} onClick={() => openEditor({ type: 'hero' })}>
        Profilni tahrirlash
      </Button>

      <div className="profile-hero__top">
        <AvatarControl profile={profile} onPick={onPickAvatar} onRemove={onRemoveAvatar} />

        <div className="profile-hero__info">
          <div className="profile-hero__name-row">
            <h1>{profile.name}</h1>
            {profile.verified && (
              <span className="profile-hero__verified" title="Tasdiqlangan">
                <FiCheckCircle />
              </span>
            )}
            {profile.status && <span className="profile-hero__status">{profile.status}</span>}
            {profile.premium && (
              <span className="profile-hero__status profile-hero__status--premium">
                <HiOutlineSparkles aria-hidden /> Premium
              </span>
            )}
          </div>
          {profile.title && <p className="profile-hero__title">{profile.title}</p>}
          <ul className="profile-hero__meta">
            {profile.location && (
              <li>
                <FiMapPin aria-hidden />
                {profile.location}
              </li>
            )}
            {profile.email && (
              <li>
                <FiMail aria-hidden />
                {profile.email}
              </li>
            )}
            {profile.phone && (
              <li>
                <FiPhone aria-hidden />
                {formatPhone(profile.phone)}
              </li>
            )}
          </ul>
          {profile.bio ? (
            <p className="profile-hero__bio">{profile.bio}</p>
          ) : (
            <button type="button" className="pf-link" onClick={() => openEditor({ type: 'hero' })}>
              <FiPlus aria-hidden /> O‘zingiz haqingizda qisqacha yozing
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

function SectionHead({ title, action = 'Tahrirlash', onAction, icon = <FiEdit2 aria-hidden /> }) {
  return (
    <div className="profile-section__head">
      <h2>{title}</h2>
      {onAction && (
        <button type="button" className="profile-section__edit" onClick={onAction}>
          {icon}
          {action}
        </button>
      )}
    </div>
  )
}

function EmptyLine({ children, onClick }) {
  return (
    <button type="button" className="pf-empty-line" onClick={onClick}>
      <FiPlus aria-hidden /> {children}
    </button>
  )
}

function ItemTools({ label, onEdit, onDelete }) {
  return (
    <div className="pf-item-tools">
      <button type="button" className="pf-icon-btn" aria-label={`${label} — tahrirlash`} title="Tahrirlash" onClick={onEdit}>
        <FiEdit2 />
      </button>
      <button type="button" className="pf-icon-btn is-danger" aria-label={`${label} — o‘chirish`} title="O‘chirish" onClick={onDelete}>
        <FiTrash2 />
      </button>
    </div>
  )
}

function SkillTags({ profile, update, openEditor }) {
  return (
    <div className="profile-tags">
      {profile.skills.map((skill) => (
        <span key={skill} className="profile-tag">
          {skill}
          <button
            type="button"
            className="profile-tag__remove"
            aria-label={`${skill} — o‘chirish`}
            onClick={() => update({ skills: profile.skills.filter((item) => item !== skill) })}
          >
            <FiX />
          </button>
        </span>
      ))}
      <button type="button" className="profile-tag profile-tag--add" onClick={() => openEditor({ type: 'skills' })}>
        <FiPlus aria-hidden />
        Sport turi
      </button>
    </div>
  )
}

function ProfileMain({ profile, update, notify, openEditor, askConfirm, tab, setTab }) {
  const [askCancel, cancelModal] = useBookingCancel(profile, update, notify)
  const bookings = sortBookings(profile.bookings)

  const personal = [
    { label: 'To‘liq ism', value: profile.name },
    { label: 'Telefon', value: profile.phone && formatPhone(profile.phone) },
    { label: 'Email', value: profile.email },
    { label: 'Tug‘ilgan sana', value: formatDate(profile.birthDate) },
    { label: 'Manzil', value: profile.address },
    { label: 'Sport darajasi', value: profile.level },
    {
      label: 'Favqulodda aloqa raqami',
      value: profile.emergencyPhone && formatPhone(profile.emergencyPhone),
      wide: true,
    },
  ]

  const removeItem = (field, item, label) =>
    askConfirm({
      title: `${label}ni o‘chirasizmi?`,
      text: `«${item.role ?? item.degree}» profilingizdan o‘chiriladi.`,
      confirmLabel: 'O‘chirish',
      onConfirm: () => {
        update({ [field]: profile[field].filter((row) => row.id !== item.id) })
        notify(`${label} o‘chirildi`)
      },
    })

  return (
    <section className="profile-main">
      <div className="profile-tabs" role="tablist" aria-label="Profil bo‘limlari">
        {profileTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`profile-tabs__btn${tab === item.id ? ' is-active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'basic' && (
        <div className="profile-panels">
          <article className="profile-card">
            <SectionHead title="Shaxsiy ma’lumot" onAction={() => openEditor({ type: 'personal' })} />
            <div className="profile-fields">
              {personal.map((field) => (
                <div key={field.label} className={`profile-field${field.wide ? ' profile-field--wide' : ''}`}>
                  <span>{field.label}</span>
                  {field.value ? (
                    <strong>{field.value}</strong>
                  ) : (
                    <button type="button" className="pf-link" onClick={() => openEditor({ type: 'personal' })}>
                      <FiPlus aria-hidden /> Kiritish
                    </button>
                  )}
                </div>
              ))}
            </div>
          </article>

          <article className="profile-card">
            <SectionHead title="Men haqimda" onAction={() => openEditor({ type: 'about' })} />
            {profile.about ? (
              <p className="profile-about">{profile.about}</p>
            ) : (
              <EmptyLine onClick={() => openEditor({ type: 'about' })}>Sport tarixingiz va maqsadlaringiz haqida yozing</EmptyLine>
            )}
          </article>

          <article className="profile-card">
            <SectionHead title="Sport turlari" onAction={() => openEditor({ type: 'skills' })} />
            <SkillTags profile={profile} update={update} openEditor={openEditor} />
          </article>

          <article className="profile-card">
            <SectionHead title="Tillar" onAction={() => openEditor({ type: 'languages' })} />
            {profile.languages.length ? (
              <ul className="profile-langs">
                {profile.languages.map((lang) => (
                  <li key={lang.id}>
                    <span className="profile-langs__flag" aria-hidden>
                      {LANGUAGE_FLAGS[lang.name] ?? '🌐'}
                    </span>
                    <div>
                      <strong>{lang.name}</strong>
                      <span>{lang.level}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyLine onClick={() => openEditor({ type: 'languages' })}>Til qo‘shish</EmptyLine>
            )}
          </article>

          <article className="profile-card">
            <SectionHead title="Qiziqishlar" onAction={() => openEditor({ type: 'interests' })} />
            {profile.interests.length ? (
              <div className="profile-tags profile-tags--outline">
                {profile.interests.map((item) => (
                  <span key={item} className="profile-tag profile-tag--outline">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyLine onClick={() => openEditor({ type: 'interests' })}>Qiziqish qo‘shish</EmptyLine>
            )}
          </article>

          <article className="profile-card">
            <SectionHead title="So‘nggi bronlar" action="Barchasi" icon={null} onAction={() => setTab('activity')} />
            <BookingsList bookings={bookings} limit={3} empty="Hali bron qilmagansiz" />
          </article>
        </div>
      )}

      {tab === 'experience' && (
        <div className="profile-panels">
          <article className="profile-card">
            <SectionHead
              title="Sport tajribasi"
              action="Qo‘shish"
              icon={<FiPlus aria-hidden />}
              onAction={() => openEditor({ type: 'experience' })}
            />
            {profile.experience.length ? (
              <ul className="profile-timeline">
                {profile.experience.map((item) => (
                  <li key={item.id}>
                    <div className="profile-timeline__dot" aria-hidden />
                    <div>
                      <strong>{item.role}</strong>
                      <span className="profile-timeline__sub">
                        {[item.company, item.years].filter(Boolean).join(' · ')}
                      </span>
                      {item.points.length > 0 && (
                        <ul>
                          {item.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <ItemTools
                      label={item.role}
                      onEdit={() => openEditor({ type: 'experience', item })}
                      onDelete={() => removeItem('experience', item, 'Tajriba')}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyLine onClick={() => openEditor({ type: 'experience' })}>Birinchi sport tajribangizni qo‘shing</EmptyLine>
            )}
          </article>
        </div>
      )}

      {tab === 'education' && (
        <div className="profile-panels">
          <article className="profile-card">
            <SectionHead
              title="Yutuqlar va sertifikatlar"
              action="Qo‘shish"
              icon={<FiPlus aria-hidden />}
              onAction={() => openEditor({ type: 'education' })}
            />
            {profile.education.length ? (
              <ul className="profile-timeline">
                {profile.education.map((item) => (
                  <li key={item.id}>
                    <div className="profile-timeline__dot" aria-hidden />
                    <div>
                      <strong>{item.degree}</strong>
                      <span className="profile-timeline__sub">
                        {[item.school, item.years].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                    <ItemTools
                      label={item.degree}
                      onEdit={() => openEditor({ type: 'education', item })}
                      onDelete={() => removeItem('education', item, 'Yutuq')}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyLine onClick={() => openEditor({ type: 'education' })}>Medal, sertifikat yoki natija qo‘shing</EmptyLine>
            )}
          </article>
        </div>
      )}

      {tab === 'skills' && (
        <div className="profile-panels">
          <article className="profile-card">
            <SectionHead title="Sport turlari" onAction={() => openEditor({ type: 'skills' })} />
            <SkillTags profile={profile} update={update} openEditor={openEditor} />
          </article>
        </div>
      )}

      {tab === 'activity' && (
        <div className="profile-panels">
          <article className="profile-card">
            <div className="profile-section__head">
              <h2>Bronlar tarixi</h2>
              <Link to="/profil?bolim=bronlar" className="profile-section__edit">
                Barchasini boshqarish
              </Link>
            </div>
            <BookingsList bookings={bookings} onCancel={askCancel} empty="Hali bron qilmagansiz" />
          </article>
        </div>
      )}
      {cancelModal}
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
    <div className="profile-ring" aria-label={`Profil to‘ldirilishi ${percent}%`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="profile-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
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
        <span>to‘ldirilgan</span>
      </div>
    </div>
  )
}

function ProfileWidgets({ profile, completeness, runAction, onPremium, notify }) {
  const nextMissing = completeness.items.find((item) => !item.done)
  const shareUrl = `${window.location.origin}/profil`
  const shareText = `${profile.name} — SportOn profili`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      notify('Havola nusxalandi')
    } catch {
      notify('Havolani nusxalab bo‘lmadi')
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, url: shareUrl })
      } catch {
        /* foydalanuvchi bekor qildi */
      }
    } else {
      copyLink()
    }
  }

  const url = encodeURIComponent(shareUrl)
  const text = encodeURIComponent(shareText)
  const networks = [
    { label: 'LinkedIn', icon: FaLinkedinIn, href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
    { label: 'Telegram', icon: FaTelegram, href: `https://t.me/share/url?url=${url}&text=${text}` },
    { label: 'Facebook', icon: FaFacebookF, href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
    { label: 'X', icon: FaXTwitter, href: `https://twitter.com/intent/tweet?url=${url}&text=${text}` },
  ]

  return (
    <aside className="profile-widgets">
      <article className="profile-card profile-complete">
        <h2>Profil to‘ldirilishi</h2>
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
          {nextMissing ? 'Profilni to‘ldirish' : 'Profil to‘liq to‘ldirilgan'}
        </Button>
      </article>

      <article className="profile-card profile-upsell">
        <h2>{profile.premium ? 'Premium imkoniyatlaringiz' : 'Premium imkoniyatlar'}</h2>
        <ul>
          {premiumBenefits.map((benefit) => (
            <li key={benefit}>
              <FiCheckCircle aria-hidden />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
        <Button variant={profile.premium ? 'outline' : 'primary'} className="profile-upsell__btn" onClick={onPremium}>
          {profile.premium ? 'Obunani boshqarish' : 'Premiumga o‘tish'}
        </Button>
      </article>

      <article className="profile-card profile-share">
        <h2>Profilni ulashish</h2>
        <div className="profile-share__row">
          <button type="button" aria-label="Havolani nusxalash" title="Havolani nusxalash" onClick={copyLink}>
            <FiCopy />
          </button>
          {networks.map(({ label, icon: Icon, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
              <Icon />
            </a>
          ))}
          <button type="button" aria-label="Ulashish" title="Ulashish" onClick={nativeShare}>
            <FiShare2 />
          </button>
        </div>
      </article>
    </aside>
  )
}

function PremiumModal({ open, profile, update, notify, onClose }) {
  const [plan, setPlan] = useState('year')
  const [confirmCancel, setConfirmCancel] = useState(false)

  if (profile.premium) {
    return (
      <>
        <ProfileModal open={open && !confirmCancel} title="Premium obuna" onClose={onClose}>
          <div className="pf-premium-active">
            <HiOutlineSparkles aria-hidden />
            <strong>{premiumPlans.find((p) => p.id === profile.premium.plan)?.label} obuna faol</strong>
            <span>{formatDate(profile.premium.since)} dan beri</span>
          </div>
          <ul className="pf-premium-list">
            {premiumBenefits.map((benefit) => (
              <li key={benefit}>
                <FiCheckCircle aria-hidden /> {benefit}
              </li>
            ))}
          </ul>
          <div className="pf-modal__foot pf-modal__foot--inline">
            <Button type="button" variant="outline" className="pf-btn-danger-outline" onClick={() => setConfirmCancel(true)}>
              Obunani bekor qilish
            </Button>
            <Button type="button" variant="primary" onClick={onClose}>
              Yopish
            </Button>
          </div>
        </ProfileModal>
        <ConfirmModal
          open={open && confirmCancel}
          title="Obunani bekor qilasizmi?"
          text="Premium chegirmalar va ustuvor bron imkoniyati o‘chiriladi."
          confirmLabel="Ha, bekor qilish"
          onClose={() => setConfirmCancel(false)}
          onConfirm={() => {
            update({ premium: false })
            notify('Premium obuna bekor qilindi')
            setConfirmCancel(false)
            onClose()
          }}
        />
      </>
    )
  }

  return (
    <ProfileModal
      open={open}
      title="Premiumga o‘tish"
      submitLabel="Faollashtirish"
      onClose={onClose}
      onSubmit={() => {
        update({ premium: { plan, since: new Date().toISOString().slice(0, 10) } })
        notify('Premium faollashtirildi 🎉')
        onClose()
      }}
    >
      <div className="pf-plans" role="radiogroup" aria-label="Tarif">
        {premiumPlans.map((item) => (
          <label key={item.id} className={`pf-plan${plan === item.id ? ' is-active' : ''}`}>
            <input type="radio" name="plan" value={item.id} checked={plan === item.id} onChange={() => setPlan(item.id)} />
            <span>{item.label}</span>
            <strong>{item.price}</strong>
            <em>{item.note}</em>
          </label>
        ))}
      </div>
      <ul className="pf-premium-list">
        {premiumBenefits.map((benefit) => (
          <li key={benefit}>
            <FiCheckCircle aria-hidden /> {benefit}
          </li>
        ))}
      </ul>
    </ProfileModal>
  )
}

export default function ProfilePage() {
  const { profile, update, reset } = useProfile()
  const [params] = useSearchParams()
  const section = PROFILE_SECTIONS[params.get('bolim')] ? params.get('bolim') : 'profil'
  const [tab, setTab] = useState('basic')
  const [editor, setEditor] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [premiumOpen, setPremiumOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const fileRef = useRef(null)
  const completeness = getCompleteness(profile)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [section])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const notify = (message) => setToast({ id: Date.now(), message })

  function runAction(action) {
    if (action === 'avatar') return fileRef.current?.click()
    if (action.type === 'experience') setTab('experience')
    if (action.type === 'education') setTab('education')
    setEditor(action)
  }

  async function onAvatarFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return notify('Faqat rasm faylini yuklang')
    if (file.size > AVATAR_MAX_BYTES) return notify('Rasm hajmi 5 MB dan oshmasin')
    try {
      update({ avatar: await readAvatar(file) })
      notify('Profil rasmi yangilandi')
    } catch (err) {
      notify(err.message)
    }
  }

  const sectionProps = { profile, update, notify }

  return (
    <div className="profile-page">
      <div className="container profile-page__inner">
        <div className="profile-page__crumb">
          <Link to="/">Bosh sahifa</Link>
          <span>/</span>
          {section === 'profil' ? (
            <span>Mening profilim</span>
          ) : (
            <>
              <Link to="/profil">Mening profilim</Link>
              <span>/</span>
              <span>{PROFILE_SECTIONS[section]}</span>
            </>
          )}
        </div>

        <div className="profile-page__grid">
          <ProfileSidebar section={section} profile={profile} onPremium={() => setPremiumOpen(true)} />
          <div className="profile-page__center">
            {section === 'profil' && (
              <>
                <ProfileHero
                  profile={profile}
                  openEditor={setEditor}
                  onPickAvatar={() => fileRef.current?.click()}
                  onRemoveAvatar={() =>
                    setConfirm({
                      title: 'Profil rasmini o‘chirasizmi?',
                      text: 'Rasm o‘rniga ismingiz bosh harflari ko‘rsatiladi.',
                      confirmLabel: 'O‘chirish',
                      onConfirm: () => {
                        update({ avatar: '' })
                        notify('Profil rasmi o‘chirildi')
                      },
                    })
                  }
                />
                <ProfileMain
                  {...sectionProps}
                  openEditor={setEditor}
                  askConfirm={setConfirm}
                  tab={tab}
                  setTab={setTab}
                />
              </>
            )}
            {section === 'bronlar' && <BookingsSection {...sectionProps} />}
            {section === 'bildirishnomalar' && <NotificationsSection />}
            {section === 'sozlamalar' && <SettingsSection {...sectionProps} />}
            {section === 'xavfsizlik' && <SecuritySection {...sectionProps} resetProfile={reset} />}
            {section === 'yordam' && <HelpSection {...sectionProps} />}
          </div>
          <ProfileWidgets
            profile={profile}
            completeness={completeness}
            runAction={runAction}
            onPremium={() => setPremiumOpen(true)}
            notify={notify}
          />
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarFile} />

      <ProfileEditor
        key={editor ? `${editor.type}-${editor.item?.id ?? 'new'}` : 'none'}
        editor={editor}
        profile={profile}
        update={update}
        notify={notify}
        onClose={() => setEditor(null)}
      />
      <ConfirmModal
        open={Boolean(confirm)}
        title={confirm?.title}
        text={confirm?.text}
        confirmLabel={confirm?.confirmLabel}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          confirm.onConfirm()
          setConfirm(null)
        }}
      />
      <PremiumModal
        open={premiumOpen}
        profile={profile}
        update={update}
        notify={notify}
        onClose={() => setPremiumOpen(false)}
      />
      <Toast toast={toast} />
    </div>
  )
}
