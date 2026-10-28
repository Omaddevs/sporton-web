import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Clock3, LayoutGrid, X } from 'lucide-react'
import { categoryMenuById, categoryMenuItems } from '../../data/categoryMenu.js'
import DropPanel from '../ui/DropPanel.jsx'
import useMediaQuery from '../../hooks/useMediaQuery.js'
import './CategoriesMenu.css'
import { tr } from '../../i18n/index.js'

const RECENT_KEY = 'sporton-recent-categories'
const MAX_RECENT = 3

const DEFAULT_RECENT = [
  { id: 'futbol', viewedAt: Date.now() - 5 * 60 * 1000 },
  { id: 'suzish', viewedAt: Date.now() - 60 * 60 * 1000 },
  { id: 'tennis', viewedAt: Date.now() - 24 * 60 * 60 * 1000 },
]

function readRecent() {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    if (raw === null) return DEFAULT_RECENT
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : DEFAULT_RECENT
  } catch {
    return DEFAULT_RECENT
  }
}

function formatRelativeTime(timestamp) {
  const diffMs = Date.now() - timestamp
  const minutes = Math.max(1, Math.floor(diffMs / 60000))
  if (minutes < 60) return tr('{n} daqiqa oldin', { n: minutes })
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return tr('{n} soat oldin', { n: hours })
  const days = Math.floor(hours / 24)
  if (days === 1) return tr('Kecha')
  return tr('{n} kun oldin', { n: days })
}

export default function CategoriesMenu({ open, onOpenChange, trigger }) {
  const panelId = useId()
  const rootRef = useRef(null)
  const [recent, setRecent] = useState(() =>
    typeof window === 'undefined' ? DEFAULT_RECENT : readRecent(),
  )

  const recentItems = useMemo(
    () =>
      recent
        .map((entry) => {
          const item = categoryMenuById[entry.id]
          if (!item) return null
          return { ...item, viewedAt: entry.viewedAt }
        })
        .filter(Boolean),
    [recent],
  )

  // Mobilda panel bottom sheet bo‘lib ochiladi — orqadagi sahifa scroll bo‘lmasin
  const isSheet = useMediaQuery('(max-width: 639px)')

  const close = useCallback(() => onOpenChange(false), [onOpenChange])
  const toggle = useCallback(() => onOpenChange(!open), [onOpenChange, open])

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

  useEffect(() => {
    if (!open || !isSheet) return undefined
    const root = document.documentElement
    root.classList.add('categories-sheet-open')
    return () => root.classList.remove('categories-sheet-open')
  }, [open, isSheet])

  function rememberCategory(id) {
    setRecent((prev) => {
      const next = [{ id, viewedAt: Date.now() }, ...prev.filter((item) => item.id !== id)].slice(
        0,
        MAX_RECENT,
      )
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  function clearRecent() {
    setRecent([])
    try {
      window.localStorage.setItem(RECENT_KEY, '[]')
    } catch {
      /* ignore */
    }
  }

  function handleSelect(id) {
    rememberCategory(id)
    close()
  }

  return (
    <div className={`categories-menu ${open ? 'categories-menu--open' : ''}`} ref={rootRef}>
      {trigger({
        open,
        panelId,
        toggle,
        buttonProps: {
          'aria-expanded': open,
          'aria-controls': panelId,
          'aria-haspopup': 'dialog',
          onClick: toggle,
          className: open ? 'navbar__categories is-active' : 'navbar__categories',
        },
      })}

      <div className="categories-menu__backdrop" onClick={close} aria-hidden="true" />

      <DropPanel
        open={open}
        id={panelId}
        className="categories-menu__panel"
        origin="start"
        role="dialog"
        aria-label={tr('Sport turlari')}
      >
        <span className="categories-menu__caret" aria-hidden="true" />
        <span className="categories-menu__handle" aria-hidden="true" />

        <div className="categories-menu__header">
          <div className="categories-menu__title">
            <span className="categories-menu__title-icon" aria-hidden="true">
              <LayoutGrid size={17} strokeWidth={2.4} />
            </span>
            <h2>{tr('Sport turlari')}</h2>
          </div>
          <button
            type="button"
            className="categories-menu__close"
            onClick={close}
            aria-label={tr('Yopish')}
            tabIndex={open ? 0 : -1}
          >
            <X size={18} strokeWidth={2.4} />
          </button>
          <p className="categories-menu__tagline">
            {tr('Majmualar, mashg‘ulotlar va murabbiylar — bir joyda!')}
          </p>
        </div>

        <div className="categories-menu__body">
          <div className="categories-menu__grid" role="list">
            {categoryMenuItems.map((item) => (
              <Link
                key={item.id}
                to={`/sport/${item.id}`}
                className="cat-item"
                role="listitem"
                onClick={() => handleSelect(item.id)}
                tabIndex={open ? 0 : -1}
              >
                <span
                  className="cat-item__icon"
                  style={{ background: item.iconBg, color: item.iconColor }}
                  aria-hidden="true"
                >
                  <item.Icon size={18} strokeWidth={2.1} />
                </span>
                <span className="cat-item__text">
                  <span className="cat-item__name">{item.title}</span>
                  <span className="cat-item__count">{item.count} {tr('ta joy')}</span>
                </span>
                <ChevronRight className="cat-item__chevron" size={15} strokeWidth={2.25} />
              </Link>
            ))}
          </div>

          <aside className="categories-menu__side">
            <Link
              to="/sport-turlari"
              className="cat-all"
              onClick={close}
              tabIndex={open ? 0 : -1}
            >
              <span className="cat-all__icon" aria-hidden="true">
                <LayoutGrid size={18} strokeWidth={2.4} />
              </span>
              <span className="cat-all__text">
                <span className="cat-all__title">{tr('Barcha sport turlari')}</span>
                <span className="cat-all__sub">
                  {tr('Hammasini ko‘rish')}
                  <ChevronRight size={13} strokeWidth={2.5} />
                </span>
              </span>
            </Link>

            <div className="cat-recent">
              <div className="cat-recent__head">
                <h3>
                  <Clock3 size={14} strokeWidth={2.4} />
                  {tr('Yaqinda ko‘rilgan')}
                </h3>
                {recentItems.length > 0 && (
                  <button
                    type="button"
                    className="cat-recent__clear"
                    onClick={clearRecent}
                    tabIndex={open ? 0 : -1}
                  >
                    {tr('Barchasini tozalash')}
                  </button>
                )}
              </div>

              {recentItems.length === 0 ? (
                <p className="cat-recent__empty">{tr('Hali ko‘rilgan sport turi yo‘q')}</p>
              ) : (
                <div className="cat-recent__list">
                  {recentItems.map((item) => (
                    <Link
                      key={item.id}
                      to={`/sport/${item.id}`}
                      className="cat-recent__item"
                      onClick={() => handleSelect(item.id)}
                      tabIndex={open ? 0 : -1}
                    >
                      <span
                        className="cat-item__icon cat-item__icon--sm"
                        style={{ background: item.iconBg, color: item.iconColor }}
                        aria-hidden="true"
                      >
                        <item.Icon size={14} strokeWidth={2.1} />
                      </span>
                      <span className="cat-recent__text">
                        <span className="cat-recent__name">{item.title}</span>
                        <span className="cat-recent__time">
                          {formatRelativeTime(item.viewedAt)}
                        </span>
                      </span>
                      <ChevronRight className="cat-item__chevron" size={14} strokeWidth={2.25} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </DropPanel>
    </div>
  )
}
