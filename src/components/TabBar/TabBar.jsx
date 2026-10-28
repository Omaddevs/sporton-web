import { tr } from '../../i18n/index.js'
import { NavLink, useLocation } from 'react-router-dom'
import { FiHome, FiPlus, FiUser } from 'react-icons/fi'
import { Map as MapIcon } from 'lucide-react'
import HeartIcon from '../icons/HeartIcon.jsx'
import { loadJobsMapPage } from '../../pages/jobsMapLoader.js'
import { useAuth } from '../../context/auth.js'
import './TabBar.css'

function isTabActive(pathname, { to, end }) {
  return end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
}

/**
 * Mobil (≤639px) pastki tab bar. Faol bo‘lim — panel ustida ko‘tarilgan doira,
 * panelda uning ostida o‘yiq. Ikkalasi bitta animatsiyalanuvchi --tab-i dan hisoblanadi,
 * shuning uchun bo‘lim almashganda doira sakrab, o‘yiq to‘lqindek birga siljiydi.
 */
export default function TabBar() {
  const { user } = useAuth()
  const { pathname } = useLocation()

  const tabs = [
    { to: '/', label: tr('Bosh sahifa'), short: tr('Asosiy'), icon: <FiHome size={21} />, end: true },
    {
      to: '/saqlanganlar',
      label: tr('Saqlanganlar'),
      short: tr('Saqlangan'),
      icon: <HeartIcon size={22} strokeWidth={1.8} />,
    },
    {
      to: '/majmua-qoshish',
      label: tr('Majmua qo‘shish'),
      short: tr('Qo‘shish'),
      icon: <FiPlus size={22} strokeWidth={2.4} />,
      accent: true,
    },
    {
      to: '/xarita',
      label: tr('Xarita'),
      icon: <MapIcon size={21} strokeWidth={1.8} />,
      prefetch: loadJobsMapPage,
    },
    user
      ? { to: '/profil', label: tr('Profil'), icon: <FiUser size={21} /> }
      : { to: '/kirish', label: tr('Kirish'), icon: <FiUser size={21} /> },
  ]

  const activeIndex = tabs.findIndex((tab) => isTabActive(pathname, tab))
  const active = tabs[activeIndex]

  return (
    <nav className="tabbar" aria-label={tr('Asosiy navigatsiya')}>
      <div
        className={`tabbar__inner${active ? ' has-active' : ''}`}
        style={{ '--tab-n': tabs.length, ...(active ? { '--tab-i': activeIndex } : null) }}
      >
        <span className="tabbar__bg" aria-hidden="true" />

        {active ? (
          // key — har o‘tishda doira yoy bo‘ylab qaytadan sakraydi
          <span key={active.to} className="tabbar__bubble" aria-hidden="true">
            <span className="tabbar__bubble-icon">{active.icon}</span>
          </span>
        ) : null}

        {tabs.map(({ to, label, short, icon, end, prefetch, accent }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `tabbar__item${accent ? ' tabbar__item--accent' : ''}${isActive ? ' tabbar__item--active' : ''}`
            }
            aria-label={label}
            onTouchStart={prefetch}
            onFocus={prefetch}
          >
            <span className="tabbar__icon">
              {icon}
            </span>
            <span className="tabbar__label" aria-hidden="true">
              {short ?? label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
