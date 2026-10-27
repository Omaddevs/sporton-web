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
import { tr } from '../../i18n/index.js'

const LINKS = [
  { to: '/sport-turlari', label: tr('Sport turlari'), Icon: LayoutGrid },
  { to: '/saqlanganlar', label: tr('Saqlanganlar'), Icon: Heart },
  { to: '/xarita', label: tr('Xarita'), Icon: MapIcon },
  { to: '/bron', label: tr('Bron qilish'), Icon: CalendarDays },
  { to: '/majmua-qoshish', label: tr('Majmua qo‘shish'), Icon: Plus },
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

      <aside className="mobile-menu__panel" role="dialog" aria-modal="true" aria-label={tr('Menyu')}>
        <div className="mobile-menu__head">
          <BrandLogo />
          <button type="button" className="mobile-menu__close" onClick={onClose} aria-label={tr('Yopish')} tabIndex={tab}>
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        <div className="mobile-menu__body">
          <Link to={user ? '/profil' : '/kirish'} className="mobile-menu__user" tabIndex={tab}>
            <span className="mobile-menu__avatar" aria-hidden="true">
              {initials || <FiUser />}
            </span>
            <span className="mobile-menu__user-text">
              <strong>{user ? `${user.firstName} ${user.lastName ?? ''}`.trim() : tr('Mehmon')}</strong>
              <span>{user ? tr('Profilni ko‘rish') : tr('Kirish yoki ro‘yxatdan o‘tish')}</span>
            </span>
            <ChevronRight size={18} className="mobile-menu__chevron" aria-hidden="true" />
          </Link>

          <SearchBar />

          <section className="mobile-menu__group" aria-label={tr('Sozlamalar')}>
            <button type="button" className="mobile-menu__row" onClick={onOpenNotifications} tabIndex={tab}>
              <span className="mobile-menu__icon">
                <Bell size={18} />
              </span>
              <span className="mobile-menu__label">{tr('Bildirishnomalar')}</span>
              {unreadCount > 0 && (
                <span className="mobile-menu__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
              <ChevronRight size={18} className="mobile-menu__chevron" aria-hidden="true" />
            </button>

            <label className="mobile-menu__row">
              <span className="mobile-menu__icon">
                <MapPin size={18} />
              </span>
              <span className="mobile-menu__label">{tr('Hudud')}</span>
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
              <span className="mobile-menu__label">{tr('Til')}</span>
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
              <span className="mobile-menu__label">{tr('Mavzu')}</span>
              <div className="mobile-menu__theme" role="group" aria-label={tr('Mavzu')}>
                <button
                  type="button"
                  className={theme === 'light' ? 'is-active' : ''}
                  aria-pressed={theme === 'light'}
                  onClick={() => onThemeChange('light')}
                  tabIndex={tab}
                >
                  {tr('Kunduzgi')}
                </button>
                <button
                  type="button"
                  className={theme === 'dark' ? 'is-active' : ''}
                  aria-pressed={theme === 'dark'}
                  onClick={() => onThemeChange('dark')}
                  tabIndex={tab}
                >
                  {tr('Tungi')}
                </button>
              </div>
            </div>
          </section>

          <nav className="mobile-menu__group" aria-label={tr('Bo‘limlar')}>
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
