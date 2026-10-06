import { useId, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BellOff, Building2, CalendarCheck, CheckCheck, Info, LifeBuoy, MessageCircle, Newspaper, Tag, X } from 'lucide-react'
import { FiBell } from 'react-icons/fi'
import { formatAgo, useNotifications } from '../../hooks/useNotifications.js'
import DropPanel from '../ui/DropPanel.jsx'
import './NotificationBell.css'

const TYPE_ICONS = {
  booking: CalendarCheck,
  message: MessageCircle,
  promo: Tag,
  news: Newspaper,
  system: Info,
  submission: Building2,
  support: LifeBuoy,
}

export default function NotificationBell({ ref, open, onToggle, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const panelId = useId()
  const notifications = useNotifications()
  const { signedIn, unreadCount, markRead, markAllRead, remove, clearAll } = notifications
  const [tab, setTab] = useState('all')
  // Vaqt yorlig‘i panel har ochilganda yangilanadi
  const [now, setNow] = useState(() => Date.now())

  function handleToggle() {
    if (!open) setNow(Date.now())
    onToggle()
  }

  const items = useMemo(
    () => notifications.items.map((item) => ({ ...item, timeLabel: formatAgo(item.createdAt, now) })),
    [notifications.items, now],
  )

  const visible = tab === 'unread' ? items.filter((item) => item.unread) : items

  function openItem(item) {
    markRead(item.id)
    onClose()
    if (!item.to) return
    if (/^https?:\/\//.test(item.to)) window.open(item.to, '_blank', 'noopener')
    else navigate(item.to)
  }

  const badge = unreadCount > 9 ? '9+' : String(unreadCount)
  const label = unreadCount
    ? `Bildirishnomalar, ${unreadCount} ta o‘qilmagan`
    : 'Bildirishnomalar'

  return (
    <div className={`topbar-dropdown notif ${open ? 'topbar-dropdown--open' : ''}`} ref={ref}>
      <button
        type="button"
        className={`notif__trigger ${open ? 'notif__trigger--open' : ''}`}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        title="Bildirishnomalar"
        onClick={handleToggle}
      >
        <FiBell className={unreadCount ? 'notif__bell notif__bell--ring' : 'notif__bell'} />
        {unreadCount > 0 && (
          <span className="notif__badge" aria-hidden="true">
            {badge}
          </span>
        )}
      </button>

      <DropPanel
        open={open}
        id={panelId}
        className="topbar-menu notif-panel"
        origin="end"
        role="dialog"
        aria-label="Bildirishnomalar"
      >
        <div className="notif-panel__head">
          <h3 className="notif-panel__title">Bildirishnomalar</h3>
          <button
            type="button"
            className="notif-panel__action"
            onClick={markAllRead}
            disabled={!unreadCount}
          >
            <CheckCheck size={16} strokeWidth={2.25} />
            Hammasini o‘qilgan qilish
          </button>
        </div>

        <div className="notif-panel__tabs" role="tablist" aria-label="Filtr">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'all'}
            className={`notif-panel__tab ${tab === 'all' ? 'notif-panel__tab--active' : ''}`}
            onClick={() => setTab('all')}
          >
            Barchasi
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'unread'}
            className={`notif-panel__tab ${tab === 'unread' ? 'notif-panel__tab--active' : ''}`}
            onClick={() => setTab('unread')}
          >
            O‘qilmagan
            {unreadCount > 0 && <span className="notif-panel__count">{unreadCount}</span>}
          </button>
        </div>

        {!signedIn ? (
          <div className="notif-panel__empty">
            <span className="notif-panel__empty-icon">
              <BellOff size={26} strokeWidth={1.9} />
            </span>
            <p className="notif-panel__empty-title">Bildirishnomalarni olish uchun kiring</p>
            <p className="notif-panel__empty-text">Bron holati, eslatmalar va chegirmalar haqida shu yerda xabar beramiz.</p>
            <Link to="/kirish" state={{ from: location.pathname }} className="notif-panel__login" onClick={onClose}>
              Kirish
            </Link>
          </div>
        ) : !notifications.loaded ? (
          <div className="notif-panel__empty">
            <p className="notif-panel__empty-text">Yuklanmoqda…</p>
          </div>
        ) : visible.length ? (
          <ul className="notif-panel__list">
            {visible.map((item) => {
              const Icon = TYPE_ICONS[item.type] ?? Info
              return (
                <li
                  key={item.id}
                  className={`notif-item ${item.unread ? 'notif-item--unread' : ''}`}
                >
                  <button type="button" className="notif-item__main" onClick={() => openItem(item)}>
                    <span className={`notif-item__icon notif-item__icon--${item.type}`}>
                      <Icon size={18} strokeWidth={2.1} />
                    </span>
                    <span className="notif-item__body">
                      <span className="notif-item__title">{item.title}</span>
                      <span className="notif-item__text">{item.text}</span>
                      <span className="notif-item__time">{item.timeLabel}</span>
                    </span>
                    {item.unread && <span className="notif-item__dot" aria-label="O‘qilmagan" />}
                  </button>
                  <button
                    type="button"
                    className="notif-item__remove"
                    aria-label={`«${item.title}» bildirishnomasini o‘chirish`}
                    title="O‘chirish"
                    onClick={() => remove(item.id)}
                  >
                    <X size={14} strokeWidth={2.5} />
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="notif-panel__empty">
            <span className="notif-panel__empty-icon">
              <BellOff size={26} strokeWidth={1.9} />
            </span>
            <p className="notif-panel__empty-title">
              {tab === 'unread' ? 'Hammasi o‘qilgan' : 'Bildirishnomalar yo‘q'}
            </p>
            <p className="notif-panel__empty-text">
              {tab === 'unread'
                ? 'Yangi bildirishnomalar shu yerda paydo bo‘ladi.'
                : 'Bron, xabar va chegirmalar haqida shu yerda xabar beramiz.'}
            </p>
          </div>
        )}

        {signedIn && (
          <div className="notif-panel__foot">
            <Link to="/profil?bolim=bildirishnomalar" className="notif-panel__all" onClick={onClose}>
              Barchasini ko‘rish
            </Link>
            {items.length > 0 && (
              <button
                type="button"
                className="notif-panel__clear"
                onClick={() => {
                  if (window.confirm('Barcha bildirishnomalar o‘chirilsinmi?')) clearAll()
                }}
              >
                Barchasini tozalash
              </button>
            )}
          </div>
        )}
      </DropPanel>
    </div>
  )
}
