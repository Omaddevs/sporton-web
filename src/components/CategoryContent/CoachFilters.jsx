import { useEffect } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import { REGIONS } from '../../data/regions.js'
import Select from '../ui/Select.jsx'
import { EXPERIENCE_OPTIONS, PRICE_OPTIONS, SPECIALTIES, TRAINING_TYPES } from './coachFilters.js'
import { tr } from '../../i18n/index.js'

const toggle = (list, id) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

/**
 * Desktop’da yon panel (o‘zgarish darhol qo‘llanadi), ≤899px da bottom sheet:
 * natijalar soni pastdagi tugmada ko‘rinib turadi.
 */
export default function CoachFilterPanel({ filters, onChange, onClear, activeCount, resultCount, open, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const root = document.documentElement
    root.classList.add('cat-filters-open')
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      root.classList.remove('cat-filters-open')
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <>
      <div className={`cat-filters-backdrop ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`cat-filters ${open ? 'is-open' : ''}`} aria-label={tr('Filtrlar')} id="cat-filters">
        <div className="cat-filters__sheet-head">
          <span className="cat-filters__handle" aria-hidden="true" />
          <h2>{tr('Filtrlar')}</h2>
          <button type="button" className="cat-filters__close" onClick={onClose} aria-label={tr('Yopish')}>
            <X size={18} strokeWidth={2.4} />
          </button>
        </div>

        <div className="cat-filters__body">
          <FilterGroup title={tr('Viloyat / Shahar')}>
            <Select
              value={filters.region}
              onChange={(region) => onChange({ region })}
              options={REGIONS}
              ariaLabel={tr('Viloyat / Shahar')}
            />
          </FilterGroup>

          <FilterGroup title={tr('Mashg‘ulot turi')}>
            <CheckList
              options={TRAINING_TYPES}
              values={filters.types}
              onToggle={(id) => onChange({ types: toggle(filters.types, id) })}
            />
          </FilterGroup>

          <FilterGroup title={tr('Narx (bir dars)')}>
            <PillGroup
              label={tr('Narx')}
              options={PRICE_OPTIONS}
              value={filters.price}
              onSelect={(price) => onChange({ price })}
            />
          </FilterGroup>

          <FilterGroup title={tr('Tajriba')}>
            <PillGroup
              label={tr('Tajriba')}
              options={EXPERIENCE_OPTIONS}
              value={filters.experience}
              onSelect={(experience) => onChange({ experience })}
            />
          </FilterGroup>

          <FilterGroup title={tr('Mutaxassislik')}>
            <CheckList
              options={SPECIALTIES}
              values={filters.specialties}
              onToggle={(id) => onChange({ specialties: toggle(filters.specialties, id) })}
            />
          </FilterGroup>
        </div>

        <div className="cat-filters__footer">
          <button type="button" className="cat-filters__clear" onClick={onClear} disabled={activeCount === 0}>
            <RotateCcw size={14} />
            {tr('Tozalash')}
          </button>
          <button type="button" className="cat-filters__apply" onClick={onClose}>
            {resultCount > 0 ? tr('{n} ta murabbiyni ko‘rsatish', { n: resultCount }) : tr('Natija topilmadi')}
          </button>
        </div>
      </aside>
    </>
  )
}

function FilterGroup({ title, children }) {
  return (
    <fieldset className="cat-filters__group">
      <legend>{title}</legend>
      {children}
    </fieldset>
  )
}

function CheckList({ options, values, onToggle }) {
  return (
    <div className="cat-checks">
      {options.map((item) => {
        const checked = values.includes(item.id)
        return (
          <label key={item.id} className={`cat-check ${checked ? 'is-checked' : ''}`}>
            <input type="checkbox" checked={checked} onChange={() => onToggle(item.id)} />
            <span className="cat-check__box" aria-hidden="true">
              <Check size={12} strokeWidth={3.2} />
            </span>
            <span>{item.label}</span>
          </label>
        )
      })}
    </div>
  )
}

function PillGroup({ label, options, value, onSelect }) {
  return (
    <div className="cat-pills" role="group" aria-label={label}>
      {options.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            className={`cat-pill ${active ? 'is-active' : ''}`}
            onClick={() => onSelect(item.id)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
