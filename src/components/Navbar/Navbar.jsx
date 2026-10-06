import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiCalendar, FiPlus, FiUser } from 'react-icons/fi'
import { LayoutGrid, Map as MapIcon } from 'lucide-react'
import CategoriesMenu from '../CategoriesMenu/CategoriesMenu.jsx'
import MoreMenu from '../MoreMenu/MoreMenu.jsx'
import HeartIcon from '../icons/HeartIcon.jsx'
import MessageIcon from '../icons/MessageIcon.jsx'
import Button from '../ui/Button.jsx'
import SearchBar from '../SearchBar/SearchBar.jsx'
import { loadJobsMapPage } from '../../pages/jobsMapLoader.js'
import { useAuth } from '../../context/auth.js'
import { AuthGateModal } from '../Auth/AuthGate.jsx'
import { useAddComplex } from '../Auth/useAddComplex.js'
import '../ui/IconButton.css'
import './Navbar.css'

/** Ikon tugma — hover/focus bo‘lganda yozuv silliq ochiladi */
function NavPill({ to, label, icon, badge, className = '', ...rest }) {
  return (
    <Link
      to={to}
      className={`icon-btn icon-btn--outline nav-pill navbar__action-hide-sm ${className}`}
      aria-label={label}
      {...rest}
    >
      <span className="nav-pill__icon">
        {icon}
        {badge}
      </span>
      <span className="nav-pill__label" aria-hidden="true">
        <span>{label}</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const { user } = useAuth()
  const { openAddComplex, gateProps } = useAddComplex()
  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : ''

  return (
    <div className="navbar">
      <div className="container navbar__inner">
        <CategoriesMenu
          open={categoriesOpen}
          onOpenChange={setCategoriesOpen}
          trigger={({ buttonProps }) => (
            <Button
              variant="primary"
              icon={<LayoutGrid size={18} strokeWidth={2.4} />}
              {...buttonProps}
            >
              Sport turlari
            </Button>
          )}
        />

        <SearchBar />

        <div className="navbar__actions">
          <NavPill
            to="/xabarlar"
            label="Xabarlar"
            icon={<MessageIcon size={22} />}
            badge={<span className="navbar__msg-dot" aria-hidden="true" />}
          />
          <NavPill to="/saqlanganlar" label="Saqlanganlar" icon={<HeartIcon size={22} />} />
          <NavPill
            to="/xarita"
            label="Xarita"
            icon={<MapIcon size={21} strokeWidth={1.6} />}
            onMouseEnter={loadJobsMapPage}
            onFocus={loadJobsMapPage}
            onTouchStart={loadJobsMapPage}
          />
          <NavPill to="/bron" label="Bron qilish" icon={<FiCalendar size={20} />} />

          <Button
            variant="primary"
            icon={<FiPlus />}
            iconPosition="end"
            className="navbar__cta navbar__action-hide-lg"
            onClick={openAddComplex}
          >
            Majmua qo'shish
          </Button>

          {user ? (
            <Link to="/profil" className="navbar__profile navbar__profile--user" aria-label={`Profil: ${user.firstName} ${user.lastName}`}>
              <span aria-hidden="true">{initials || <FiUser />}</span>
            </Link>
          ) : (
            <Link to="/kirish" className="navbar__login">
              <FiUser aria-hidden="true" />
              Kirish
            </Link>
          )}

          <MoreMenu open={menuOpen} onOpenChange={setMenuOpen} onAddComplex={openAddComplex} />
          <AuthGateModal {...gateProps} />
        </div>
      </div>
    </div>
  )
}
