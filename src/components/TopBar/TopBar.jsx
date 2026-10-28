import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Menu, Moon, Sun } from 'lucide-react'
import { FiChevronDown, FiGlobe, FiMapPin } from 'react-icons/fi'
import { LANGUAGES } from '../../data/languages.js'
import { DEFAULT_REGION_ID, isRegionActive, REGION_PICKER } from '../../data/regions.js'
import { useLocalStorageState } from '../../hooks/useLocalStorageState.js'
import { useTheme } from '../../hooks/useTheme.js'
import useMediaQuery from '../../hooks/useMediaQuery.js'
import { useAuth } from '../../context/auth.js'
import { useNotifications } from '../../hooks/useNotifications.js'
import BrandLogo from '../Brand/BrandLogo.jsx'
import DropPanel from '../ui/DropPanel.jsx'
import NotificationBell from './NotificationBell.jsx'
import MobileMenu from './MobileMenu.jsx'
import './TopBar.css'
import { lang, setLang, tr } from '../../i18n/index.js'

export default function TopBar() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  // Mobilda: ☰ + markazda logo; hudud, til, mavzu va bildirishnomalar yon menyuda
  const isMobile = useMediaQuery('(max-width: 639px)')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const [storedRegionId, setRegionId] = useLocalStorageState('sporton-region', DEFAULT_REGION_ID)
  // Avval «Barcha hududlar» yoki hozircha yopiq hudud tanlangan bo‘lsa — Toshkent shahri
  const regionId = isRegionActive(storedRegionId) ? storedRegionId : DEFAULT_REGION_ID
  // Til almashganda sahifa qayta yuklanadi (src/i18n)
  const langId = lang
  const setLangId = setLang
  const [openMenu, setOpenMenu] = useState(null)
  const regionRef = useRef(null)
  const langRef = useRef(null)
  const notifRef = useRef(null)

  const region = REGION_PICKER.find((item) => item.id === regionId) ?? REGION_PICKER[0]
  const language = LANGUAGES.find((item) => item.id === langId) ?? LANGUAGES[0]

  const closeMenus = useCallback(() => setOpenMenu(null), [])

  useEffect(() => {
    if (!openMenu) return undefined

    function onPointerDown(event) {
      const target = event.target
      if (
        regionRef.current?.contains(target) ||
        langRef.current?.contains(target) ||
        notifRef.current?.contains(target)
      )
        return
      closeMenus()
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') closeMenus()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openMenu, closeMenus])

  const regionDropdown = (
    <Dropdown
      ref={regionRef}
      open={openMenu === 'region'}
      onToggle={() => setOpenMenu((current) => (current === 'region' ? null : 'region'))}
      trigger={
        <>
          <FiMapPin />
          <span>{region.label}</span>
          <FiChevronDown
            className={`topbar__chevron ${openMenu === 'region' ? 'topbar__chevron--open' : ''}`}
          />
        </>
      }
      ariaLabel={tr('Hududni tanlash')}
      menuClassName="topbar-menu--regions"
      origin="start"
    >
      {REGION_PICKER.map((item) => (
        <DropdownOption
          key={item.id}
          selected={item.id === region.id}
          disabled={!isRegionActive(item.id)}
          onSelect={() => {
            setRegionId(item.id)
            closeMenus()
          }}
        >
          {item.label}
        </DropdownOption>
      ))}
    </Dropdown>
  )

  return (
    <div className="topbar">
      <div className="container topbar__inner">
        {isMobile ? (
          <>
            <button
              type="button"
              className="topbar__burger"
              onClick={() => setDrawerOpen(true)}
              aria-label={unreadCount ? tr('Menyu, {n} ta o‘qilmagan bildirishnoma', { n: unreadCount }) : tr('Menyu')}
              aria-expanded={drawerOpen}
            >
              <Menu size={26} strokeWidth={2.2} />
              {unreadCount > 0 && (
                <span className="topbar__burger-badge" aria-hidden="true">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <Link to="/" className="topbar__brand" aria-label={tr('SportON — bosh sahifa')}>
              <BrandLogo />
              <span className="topbar__tagline">{tr('Sport bilan yaqinroq!')}</span>
            </Link>

            <MobileMenu
              open={drawerOpen}
              onClose={closeDrawer}
              user={user}
              unreadCount={unreadCount}
              onOpenNotifications={() => {
                setDrawerOpen(false)
                setOpenMenu('notif')
              }}
              regionId={region.id}
              onRegionChange={setRegionId}
              langId={language.id}
              onLangChange={setLangId}
              theme={theme}
              onThemeChange={setTheme}
            />
          </>
        ) : (
          <Link to="/" className="topbar__logo" aria-label={tr('SportON — bosh sahifa')}>
            <BrandLogo tone="onPrimary" />
          </Link>
        )}

        <div className="topbar__right">
          <NotificationBell
            ref={notifRef}
            open={openMenu === 'notif'}
            onToggle={() => setOpenMenu((current) => (current === 'notif' ? null : 'notif'))}
            onClose={closeMenus}
          />

          {isMobile ? null : regionDropdown}

          <div className="topbar__theme" role="group" aria-label={tr('Mavzu')}>
            <button
              type="button"
              className={`topbar__theme-btn ${theme === 'light' ? 'topbar__theme-btn--active' : ''}`}
              onClick={() => setTheme('light')}
              aria-label={tr('Light mode')}
              aria-pressed={theme === 'light'}
              title={tr('Light mode')}
            >
              <Sun size={16} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              className={`topbar__theme-btn ${theme === 'dark' ? 'topbar__theme-btn--active' : ''}`}
              onClick={() => setTheme('dark')}
              aria-label={tr('Dark mode')}
              aria-pressed={theme === 'dark'}
              title={tr('Dark mode')}
            >
              <Moon size={16} strokeWidth={2.25} />
            </button>
          </div>

          <Dropdown
            ref={langRef}
            open={openMenu === 'lang'}
            onToggle={() => setOpenMenu((current) => (current === 'lang' ? null : 'lang'))}
            trigger={
              <>
                <FiGlobe />
                <span>{language.short}</span>
                <FiChevronDown
                  className={`topbar__chevron ${openMenu === 'lang' ? 'topbar__chevron--open' : ''}`}
                />
              </>
            }
            ariaLabel={tr('Tilni tanlash')}
            menuClassName="topbar-menu--lang"
            align="end"
            origin="end"
          >
            {LANGUAGES.map((item) => (
              <DropdownOption
                key={item.id}
                selected={item.id === language.id}
                onSelect={() => {
                  setLangId(item.id)
                  closeMenus()
                }}
              >
                {item.code}
              </DropdownOption>
            ))}
          </Dropdown>
        </div>
      </div>
    </div>
  )
}

function Dropdown({
  ref,
  open,
  onToggle,
  trigger,
  children,
  ariaLabel,
  menuClassName = '',
  align = 'start',
  origin = 'center',
}) {
  const menuId = useId()

  return (
    <div className={`topbar-dropdown ${open ? 'topbar-dropdown--open' : ''}`} ref={ref}>
      <button
        type="button"
        className="topbar__link"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={onToggle}
      >
        {trigger}
      </button>

      <DropPanel
        open={open}
        id={menuId}
        className={`topbar-menu ${menuClassName} topbar-menu--${align}`}
        origin={origin}
        role="listbox"
        aria-label={ariaLabel}
      >
        {children}
      </DropPanel>
    </div>
  )
}

function DropdownOption({ selected, disabled, onSelect, children }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      className={`topbar-menu__item ${selected ? 'topbar-menu__item--selected' : ''} ${disabled ? 'topbar-menu__item--soon' : ''}`}
      onClick={disabled ? undefined : onSelect}
    >
      <span className="topbar-menu__label">{children}</span>
      {disabled && <span className="topbar-menu__soon">{tr('Tez orada')}</span>}
      {selected && <Check className="topbar-menu__check" size={16} strokeWidth={2.5} />}
    </button>
  )
}
