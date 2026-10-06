import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Moon, Sun } from 'lucide-react'
import { FiChevronDown, FiGlobe, FiMapPin } from 'react-icons/fi'
import { LANGUAGES } from '../../data/languages.js'
import { REGIONS } from '../../data/regions.js'
import { useLocalStorageState } from '../../hooks/useLocalStorageState.js'
import { useTheme } from '../../hooks/useTheme.js'
import BrandLogo from '../Brand/BrandLogo.jsx'
import DropPanel from '../ui/DropPanel.jsx'
import NotificationBell from './NotificationBell.jsx'
import './TopBar.css'

export default function TopBar() {
  const { theme, setTheme } = useTheme()
  const [regionId, setRegionId] = useLocalStorageState('sporton-region', 'all')
  const [langId, setLangId] = useLocalStorageState('sporton-lang', 'uz')
  const [openMenu, setOpenMenu] = useState(null)
  const regionRef = useRef(null)
  const langRef = useRef(null)
  const notifRef = useRef(null)

  const region = REGIONS.find((item) => item.id === regionId) ?? REGIONS[0]
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

  useEffect(() => {
    document.documentElement.lang =
      language.id === 'en' ? 'en' : language.id === 'ru' ? 'ru' : 'uz'
  }, [language.id])

  return (
    <div className="topbar">
      <div className="container topbar__inner">
        <Link to="/" className="topbar__logo" aria-label="SportON — bosh sahifa">
          <BrandLogo tone="onPrimary" />
        </Link>

        <div className="topbar__right">
          <NotificationBell
            ref={notifRef}
            open={openMenu === 'notif'}
            onToggle={() => setOpenMenu((current) => (current === 'notif' ? null : 'notif'))}
            onClose={closeMenus}
          />

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
            ariaLabel="Hududni tanlash"
            menuClassName="topbar-menu--regions"
            origin="start"
          >
            {REGIONS.map((item) => (
              <DropdownOption
                key={item.id}
                selected={item.id === region.id}
                onSelect={() => {
                  setRegionId(item.id)
                  closeMenus()
                }}
              >
                {item.label}
              </DropdownOption>
            ))}
          </Dropdown>

          <div className="topbar__theme" role="group" aria-label="Mavzu">
            <button
              type="button"
              className={`topbar__theme-btn ${theme === 'light' ? 'topbar__theme-btn--active' : ''}`}
              onClick={() => setTheme('light')}
              aria-label="Light mode"
              aria-pressed={theme === 'light'}
              title="Light mode"
            >
              <Sun size={16} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              className={`topbar__theme-btn ${theme === 'dark' ? 'topbar__theme-btn--active' : ''}`}
              onClick={() => setTheme('dark')}
              aria-label="Dark mode"
              aria-pressed={theme === 'dark'}
              title="Dark mode"
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
            ariaLabel="Tilni tanlash"
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

function DropdownOption({ selected, onSelect, children }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={`topbar-menu__item ${selected ? 'topbar-menu__item--selected' : ''}`}
      onClick={onSelect}
    >
      <span className="topbar-menu__label">{children}</span>
      {selected && <Check className="topbar-menu__check" size={16} strokeWidth={2.5} />}
    </button>
  )
}
