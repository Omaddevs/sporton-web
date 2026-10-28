import { tr } from '../../i18n/index.js'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronRight, Compass, Map as MapIcon, Play } from 'lucide-react'
import { FiCalendar, FiMoreHorizontal, FiPlus, FiUser, FiX } from 'react-icons/fi'
import { exploreSections, getSectionItems } from '../../data/explore.js'
import { loadJobsMapPage } from '../../pages/jobsMapLoader.js'
import HeartIcon from '../icons/HeartIcon.jsx'
import DropPanel from '../ui/DropPanel.jsx'
import './MoreMenu.css'

const PREVIEW_COUNT = 3

// Kichik ekranlarda navbar'dan yashiriladigan havolalar
const QUICK_LINKS = [
  { to: '/saqlanganlar', label: tr('Saqlanganlar'), icon: <HeartIcon size={18} /> },
  { to: '/xarita', label: tr('Xarita'), icon: <MapIcon size={18} strokeWidth={1.8} />, preload: true },
  { to: '/bron', label: tr('Bron qilish'), icon: <FiCalendar /> },
  { to: '/profil', label: tr('Profil'), icon: <FiUser /> },
]

export default function MoreMenu({ open, onOpenChange, onAddComplex }) {
  const panelId = useId()
  const rootRef = useRef(null)
  const [activeId, setActiveId] = useState(exploreSections[0].id)

  const active = exploreSections.find((s) => s.id === activeId) ?? exploreSections[0]
  const previewItems = useMemo(() => getSectionItems(active.id).slice(0, PREVIEW_COUNT), [active.id])
  const counts = useMemo(
    () => Object.fromEntries(exploreSections.map((s) => [s.id, getSectionItems(s.id).length])),
    [],
  )

  const close = useCallback(() => onOpenChange(false), [onOpenChange])

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (rootRef.current?.contains(event.target)) return
      close()
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') close()
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  const tab = open ? 0 : -1

  return (
    <div className={`more-menu ${open ? 'more-menu--open' : ''}`} ref={rootRef}>
      <button
        type="button"
        className={`navbar__more ${open ? 'is-active' : ''}`}
        aria-label={tr('Qo\'shimcha menyu')}
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => onOpenChange(!open)}
      >
        <span className="navbar__more-icon" data-visible={!open}>
          <FiMoreHorizontal />
        </span>
        <span className="navbar__more-icon" data-visible={open}>
          <FiX />
        </span>
      </button>

      <DropPanel
        open={open}
        id={panelId}
        className="more-menu__panel"
        origin="end"
        role="dialog"
        aria-label={tr('Ko\'proq')}
      >
        <span className="more-menu__caret" aria-hidden="true" />

        <div className="more-menu__header">
          <div className="more-menu__title">
            <span className="more-menu__title-icon" aria-hidden="true">
              <Compass size={17} strokeWidth={2.4} />
            </span>
            <h2>{tr('Ko‘proq')}</h2>
          </div>
          <p className="more-menu__tagline">{tr('Yangiliklar, musobaqalar va SportON hayoti')}</p>
        </div>

        <div className="more-menu__quick" role="list">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="more-quick"
              role="listitem"
              onClick={close}
              onTouchStart={link.preload ? loadJobsMapPage : undefined}
              tabIndex={tab}
            >
              <span className="more-quick__icon" aria-hidden="true">
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            className="more-quick more-quick--primary"
            tabIndex={tab}
            onClick={() => {
              close()
              onAddComplex?.()
            }}
          >
            <span className="more-quick__icon" aria-hidden="true">
              <FiPlus />
            </span>
            {tr('Majmua qo‘shish')}
          </button>
        </div>

        <div className="more-menu__body">
          <nav className="more-menu__nav" aria-label={tr('Bo\'limlar')}>
            {exploreSections.map((section) => (
              <Link
                key={section.id}
                to={`/bolim/${section.id}`}
                className={`more-nav ${section.id === active.id ? 'is-active' : ''}`}
                onMouseEnter={() => setActiveId(section.id)}
                onFocus={() => setActiveId(section.id)}
                onClick={close}
                tabIndex={tab}
              >
                <span
                  className="more-nav__icon"
                  style={{ background: section.iconBg, color: section.iconColor }}
                  aria-hidden="true"
                >
                  <section.Icon size={18} strokeWidth={2.1} />
                </span>
                <span className="more-nav__text">
                  <span className="more-nav__name">
                    {section.title}
                    <span className="more-nav__count">{counts[section.id]}</span>
                  </span>
                  <span className="more-nav__desc">{section.description}</span>
                </span>
                <ChevronRight className="more-nav__chevron" size={15} strokeWidth={2.25} />
              </Link>
            ))}
          </nav>

          <section className="more-preview" aria-live="polite">
            <div className="more-preview__head">
              <h3>{active.title}</h3>
              <Link
                to={`/bolim/${active.id}`}
                className="more-preview__all"
                onClick={close}
                tabIndex={tab}
              >
                {tr('Barchasi')}
                <ArrowUpRight size={14} strokeWidth={2.4} />
              </Link>
            </div>

            <div className="more-preview__list" key={active.id}>
              {previewItems.map((item, index) => (
                <Link
                  key={item.id}
                  to={item.href}
                  className="more-card"
                  style={{ '--i': index }}
                  onClick={close}
                  tabIndex={tab}
                >
                  <span className="more-card__media">
                    {item.avatar ? (
                      <span
                        className="more-card__avatar"
                        style={{ background: item.avatar.gradient }}
                      >
                        {item.avatar.initials}
                      </span>
                    ) : (
                      <img src={item.image} alt="" loading="lazy" />
                    )}
                    {item.isVideo && (
                      <span className="more-card__play" aria-hidden="true">
                        <Play size={12} fill="currentColor" strokeWidth={0} />
                      </span>
                    )}
                  </span>
                  <span className="more-card__text">
                    <span className="more-card__tags">
                      <span className="more-card__tag">{tr(item.tag)}</span>
                      {item.status && (
                        <span className={`more-card__status more-card__status--${item.status.tone}`}>
                          {item.status.label}
                        </span>
                      )}
                    </span>
                    <span className="more-card__title">{item.title}</span>
                    <span className="more-card__meta">{tr(item.meta)}</span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </DropPanel>
    </div>
  )
}
