import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Globe,
  Heart,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  MessageCircle,
  Moon,
  Plus,
  Sun,
  X,
} from 'lucide-react'
import { FiUser } from 'react-icons/fi'
import { LANGUAGES } from '../../data/languages.js'
import { REGIONS } from '../../data/regions.js'
import BrandLogo from '../Brand/BrandLogo.jsx'
import SearchBar from '../SearchBar/SearchBar.jsx'
import './MobileMenu.css'

const LINKS = [
  { to: '/sport-turlari', label: 'Sport turlari', Icon: LayoutGrid },
  { to: '/xabarlar', label: 'Xabarlar', Icon: MessageCircle },
  { to: '/saqlanganlar', label: 'Saqlanganlar', Icon: Heart },
  { to: '/xarita', label: 'Xarita', Icon: MapIcon },
  { to: '/bron', label: 'Bron qilish', Icon: CalendarDays },
  { to: '/majmua-qoshish', label: 'Majmua qo‘shish', Icon: Plus },
]

/** Mobil (≤639px) chap yon menyu: header’dan ko‘chgan sozlamalar va bo‘limlar */
export default function MobileMenu({
  open,
  onClose,
  user,
  unreadCount,
  onOpenNotifications,
  regionId,
  onRegionChange,
  langId,
  onLangChange,
  theme,
  onThemeChange,
}) {
  const { pathname } = useLocation()

  // Boshqa sahifaga o‘tilganda menyu yopiladi
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  useEffect(() => {
    if (!open) return undefined
    const root = document.documentElement
    root.classList.add('mobile-menu-open')
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      root.classList.remove('mobile-menu-open')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : ''
  const tab = open ? 0 : -1

  return (
    <div className={`mobile-menu ${open ? 'is-open' : ''}`} aria-hidden={!open} inert={!open}>
      <div className="mobile-menu__backdrop" onClick={onClose} />

      <aside className="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Menyu">
        <div className="mobile-menu__head">
          <BrandLogo />
          <button type="button" className="mobile-menu__close" onClick={onClose} aria-label="Yopish" tabIndex={tab}>
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        <div className="mobile-menu__body">
          <Link to={user ? '/profil' : '/kirish'} className="mobile-menu__user" tabIndex={tab}>
            <span className="mobile-menu__avatar" aria-hidden="true">
              {initials || <FiUser />}
            </span>
            <span className="mobile-menu__user-text">
              <strong>{user ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'Mehmon'}</strong>
              <span>{user ? 'Profilni ko‘rish' : 'Kirish yoki ro‘yxatdan o‘tish'}</span>
            </span>
            <ChevronRight size={18} className="mobile-menu__chevron" aria-hidden="true" />
          </Link>

          <SearchBar />

          <section className="mobile-menu__group" aria-label="Sozlamalar">
            <button type="button" className="mobile-menu__row" onClick={onOpenNotifications} tabIndex={tab}>
              <span className="mobile-menu__icon">
                <Bell size={18} />
              </span>
              <span className="mobile-menu__label">Bildirishnomalar</span>
              {unreadCount > 0 && (
                <span className="mobile-menu__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
              <ChevronRight size={18} className="mobile-menu__chevron" aria-hidden="true" />
            </button>

            <label className="mobile-menu__row">
              <span className="mobile-menu__icon">
                <MapPin size={18} />
              </span>
              <span className="mobile-menu__label">Hudud</span>
              <select
                className="mobile-menu__select"
                value={regionId}
                onChange={(event) => onRegionChange(event.target.value)}
                tabIndex={tab}
              >
                {REGIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mobile-menu__row">
              <span className="mobile-menu__icon">
                <Globe size={18} />
              </span>
              <span className="mobile-menu__label">Til</span>
              <select
                className="mobile-menu__select"
                value={langId}
                onChange={(event) => onLangChange(event.target.value)}
                tabIndex={tab}
              >
                {LANGUAGES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code}
                  </option>
                ))}
              </select>
            </label>

            <div className="mobile-menu__row">
              <span className="mobile-menu__icon">{theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}</span>
              <span className="mobile-menu__label">Mavzu</span>
              <div className="mobile-menu__theme" role="group" aria-label="Mavzu">
                <button
                  type="button"
                  className={theme === 'light' ? 'is-active' : ''}
                  aria-pressed={theme === 'light'}
                  onClick={() => onThemeChange('light')}
                  tabIndex={tab}
                >
                  Kunduzgi
                </button>
                <button
                  type="button"
                  className={theme === 'dark' ? 'is-active' : ''}
                  aria-pressed={theme === 'dark'}
                  onClick={() => onThemeChange('dark')}
                  tabIndex={tab}
                >
                  Tungi
                </button>
              </div>
            </div>
          </section>

          <nav className="mobile-menu__group" aria-label="Bo‘limlar">
            {LINKS.map(({ to, label, Icon }) => (
              <Link key={to} to={to} className="mobile-menu__row" tabIndex={tab}>
                <span className="mobile-menu__icon">
                  <Icon size={18} />
                </span>
                <span className="mobile-menu__label">{label}</span>
                <ChevronRight size={18} className="mobile-menu__chevron" aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </div>
  )
}
