import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Check, Gift, MonitorPlay, RotateCcw, ShieldCheck, Star } from 'lucide-react'
import ComplexCard from '../SportComplexes/ComplexCard.jsx'
import Select from '../ui/Select.jsx'
import './CategoryContent.css'

const QUICK_FILTERS = [
  { id: 'verified', label: 'Tasdiqlangan', Icon: ShieldCheck, test: (c) => c.verified },
  { id: 'trial', label: 'Bepul sinov darsi', Icon: Gift, test: (c) => c.hasTrial },
  { id: 'online', label: 'Onlayn mashg‘ulot', Icon: MonitorPlay, test: (c) => c.hasOnline },
  { id: 'top', label: 'Reyting 4.7+', Icon: Star, test: (c) => c.rating >= 4.7 },
]

const SORT_OPTIONS = [
  { id: 'rating', label: 'Reyting bo‘yicha' },
  { id: 'price-asc', label: 'Avval arzonlari' },
  { id: 'price-desc', label: 'Avval qimmatlari' },
  { id: 'popular', label: 'Ommabop' },
]

const SORTERS = {
  rating: (a, b) => b.rating - a.rating,
  'price-asc': (a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity),
  'price-desc': (a, b) => (b.minPrice ?? 0) - (a.minPrice ?? 0),
  popular: (a, b) => b.views - a.views,
}

export default function CategoryComplexes({ category, items }) {
  const [active, setActive] = useState(() => new Set())
  const [sortBy, setSortBy] = useState('rating')

  const visible = useMemo(() => {
    const tests = QUICK_FILTERS.filter((f) => active.has(f.id)).map((f) => f.test)
    return items.filter((c) => tests.every((test) => test(c))).sort(SORTERS[sortBy])
  }, [items, active, sortBy])

  function toggle(id) {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Hozircha majmualar yo‘q"
        text={`«${category.title}» bo‘yicha sport majmualari tez orada qo‘shiladi. Boshqa sport turlarini ko‘rib chiqing.`}
        action={<Link to="/sport-turlari" className="cc-btn cc-btn--primary">Sport turlari</Link>}
      />
    )
  }

  return (
    <section className="cc-panel" aria-label="Sport majmualari">
      <div className="cc-toolbar">
        <div className="cc-toolbar__info">
          <h2>«{category.title}» bo‘yicha sport majmualari</h2>
          <p>
            <strong>{visible.length}</strong> ta majmua topildi
          </p>
        </div>
        <Select value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} ariaLabel="Saralash" size="sm" />
      </div>

      <div className="cc-chips" role="group" aria-label="Tezkor filtrlar">
        {QUICK_FILTERS.map(({ id, label, Icon }) => {
          const on = active.has(id)
          return (
            <button
              key={id}
              type="button"
              className={`cc-chip ${on ? 'is-active' : ''}`}
              aria-pressed={on}
              onClick={() => toggle(id)}
            >
              {on ? <Check size={14} strokeWidth={2.6} /> : <Icon size={14} />}
              {label}
            </button>
          )
        })}
        {active.size > 0 && (
          <button type="button" className="cc-chip cc-chip--ghost" onClick={() => setActive(new Set())}>
            <RotateCcw size={13} />
            Tozalash
          </button>
        )}
      </div>

      {visible.length > 0 ? (
        <div className="cc-complex-grid">
          {visible.map((complex) => (
            <ComplexCard key={complex.id} complex={complex} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Mos majmua topilmadi"
          text="Tanlangan filtrlarga mos keladigan majmua yo‘q. Filtrlarni o‘zgartirib ko‘ring."
          action={
            <button type="button" className="cc-btn cc-btn--primary" onClick={() => setActive(new Set())}>
              Filtrlarni tozalash
            </button>
          }
        />
      )}
    </section>
  )
}

export function EmptyState({ title, text, action, Icon = Building2 }) {
  return (
    <div className="cc-empty" role="status">
      <span className="cc-empty__icon" aria-hidden="true">
        <Icon size={26} />
      </span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  )
}
