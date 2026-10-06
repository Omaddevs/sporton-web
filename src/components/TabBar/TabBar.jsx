import { NavLink } from 'react-router-dom'
import { FiHome, FiUser } from 'react-icons/fi'
import { Map as MapIcon } from 'lucide-react'
import HeartIcon from '../icons/HeartIcon.jsx'
import MessageIcon from '../icons/MessageIcon.jsx'
import { loadJobsMapPage } from '../../pages/jobsMapLoader.js'
import { useAuth } from '../../context/auth.js'
import './TabBar.css'

/** Mobil (≤639px) pastki tab bar — Navbar’da yashirilgan amallar shu yerga ko‘chadi */
export default function TabBar() {
  const { user } = useAuth()

  const tabs = [
    { to: '/', label: 'Bosh sahifa', icon: <FiHome size={21} />, end: true },
    { to: '/saqlanganlar', label: 'Saqlanganlar', icon: <HeartIcon size={22} strokeWidth={1.8} /> },
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

  return (
    <nav className="tabbar" aria-label="Asosiy navigatsiya">
      <div className="tabbar__inner">
        {tabs.map(({ to, label, icon, end, dot, prefetch }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `tabbar__item${isActive ? ' tabbar__item--active' : ''}`}
            aria-label={label}
            title={label}
            onTouchStart={prefetch}
            onFocus={prefetch}
          >
            {icon}
            {dot ? <span className="tabbar__dot" aria-hidden="true" /> : null}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
