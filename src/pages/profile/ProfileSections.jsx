import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BellOff, Building2, CalendarCheck, Info, LifeBuoy, MessageCircle, Newspaper, Tag } from 'lucide-react'
import {
  FiAlertTriangle,
  FiCalendar,
  FiCheck,
  FiChevronDown,
  FiGlobe,
  FiClock,
  FiLock,
  FiLogOut,
  FiMail,
  FiMoon,
  FiPlus,
  FiSend,
  FiSun,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa6'
import Button from '../../components/ui/Button.jsx'
import Select from '../../components/ui/Select.jsx'
import { useAuth } from '../../context/auth.js'
import { formatAgo, useNotifications } from '../../hooks/useNotifications.js'
import { useTheme } from '../../hooks/useTheme.js'
import * as authApi from '../../services/authApi.js'
import { api } from '../../services/apiClient.js'
import { maskPhone } from '../../utils/phone.js'
import { BOOKING_STATUSES, helpFaq, SUPPORT_TOPICS } from '../../data/profile.js'
import { ConfirmModal, Field } from './ProfileModal.jsx'
import { formatDate, isUpcoming, sortBookings } from './profileUtils.js'
import { useBookingCancel } from './useBookingCancel.jsx'
import NotificationSettings from './NotificationSettings.jsx'
import { lang, setLang, tr } from '../../i18n/index.js'
import { LANGUAGES } from '../../data/languages.js'

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
export function BookingsList({ bookings, onCancel, limit, empty = tr('Bronlar topilmadi') }) {
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
                      <FiX aria-hidden /> {tr('Bekor qilish')}
                    </button>
                  ) : (
                    <Link className="pf-link" to={`/majmua/${row.companyId}`}>
                      <FiPlus aria-hidden /> {tr('Qayta bron qilish')}
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
  { id: 'all', label: tr('Barchasi'), test: () => true },
  { id: 'active', label: tr('Faol'), test: isUpcoming },
  { id: 'completed', label: tr('Yakunlangan'), test: (b) => b.status === 'completed' },
  { id: 'cancelled', label: tr('Bekor qilingan'), test: (b) => b.status === 'cancelled' },
]

export function BookingsSection({ profile, update, notify }) {
  const [filter, setFilter] = useState('all')
  const [askCancel, cancelModal] = useBookingCancel(profile, update, notify)
  const sorted = sortBookings(profile.bookings)
  const active = BOOKING_FILTERS.find((item) => item.id === filter)

  return (
    <SectionCard
      title={tr('Mening bronlarim')}
      subtitle={tr('Jami {total} ta bron · {active} ta faol', { total: profile.bookings.length, active: profile.bookings.filter(isUpcoming).length })}
      action={
        <Link to="/sport-turlari" className="btn btn--primary pf-head-btn">
          <span className="btn__icon">
            <FiPlus />
          </span>
          <span className="btn__label">{tr('Yangi bron')}</span>
        </Link>
      }
    >
      <div className="pf-chips" role="tablist" aria-label={tr('Bronlar filtri')}>
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
      title={tr('Bildirishnomalar')}
      subtitle={unreadCount ? `${unreadCount} ta o‘qilmagan` : tr('Hammasi o‘qilgan')}
      action={
        <div className="pf-head-actions">
          <Button variant="outline" icon={<FiCheck />} onClick={markAllRead} disabled={!unreadCount}>
            {tr('Hammasini o‘qilgan qilish')}
          </Button>
        </div>
      }
    >
      <div className="pf-chips" role="tablist" aria-label={tr('Filtr')}>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'all'}
          className={`pf-chip${filter === 'all' ? ' is-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {tr('Barchasi')} <em>{items.length}{hasMore ? '+' : ''}</em>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={filter === 'unread'}
          className={`pf-chip${filter === 'unread' ? ' is-active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          {tr('O‘qilmagan')} <em>{unreadCount}</em>
        </button>
      </div>

      {!loaded ? (
        <p className="pf-empty">{tr('Yuklanmoqda…')}</p>
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
                  {item.unread && <span className="pf-notifs__dot" aria-label={tr('O‘qilmagan')} />}
                </button>
                <div className="pf-notifs__tools">
                  {item.unread && (
                    <button type="button" className="pf-icon-btn" title={tr('O‘qilgan')} aria-label={tr('O‘qilgan deb belgilash')} onClick={() => markRead(item.id)}>
                      <FiCheck />
                    </button>
                  )}
                  <button type="button" className="pf-icon-btn is-danger" title={tr('O‘chirish')} aria-label={tr('O‘chirish')} onClick={() => remove(item.id)}>
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
          <strong>{filter === 'unread' ? tr('Hammasi o‘qilgan') : tr('Bildirishnomalar yo‘q')}</strong>
          <span>{tr('Bron holati, eslatmalar va chegirmalar haqida shu yerda xabar beramiz.')}</span>
        </div>
      )}

      {hasMore && filter === 'all' && (
        <div className="pf-section__foot">
          <button type="button" className="pf-link" onClick={loadMore} disabled={loading}>
            {loading ? tr('Yuklanmoqda…') : tr('Yana ko‘rsatish')}
          </button>
        </div>
      )}

      {items.length > 0 && (
        <div className="pf-section__foot">
          <button
            type="button"
            className="pf-link is-danger"
            onClick={() => {
              if (window.confirm(tr('Barcha bildirishnomalar o‘chirilsinmi?'))) clearAll()
            }}
          >
            <FiTrash2 aria-hidden /> {tr('Barchasini tozalash')}
          </button>
        </div>
      )}
    </SectionCard>
  )
}

/* —— Sozlamalar —— */
export function SettingsSection({ notify }) {
  const { theme, setTheme } = useTheme()

  return (
    <SectionCard title={tr('Sozlamalar')} subtitle={tr('O‘zgarishlar avtomatik saqlanadi')}>
      <div className="pf-group">
        <h2>{tr('Bildirishnomalar')}</h2>
        <NotificationSettings notify={notify} />
      </div>

      <div className="pf-group">
        <h2>{tr('Til')}</h2>
        <div className="pf-theme">
          {LANGUAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={lang === item.id}
              className={`pf-theme__opt${lang === item.id ? ' is-active' : ''}`}
              onClick={() => setLang(item.id)}
            >
              <FiGlobe aria-hidden />
              {item.label}
              {lang === item.id && <FiCheck className="pf-theme__check" aria-hidden />}
            </button>
          ))}
        </div>
      </div>

      <div className="pf-group">
        <h2>{tr('Ko‘rinish')}</h2>
        <div className="pf-theme">
          {[
            { id: 'light', label: tr('Yorug‘'), icon: FiSun },
            { id: 'dark', label: tr('Qorong‘i'), icon: FiMoon },
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
function PasswordForm({ user, notify }) {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  if (!user) {
    return (
      <p className="pf-note">
        <FiLock aria-hidden /> {tr('Parolni o‘zgartirish uchun')} <Link to="/kirish" state={{ from: '/profil?bolim=xavfsizlik' }}>{tr('hisobingizga kiring')}</Link>.
      </p>
    )
  }
  if (user.provider && user.provider !== 'phone') {
    return (
      <p className="pf-note">
        <FiLock aria-hidden /> {tr('Siz')} {user.provider === 'google' ? tr('Google') : tr('Telegram')} {tr('orqali kirgansiz — parol shu xizmat tomonidan boshqariladi.')}
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
    if (!values.currentPassword) next.currentPassword = tr('Joriy parolni kiriting')
    if (values.newPassword.length < authApi.MIN_PASSWORD)
      next.newPassword = tr('Kamida {n} ta belgi', { n: authApi.MIN_PASSWORD })
    if (values.confirm !== values.newPassword) next.confirm = tr('Parollar mos kelmadi')
    if (Object.keys(next).length) return setErrors(next)

    setBusy(true)
    try {
      await authApi.changePassword({ phone: user.phone, currentPassword: values.currentPassword, newPassword: values.newPassword })
      setValues({ currentPassword: '', newPassword: '', confirm: '' })
      notify(tr('Parol muvaffaqiyatli o‘zgartirildi'))
    } catch (err) {
      setErrors({ [err.field ?? 'currentPassword']: err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="pf-grid" onSubmit={submit} noValidate>
      <Field label={tr('Joriy parol')} error={errors.currentPassword} full>
        <input className="pf-input" type="password" autoComplete="current-password" {...bind('currentPassword')} />
      </Field>
      <Field label={tr('Yangi parol')} error={errors.newPassword}>
        <input className="pf-input" type="password" autoComplete="new-password" {...bind('newPassword')} />
      </Field>
      <Field label={tr('Yangi parolni takrorlang')} error={errors.confirm}>
        <input className="pf-input" type="password" autoComplete="new-password" {...bind('confirm')} />
      </Field>
      <div className="pf-field--full">
        <Button type="submit" variant="primary" disabled={busy}>
          {busy ? tr('Saqlanmoqda…') : tr('Parolni yangilash')}
        </Button>
      </div>
    </form>
  )
}

export function SecuritySection({ profile, notify }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false)

  async function deleteAccount() {
    try {
      await authApi.deleteAccount()
    } catch (err) {
      notify(err.message)
      return
    }
    setConfirmDelete(false)
    logout()
    navigate('/', { replace: true })
  }

  async function logoutAll() {
    setConfirmLogoutAll(false)
    try {
      await authApi.logoutAll()
      notify(tr('Boshqa barcha qurilmalardan chiqildi'))
    } catch (err) {
      notify(err.message)
    }
  }

  return (
    <SectionCard title={tr('Hisob xavfsizligi')} subtitle={`${tr('Kirish raqami')}: ${profile.phone ? maskPhone(profile.phone) : '—'}`}>
      <div className="pf-group">
        <h2>{tr('Parolni o‘zgartirish')}</h2>
        <PasswordForm user={user} notify={notify} />
      </div>

      <div className="pf-group">
        <div className="pf-group__head">
          <h2>{tr('Qurilmalar')}</h2>
        </div>
        <p className="pf-note">
          {tr('Telefon yoki boshqa kompyuterda hisobingiz ochiq qolgan bo‘lsa yoki parolingiz begona odamga ma’lum bo‘lgan deb hisoblasangiz — barcha qurilmalardagi sessiyalarni yoping. Shu qurilmada hisobingiz ochiq qoladi.')}
        </p>
        <Button variant="outline" icon={<FiLogOut />} onClick={() => setConfirmLogoutAll(true)}>
          {tr('Boshqa barcha qurilmalardan chiqish')}
        </Button>
      </div>

      <div className="pf-group pf-danger-zone">
        <div>
          <h2>
            <FiAlertTriangle aria-hidden /> {tr('Hisobni o‘chirish')}
          </h2>
          <p>{tr('Profil, saqlanganlar va sozlamalar butunlay o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.')}</p>
        </div>
        <Button variant="outline" className="pf-btn-danger-outline" icon={<FiTrash2 />} onClick={() => setConfirmDelete(true)}>
          {tr('Hisobni o‘chirish')}
        </Button>
      </div>

      <ConfirmModal
        open={confirmLogoutAll}
        title={tr('Boshqa qurilmalardan chiqasizmi?')}
        text={tr('Boshqa barcha qurilma va brauzerlarda hisobingizdan chiqiladi. Shu qurilmada ochiq qoladi.')}
        confirmLabel={tr('Ha, chiqish')}
        onClose={() => setConfirmLogoutAll(false)}
        onConfirm={logoutAll}
      />
      <ConfirmModal
        open={confirmDelete}
        title={tr('Hisobni o‘chirasizmi?')}
        text={tr('Barcha ma’lumotlaringiz o‘chiriladi va siz tizimdan chiqasiz. Davom etasizmi?')}
        confirmLabel={tr('Ha, o‘chirish')}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteAccount}
      />
    </SectionCard>
  )
}

/* —— Yordam —— */
export function HelpSection({ profile, notify }) {
  const [topic, setTopic] = useState(SUPPORT_TOPICS[0].id)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [sending, setSending] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (message.trim().length < 10) return setError(tr('Murojaatni batafsilroq yozing (kamida 10 ta belgi)'))
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
    setMessage('')
    setError('')
    notify(tr('Murojaat yuborildi — javob bildirishnomalarda va Telegram’da keladi'))
  }

  return (
    <SectionCard title={tr('Yordam')} subtitle={tr('Ko‘p beriladigan savollar va qo‘llab-quvvatlash xizmati')}>
      <div className="pf-group">
        <h2>{tr('Ko‘p beriladigan savollar')}</h2>
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
        <h2>{tr('Biz bilan bog‘laning')}</h2>
        <div className="pf-contacts">
          <a href="https://t.me/sportonuz" target="_blank" rel="noreferrer">
            <FaTelegram aria-hidden />
            <span>
              <strong>{tr('Telegram')}</strong>
              {'@sportonuz'}
            </span>
          </a>
          <a href="mailto:info@sporton.uz">
            <FiMail aria-hidden />
            <span>
              <strong>{tr('Email')}</strong>
              {'info@sporton.uz'}
            </span>
          </a>
          <div>
            <FiClock aria-hidden />
            <span>
              <strong>{tr('Ish vaqti')}</strong>
              {tr('Du–Sha, 09:00–21:00')}
            </span>
          </div>
        </div>
      </div>

      <div className="pf-group">
        <h2>{tr('Murojaat yuborish')}</h2>
        <form className="pf-grid" onSubmit={submit} noValidate>
          <Field label={tr('Mavzu')} full>
            <Select value={topic} onChange={setTopic} options={SUPPORT_TOPICS} ariaLabel={tr('Mavzu')} />
          </Field>
          <Field label={tr('Xabar')} error={error} full>
            <textarea
              className="pf-input pf-textarea"
              rows={4}
              maxLength={1000}
              placeholder={tr('Muammoni batafsil yozing. Bron bo‘yicha bo‘lsa — majmua nomi va sanani ko‘rsating.')}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setError('')
              }}
            />
          </Field>
          <div className="pf-field--full">
            <Button type="submit" variant="primary" icon={<FiSend />} disabled={sending}>
              {sending ? tr('Yuborilmoqda…') : tr('Yuborish')}
            </Button>
          </div>
        </form>

      </div>
    </SectionCard>
  )
}
