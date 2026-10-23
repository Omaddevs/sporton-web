import { NavLink, useLocation } from 'react-router-dom'
import { FiHome, FiUser } from 'react-icons/fi'
import { Map as MapIcon } from 'lucide-react'
import HeartIcon from '../icons/HeartIcon.jsx'
import MessageIcon from '../icons/MessageIcon.jsx'
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
    { to: '/', label: 'Bosh sahifa', short: 'Asosiy', icon: <FiHome size={21} />, end: true },
    {
      to: '/saqlanganlar',
      label: 'Saqlanganlar',
      short: 'Saqlangan',
      icon: <HeartIcon size={22} strokeWidth={1.8} />,
    },
    {
      to: '/xarita',
      label: 'Xarita',
      icon: <MapIcon size={21} strokeWidth={1.8} />,
      prefetch: loadJobsMapPage,
    },
    { to: '/xabarlar', label: 'Xabarlar', icon: <MessageIcon size={22} />, dot: true },
    user
      ? { to: '/profil', label: 'Profil', icon: <FiUser size={21} /> }
      : { to: '/kirish', label: 'Kirish', icon: <FiUser size={21} /> },
  ]

  const activeIndex = tabs.findIndex((tab) => isTabActive(pathname, tab))
  const active = tabs[activeIndex]

  return (
    <nav className="tabbar" aria-label="Asosiy navigatsiya">
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

        {tabs.map(({ to, label, short, icon, end, dot, prefetch }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `tabbar__item${isActive ? ' tabbar__item--active' : ''}`}
            aria-label={label}
            onTouchStart={prefetch}
            onFocus={prefetch}
          >
            <span className="tabbar__icon">
              {icon}
              {dot ? <span className="tabbar__dot" aria-hidden="true" /> : null}
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
