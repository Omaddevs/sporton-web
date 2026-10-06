import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import DropPanel from './DropPanel.jsx'
import './Select.css'

/**
 * Custom select — replaces native <select> with branded dropdown UI.
 * options: [{ id, label }]
 */
export default function Select({
  value,
  onChange,
  options,
  ariaLabel,
  className = '',
  size = 'md',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listRef = useRef(null)
  const menuId = useId()
  const selected = options.find((item) => item.id === value) ?? options[0]

  const close = useCallback(() => setOpen(false), [])
  const toggle = useCallback(() => setOpen((prev) => !prev), [])

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
    if (!open) return
    const active = listRef.current?.querySelector('[aria-selected="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [open])

  function handleSelect(id) {
    onChange(id)
    close()
  }

  return (
    <div
      className={[
        'ui-select',
        size === 'sm' ? 'ui-select--sm' : '',
        open ? 'ui-select--open' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      ref={rootRef}
    >
      <button
        type="button"
        className="ui-select__trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggle}
      >
        <span className="ui-select__value">{selected?.label}</span>
        <ChevronDown
          className={`ui-select__chevron ${open ? 'ui-select__chevron--open' : ''}`}
          size={size === 'sm' ? 15 : 16}
          strokeWidth={2.25}
        />
      </button>

      <DropPanel
        open={open}
        id={menuId}
        className="ui-select__menu"
        origin="start"
        role="listbox"
        aria-label={ariaLabel}
      >
        <div className="ui-select__list" ref={listRef}>
          {options.map((item) => {
            const isSelected = item.id === selected?.id
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`ui-select__option ${isSelected ? 'ui-select__option--selected' : ''}`}
                onClick={() => handleSelect(item.id)}
              >
                <span className="ui-select__option-label">{item.label}</span>
                {isSelected && (
                  <Check className="ui-select__check" size={15} strokeWidth={2.5} />
                )}
              </button>
            )
          })}
        </div>
      </DropPanel>
    </div>
  )
}
