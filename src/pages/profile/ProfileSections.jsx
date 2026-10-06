import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BellOff, Building2, CalendarCheck, Info, LifeBuoy, MessageCircle, Newspaper, Tag } from 'lucide-react'
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiClock,
  FiLock,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiMonitor,
  FiMoon,
  FiPlus,
  FiSend,
  FiSmartphone,
  FiSun,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa6'
import Button from '../../components/ui/Button.jsx'
import Select from '../../components/ui/Select.jsx'
import { useAuth } from '../../context/auth.js'
import { formatAgo, useNotifications } from '../../hooks/useNotifications.js'
import { newId } from '../../hooks/useProfile.js'
import { useTheme } from '../../hooks/useTheme.js'
import * as authApi from '../../services/authApi.js'
import { api } from '../../services/apiClient.js'
import { maskPhone } from '../../utils/phone.js'
import { BOOKING_STATUSES, helpFaq, SUPPORT_TOPICS } from '../../data/profile.js'
import { ConfirmModal, Field, Toggle } from './ProfileModal.jsx'
import { formatDate, isUpcoming, sortBookings } from './profileUtils.js'
import { useBookingCancel } from './useBookingCancel.jsx'
import NotificationSettings from './NotificationSettings.jsx'

function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="profile-card pf-section">
      <div className="pf-section__head">
        <div>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/* —— Bronlar —— */
export function BookingsList({ bookings, onCancel, limit, empty = 'Bronlar topilmadi' }) {
  const rows = limit ? bookings.slice(0, limit) : bookings
  if (!rows.length) return <p className="pf-empty">{empty}</p>

  return (
    <div className="profile-activity">
      {rows.map((row) => {
        const status = BOOKING_STATUSES[row.status] ?? BOOKING_STATUSES.pending
        const upcoming = isUpcoming(row)
        return (
          <div key={row.id} className="profile-activity__row">
            <div className="profile-activity__icon" aria-hidden>
              <FiCalendar />
            </div>
            <div className="profile-activity__body">
              <strong>{row.title}</strong>
              <span>
                <Link to={`/majmua/${row.companyId}`}>{row.place}</Link> · {row.time}
                {row.price ? ` · ${row.price}` : ''}
              </span>
              {onCancel && (
                <div className="pf-booking__actions">
                  {upcoming ? (
                    <button type="button" className="pf-link is-danger" onClick={() => onCancel(row)}>
                      <FiX aria-hidden /> Bekor qilish
                    </button>
                  ) : (
                    <Link className="pf-link" to={`/majmua/${row.companyId}`}>
                      <FiPlus aria-hidden /> Qayta bron qilish
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="profile-activity__meta">
              <time dateTime={row.date}>{formatDate(row.date)}</time>
              <em className={`profile-activity__status is-${status.tone}`}>{status.label}</em>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const BOOKING_FILTERS = [
  { id: 'all', label: 'Barchasi', test: () => true },
  { id: 'active', label: 'Faol', test: isUpcoming },
  { id: 'completed', label: 'Yakunlangan', test: (b) => b.status === 'completed' },
  { id: 'cancelled', label: 'Bekor qilingan', test: (b) => b.status === 'cancelled' },
]

export function BookingsSection({ profile, update, notify }) {
  const [filter, setFilter] = useState('all')
  const [askCancel, cancelModal] = useBookingCancel(profile, update, notify)
  const sorted = sortBookings(profile.bookings)
  const active = BOOKING_FILTERS.find((item) => item.id === filter)

  return (
    <SectionCard
      title="Mening bronlarim"
      subtitle={`Jami ${profile.bookings.length} ta bron · ${profile.bookings.filter(isUpcoming).length} ta faol`}
      action={
        <Link to="/sport-turlari" className="btn btn--primary pf-head-btn">
          <span className="btn__icon">
            <FiPlus />
          </span>
          <span className="btn__label">Yangi bron</span>
        </Link>
      }
    >
      <div className="pf-chips" role="tablist" aria-label="Bronlar filtri">
        {BOOKING_FILTERS.map((item) => {
          const count = profile.bookings.filter(item.test).length
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              className={`pf-chip${filter === item.id ? ' is-active' : ''}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
              <em>{count}</em>
            </button>
          )
        })}
      </div>
      <BookingsList bookings={sorted.filter(active.test)} onCancel={askCancel} />
      {cancelModal}
    </SectionCard>
  )
}

/* —— Bildirishnomalar —— */
const TYPE_ICONS = {
  booking: CalendarCheck,
  message: MessageCircle,
  promo: Tag,
  news: Newspaper,
  system: Info,
  submission: Building2,
  support: LifeBuoy,
}

export function NotificationsSection() {
  const navigate = useNavigate()
  const { items, unreadCount, markRead, markAllRead, remove, clearAll, loaded, hasMore, loading, loadMore } = useNotifications()
  const [filter, setFilter] = useState('all')
  const visible = filter === 'unread' ? items.filter((item) => item.unread) : items

  function open(item) {
    markRead(item.id)
    if (!item.to) return
    if (/^https?:\/\//.test(item.to)) window.open(item.to, '_blank', 'noopener')
    else if (!item.to.startsWith('/profil?bolim=bildirishnomalar')) navigate(item.to)
  }

  return (
    <SectionCard
      title="Bildirishnomalar"
      subtitle={unreadCount ? `${unreadCount} ta o‘qilmagan` : 'Hammasi o‘qilgan'}
      action={
        <div className="pf-head-actions">
          <Button variant="outline" icon={<FiCheck />} onClick={markAllRead} disabled={!unreadCount}>
            Hammasini o‘qilgan qilish
          </Button>
        </div>
      }
    >
      <div className="pf-chips" role="tablist" aria-label="Filtr">
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          className={`pf-chip${filter === 'all' ? ' is-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Barchasi <em>{items.length}{hasMore ? '+' : ''}</em>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'unread'}
          className={`pf-chip${filter === 'unread' ? ' is-active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          O‘qilmagan <em>{unreadCount}</em>
        </button>
      </div>

      {!loaded ? (
        <p className="pf-empty">Yuklanmoqda…</p>
      ) : visible.length ? (
        <ul className="pf-notifs">
          {visible.map((item) => {
            const Icon = TYPE_ICONS[item.type] ?? Info
            return (
              <li key={item.id} className={item.unread ? 'is-unread' : ''}>
                <button type="button" className="pf-notifs__main" onClick={() => open(item)}>
                  <span className={`notif-item__icon notif-item__icon--${item.type}`}>
                    <Icon size={18} strokeWidth={2.1} />
                  </span>
                  <span className="pf-notifs__body">
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                    <time dateTime={item.createdAt}>{formatAgo(item.createdAt)}</time>
                  </span>
                  {item.unread && <span className="pf-notifs__dot" aria-label="O‘qilmagan" />}
                </button>
                <div className="pf-notifs__tools">
                  {item.unread && (
                    <button type="button" className="pf-icon-btn" title="O‘qilgan" aria-label="O‘qilgan deb belgilash" onClick={() => markRead(item.id)}>
                      <FiCheck />
                    </button>
                  )}
                  <button type="button" className="pf-icon-btn is-danger" title="O‘chirish" aria-label="O‘chirish" onClick={() => remove(item.id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="pf-empty pf-empty--center">
          <BellOff size={28} strokeWidth={1.8} />
          <strong>{filter === 'unread' ? 'Hammasi o‘qilgan' : 'Bildirishnomalar yo‘q'}</strong>
          <span>Bron holati, eslatmalar va chegirmalar haqida shu yerda xabar beramiz.</span>
        </div>
      )}

      {hasMore && filter === 'all' && (
        <div className="pf-section__foot">
          <button type="button" className="pf-link" onClick={loadMore} disabled={loading}>
            {loading ? 'Yuklanmoqda…' : 'Yana ko‘rsatish'}
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="pf-section__foot">
          <button
            type="button"
            className="pf-link is-danger"
            onClick={() => {
              if (window.confirm('Barcha bildirishnomalar o‘chirilsinmi?')) clearAll()
            }}
          >
            <FiTrash2 aria-hidden /> Barchasini tozalash
          </button>
        </div>
      )}
    </SectionCard>
  )
}

/* —— Sozlamalar —— */
const SETTINGS_GROUPS = [
  {
    title: 'Maxfiylik',
    items: [
      { key: 'publicProfile', label: 'Ommaviy profil', description: 'Boshqa sportchilar profilingizni ko‘ra oladi' },
      { key: 'showPhone', label: 'Telefon raqamni ko‘rsatish', description: 'Majmualar raqamingizni ko‘radi' },
    ],
  },
]

export function SettingsSection({ profile, update, notify }) {
  const { theme, setTheme } = useTheme()

  function toggle(key, value) {
    update({ settings: { ...profile.settings, [key]: value } })
    notify(value ? 'Yoqildi' : 'O‘chirildi')
  }

  return (
    <SectionCard title="Sozlamalar" subtitle="O‘zgarishlar avtomatik saqlanadi">
      <div className="pf-group">
        <h2>Bildirishnomalar</h2>
        <NotificationSettings notify={notify} />
      </div>
      {SETTINGS_GROUPS.map((group) => (
        <div key={group.title} className="pf-group">
          <h2>{group.title}</h2>
          {group.items.map((item) => (
            <Toggle
              key={item.key}
              label={item.label}
              description={item.description}
              checked={Boolean(profile.settings[item.key])}
              onChange={(value) => toggle(item.key, value)}
            />
          ))}
        </div>
      ))}

      <div className="pf-group">
        <h2>Ko‘rinish</h2>
        <div className="pf-theme">
          {[
            { id: 'light', label: 'Yorug‘', icon: FiSun },
            { id: 'dark', label: 'Qorong‘i', icon: FiMoon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={theme === id}
              className={`pf-theme__opt${theme === id ? ' is-active' : ''}`}
              onClick={() => setTheme(id)}
            >
              <Icon aria-hidden />
              {label}
              {theme === id && <FiCheck className="pf-theme__check" aria-hidden />}
            </button>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

/* —— Hisob xavfsizligi —— */
function currentDevice() {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent
  const os = /iPhone|iPad/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac/.test(ua) ? 'macOS' : /Win/.test(ua) ? 'Windows' : 'Linux'
  const browser = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Brauzer'
  return `${os} · ${browser}`
}

function PasswordForm({ user, notify }) {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  if (!user) {
    return (
      <p className="pf-note">
        <FiLock aria-hidden /> Parolni o‘zgartirish uchun <Link to="/kirish" state={{ from: '/profil?bolim=xavfsizlik' }}>hisobingizga kiring</Link>.
      </p>
    )
  }
  if (user.provider && user.provider !== 'phone') {
    return (
      <p className="pf-note">
        <FiLock aria-hidden /> Siz {user.provider === 'google' ? 'Google' : 'Telegram'} orqali kirgansiz — parol shu xizmat tomonidan boshqariladi.
      </p>
    )
  }

  const bind = (key) => ({
    value: values[key],
    onChange: (e) => {
      setValues((prev) => ({ ...prev, [key]: e.target.value }))
      setErrors((prev) => ({ ...prev, [key]: undefined }))
    },
  })

  async function submit(e) {
    e.preventDefault()
    const next = {}
    if (!values.currentPassword) next.currentPassword = 'Joriy parolni kiriting'
    if (values.newPassword.length < authApi.MIN_PASSWORD)
      next.newPassword = `Kamida ${authApi.MIN_PASSWORD} ta belgi`
    if (values.confirm !== values.newPassword) next.confirm = 'Parollar mos kelmadi'
    if (Object.keys(next).length) return setErrors(next)

    setBusy(true)
    try {
      await authApi.changePassword({ phone: user.phone, currentPassword: values.currentPassword, newPassword: values.newPassword })
      setValues({ currentPassword: '', newPassword: '', confirm: '' })
      notify('Parol muvaffaqiyatli o‘zgartirildi')
    } catch (err) {
      setErrors({ [err.field ?? 'currentPassword']: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="pf-grid" onSubmit={submit} noValidate>
      <Field label="Joriy parol" error={errors.currentPassword} full>
        <input className="pf-input" type="password" autoComplete="current-password" {...bind('currentPassword')} />
      </Field>
      <Field label="Yangi parol" error={errors.newPassword}>
        <input className="pf-input" type="password" autoComplete="new-password" {...bind('newPassword')} />
      </Field>
      <Field label="Yangi parolni takrorlang" error={errors.confirm}>
        <input className="pf-input" type="password" autoComplete="new-password" {...bind('confirm')} />
      </Field>
      <div className="pf-field--full">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? 'Saqlanmoqda…' : 'Parolni yangilash'}
        </Button>
      </div>
    </form>
  )
}

export function SecuritySection({ profile, update, notify, resetProfile }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const sessions = profile.security.sessions
  const others = sessions.filter((s) => !s.current)

  const setSecurity = (patch) => update({ security: { ...profile.security, ...patch } })

  async function deleteAccount() {
    try {
      if (user) await authApi.deleteAccount()
    } catch (err) {
      notify(err.message)
      return
    }
    resetProfile()
    setConfirmDelete(false)
    logout()
    navigate('/', { replace: true })
  }

  return (
    <SectionCard title="Hisob xavfsizligi" subtitle={`Kirish raqami: ${profile.phone ? maskPhone(profile.phone) : '—'}`}>
      <div className="pf-group">
        <h2>Parolni o‘zgartirish</h2>
        <PasswordForm user={user} notify={notify} />
      </div>

      <div className="pf-group">
        <h2>Qo‘shimcha himoya</h2>
        <Toggle
          label="Ikki bosqichli tasdiqlash"
          description="Yangi qurilmadan kirishda Telegram orqali kod so‘raladi"
          checked={profile.security.twoFactor}
          onChange={(value) => {
            setSecurity({ twoFactor: value })
            notify(value ? 'Ikki bosqichli tasdiqlash yoqildi' : 'Ikki bosqichli tasdiqlash o‘chirildi')
          }}
        />
      </div>

      <div className="pf-group">
        <div className="pf-group__head">
          <h2>Faol seanslar</h2>
          {others.length > 0 && (
            <button
              type="button"
              className="pf-link is-danger"
              onClick={() => {
                setSecurity({ sessions: sessions.filter((s) => s.current) })
                notify('Boshqa barcha qurilmalardan chiqildi')
              }}
            >
              <FiLogOut aria-hidden /> Boshqa qurilmalardan chiqish
            </button>
          )}
        </div>
        <ul className="pf-sessions">
          {sessions.map((s) => (
            <li key={s.id}>
              <span className="pf-sessions__icon" aria-hidden>
                {s.current ? <FiMonitor /> : <FiSmartphone />}
              </span>
              <div>
                <strong>
                  {s.current ? currentDevice() : `${s.device} · ${s.detail}`}
                  {s.current && <em className="pf-badge">Joriy</em>}
                </strong>
                <span>
                  <FiMapPin aria-hidden /> {s.location} · <FiClock aria-hidden /> {s.last}
                </span>
              </div>
              {!s.current && (
                <button
                  type="button"
                  className="pf-link is-danger"
                  onClick={() => {
                    setSecurity({ sessions: sessions.filter((item) => item.id !== s.id) })
                    notify(`${s.device} seansi yakunlandi`)
                  }}
                >
                  Chiqarish
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="pf-group pf-danger-zone">
        <div>
          <h2>
            <FiAlertTriangle aria-hidden /> Hisobni o‘chirish
          </h2>
          <p>Profil, bronlar tarixi va bonus ballar butunlay o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.</p>
        </div>
        <Button variant="outline" className="pf-btn-danger-outline" icon={<FiTrash2 />} onClick={() => setConfirmDelete(true)}>
          Hisobni o‘chirish
        </Button>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Hisobni o‘chirasizmi?"
        text="Barcha ma’lumotlaringiz o‘chiriladi va siz tizimdan chiqasiz. Davom etasizmi?"
        confirmLabel="Ha, o‘chirish"
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteAccount}
      />
    </SectionCard>
  )
}

/* —— Yordam —— */
export function HelpSection({ profile, update, notify }) {
  const [topic, setTopic] = useState(SUPPORT_TOPICS[0].id)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const requests = profile.supportRequests ?? []

  const [sending, setSending] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (message.trim().length < 10) return setError('Murojaatni batafsilroq yozing (kamida 10 ta belgi)')
    setSending(true)
    try {
      await api('/support', {
        method: 'POST',
        body: {
          topic: SUPPORT_TOPICS.find((t) => t.id === topic)?.label ?? topic,
          message: message.trim(),
          name: profile.name,
          contact: profile.phone ? `+998${profile.phone}` : profile.email || undefined,
        },
      })
    } catch (err) {
      setSending(false)
      return setError(err.message)
    }
    setSending(false)
    const request = {
      id: newId('req'),
      topic,
      message: message.trim(),
      date: new Date().toISOString().slice(0, 10),
      status: 'Ko‘rib chiqilmoqda',
    }
    update({ supportRequests: [request, ...requests] })
    setMessage('')
    setError('')
    notify('Murojaat yuborildi — 24 soat ichida javob beramiz')
  }

  return (
    <SectionCard title="Yordam" subtitle="Ko‘p beriladigan savollar va qo‘llab-quvvatlash xizmati">
      <div className="pf-group">
        <h2>Ko‘p beriladigan savollar</h2>
        <div className="pf-faq">
          {helpFaq.map((item) => (
            <details key={item.q}>
              <summary>
                {item.q}
                <FiChevronDown aria-hidden />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>

      <div className="pf-group">
        <h2>Biz bilan bog‘laning</h2>
        <div className="pf-contacts">
          <a href="https://t.me/sportonuz" target="_blank" rel="noreferrer">
            <FaTelegram aria-hidden />
            <span>
              <strong>Telegram</strong>
              @sportonuz
            </span>
          </a>
          <a href="mailto:info@sporton.uz">
            <FiMail aria-hidden />
            <span>
              <strong>Email</strong>
              info@sporton.uz
            </span>
          </a>
          <div>
            <FiClock aria-hidden />
            <span>
              <strong>Ish vaqti</strong>
              Du–Sha, 09:00–21:00
            </span>
          </div>
        </div>
      </div>

      <div className="pf-group">
        <h2>Murojaat yuborish</h2>
        <form className="pf-grid" onSubmit={submit} noValidate>
          <Field label="Mavzu" full>
            <Select value={topic} onChange={setTopic} options={SUPPORT_TOPICS} ariaLabel="Mavzu" />
          </Field>
          <Field label="Xabar" error={error} full>
            <textarea
              className="pf-input pf-textarea"
              rows={4}
              maxLength={1000}
              placeholder="Muammoni batafsil yozing. Bron bo‘yicha bo‘lsa — majmua nomi va sanani ko‘rsating."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setError('')
              }}
            />
          </Field>
          <div className="pf-field--full">
            <Button type="submit" variant="primary" icon={<FiSend />} disabled={sending}>
              {sending ? 'Yuborilmoqda…' : 'Yuborish'}
            </Button>
          </div>
        </form>

        {requests.length > 0 && (
          <ul className="pf-requests">
            {requests.map((req) => (
              <li key={req.id}>
                <div>
                  <strong>{SUPPORT_TOPICS.find((t) => t.id === req.topic)?.label}</strong>
                  <span>{req.message}</span>
                </div>
                <div className="profile-activity__meta">
                  <time>{formatDate(req.date)}</time>
                  <em className="profile-activity__status is-pending">{req.status}</em>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </SectionCard>
  )
}
