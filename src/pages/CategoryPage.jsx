import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Heart,
  MapPin,
  MessageCircle,
  Newspaper,
  Share2,
  SlidersHorizontal,
  UsersRound,
  X,
} from 'lucide-react'
import { categoryMenuById } from '../data/categoryMenu.js'
import { getCandidatesForCategory } from '../data/candidates.js'
import { getComplexesForCategory } from '../data/complexes.js'
import { getCategoryArticles } from '../data/articles.js'
import Select from '../components/ui/Select.jsx'
import CategoryComplexes from '../components/CategoryContent/CategoryComplexes.jsx'
import CategoryArticles from '../components/CategoryContent/CategoryArticles.jsx'
import { EmptyState } from '../components/CategoryContent/CategoryComplexes.jsx'
import CoachFilterPanel from '../components/CategoryContent/CoachFilters.jsx'
import {
  CLEARED_FILTERS,
  SORT_OPTIONS,
  activeFilterChips,
  filterCoaches,
  readCoachFilters,
  writeCoachFilters,
} from '../components/CategoryContent/coachFilters.js'
import './CategoryPage.css'

const TABS = [
  { id: 'majmualar', label: 'Sport majmualari', Icon: Building2 },
  { id: 'murabbiylar', label: 'Murabbiylar', Icon: UsersRound },
  { id: 'maqolalar', label: 'Yangiliklar va blog', Icon: Newspaper },
]

export default function CategoryPage() {
  const { categoryId = 'futbol' } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const category = categoryMenuById[categoryId] ?? categoryMenuById.futbol
  const candidates = useMemo(() => getCandidatesForCategory(category.id), [category.id])
  const categoryComplexes = useMemo(() => getComplexesForCategory(category.id), [category.id])
  const articles = useMemo(() => getCategoryArticles(category.id), [category.id])
  const tabRefs = useRef({})

  const tab = TABS.some((t) => t.id === searchParams.get('tab')) ? searchParams.get('tab') : TABS[0].id
  const tabCounts = {
    murabbiylar: candidates.length,
    majmualar: categoryComplexes.length,
    maqolalar: articles.length,
  }

  function selectTab(id) {
    const next = new URLSearchParams(searchParams)
    if (id === TABS[0].id) next.delete('tab')
    else next.set('tab', id)
    setSearchParams(next, { replace: true })
  }

  // WAI-ARIA tabs: chap/o‘ng, Home/End bilan tablar orasida yurish
  function handleTabKey(event) {
    const index = TABS.findIndex((t) => t.id === tab)
    const moves = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: TABS.length - 1 }
    if (!(event.key in moves)) return
    event.preventDefault()
    const target = TABS[(moves[event.key] + TABS.length) % TABS.length]
    selectTab(target.id)
    tabRefs.current[target.id]?.focus()
  }

  const [selectedId, setSelectedId] = useState(candidates[0]?.id)
  const [saved, setSaved] = useState(() => new Set())
  const [filtersOpen, setFiltersOpen] = useState(false)
  const detailRef = useRef(null)

  // Filtrlar URL’da saqlanadi — sahifani yangilash, ulashish va «orqaga» tugmasi ishlaydi
  const filters = useMemo(() => readCoachFilters(searchParams), [searchParams])
  const visible = useMemo(() => filterCoaches(candidates, filters), [candidates, filters])
  const chips = activeFilterChips(filters)

  function updateFilters(patch) {
    setSearchParams((prev) => writeCoachFilters(prev, patch), { replace: true })
  }

  const closeFilters = useCallback(() => setFiltersOpen(false), [])

  // Kategoriya almashganda birinchi elementni tanlaymiz (render paytida — effekt kerak emas)
  const [prevCandidates, setPrevCandidates] = useState(candidates)
  if (prevCandidates !== candidates) {
    setPrevCandidates(candidates)
    setSelectedId(candidates[0]?.id)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [candidates])

  // Tanlangan murabbiy filtrdan chiqib ketsa — birinchi mosini ko‘rsatamiz
  const selected = visible.find((item) => item.id === selectedId) ?? visible[0]
  const Icon = category.Icon

  function toggleSaved(id) {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearFilters() {
    updateFilters(CLEARED_FILTERS)
  }

  // Tor ekranda batafsil panel ro‘yxat ostida — tanlanganda unga o‘tamiz
  function showDetail(id) {
    setSelectedId(id)
    if (window.matchMedia('(max-width: 1199px)').matches) {
      requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
  }

  return (
    <div className="category-page">
      <div className="container">
        <header className="cat-header">
          <nav className="cat-results__crumbs" aria-label="Breadcrumb">
            <Link to="/">Bosh sahifa</Link>
            <span aria-hidden="true">/</span>
            <Link to="/sport-turlari">Sport turlari</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{category.title}</span>
          </nav>

          <div className="cat-results__title">
            <Link to="/sport-turlari" className="cat-header__back" aria-label="Sport turlariga qaytish">
              <ArrowLeft size={20} strokeWidth={2.2} />
            </Link>
            <span
              className="cat-results__icon"
              style={{ background: category.iconBg, color: category.iconColor }}
            >
              <Icon size={22} strokeWidth={2} />
            </span>
            <div>
              <h1>{category.title}</h1>
              <p>«{category.title}» bo‘yicha murabbiylar, sport majmualari, yangiliklar va foydali maqolalar</p>
            </div>
          </div>

          <div className="cat-tabs" role="tablist" aria-label={`${category.title} bo‘limlari`}>
            {TABS.map(({ id, label, Icon: TabIcon }) => {
              const active = tab === id
              return (
                <button
                  key={id}
                  ref={(el) => {
                    tabRefs.current[id] = el
                  }}
                  type="button"
                  role="tab"
                  id={`cat-tab-${id}`}
                  aria-selected={active}
                  aria-controls={`cat-panel-${id}`}
                  tabIndex={active ? 0 : -1}
                  className={`cat-tab ${active ? 'is-active' : ''}`}
                  onClick={() => selectTab(id)}
                  onKeyDown={handleTabKey}
                >
                  <TabIcon size={17} />
                  {label}
                  <span className="cat-tab__count">{tabCounts[id]}</span>
                </button>
              )
            })}
          </div>
        </header>

        <div role="tabpanel" id={`cat-panel-${tab}`} aria-labelledby={`cat-tab-${tab}`}>
          {tab === 'majmualar' && (
            <CategoryComplexes key={category.id} category={category} items={categoryComplexes} />
          )}

          {tab === 'maqolalar' && (
            <CategoryArticles key={category.id} category={category} items={articles} />
          )}

          {tab === 'murabbiylar' && (
            <div className="category-page__inner">
              <CoachFilterPanel
                filters={filters}
                onChange={updateFilters}
                onClear={clearFilters}
                activeCount={chips.length}
                resultCount={visible.length}
                open={filtersOpen}
                onClose={closeFilters}
              />

              <section className="cat-results">
                <div className="cat-results__head">
                  <p className="cat-results__found" aria-live="polite">
                    <strong>{visible.length}</strong> ta murabbiy topildi
                  </p>

                  <div className="cat-results__meta">
                    <button
                      type="button"
                      className={`cat-filter-toggle ${chips.length ? 'is-active' : ''}`}
                      onClick={() => setFiltersOpen(true)}
                      aria-controls="cat-filters"
                      aria-expanded={filtersOpen}
                    >
                      <SlidersHorizontal size={16} strokeWidth={2.2} />
                      Filtrlar
                      {chips.length > 0 && <span className="cat-filter-toggle__count">{chips.length}</span>}
                    </button>
                    <Select
                      value={filters.sort}
                      onChange={(sort) => updateFilters({ sort })}
                      options={SORT_OPTIONS}
                      ariaLabel="Saralash"
                      size="sm"
                    />
                  </div>
                </div>

                {chips.length > 0 && (
                  <div className="cat-active-filters" aria-label="Faol filtrlar">
                    {chips.map((chip) => (
                      <button
                        key={chip.key}
                        type="button"
                        className="cat-active-chip"
                        onClick={() => updateFilters(chip.patch)}
                        aria-label={`Filtrni olib tashlash: ${chip.label}`}
                      >
                        {chip.label}
                        <X size={13} strokeWidth={2.6} />
                      </button>
                    ))}
                    <button type="button" className="cat-active-chip cat-active-chip--clear" onClick={clearFilters}>
                      Barchasini tozalash
                    </button>
                  </div>
                )}

                {visible.length === 0 && (
                  <EmptyState
                    Icon={UsersRound}
                    title="Mos murabbiy topilmadi"
                    text="Tanlangan filtrlarga mos murabbiy yo‘q. Ba’zi filtrlarni olib tashlab ko‘ring."
                    action={
                      <button type="button" className="cc-btn cc-btn--primary" onClick={clearFilters}>
                        Filtrlarni tozalash
                      </button>
                    }
                  />
                )}

                <div className="cat-results__list">
                  {visible.map((person) => (
                    <article
                      key={person.id}
                      className={`cand-card ${selected?.id === person.id ? 'cand-card--active' : ''} ${
                        person.premium ? 'cand-card--premium' : ''
                      }`}
                      onClick={() => showDetail(person.id)}
                    >
                      <img className="cand-card__avatar" src={person.avatar} alt="" />
                      <div className="cand-card__body">
                        <div className="cand-card__top">
                          <div>
                            <div className="cand-card__name-row">
                              <h3>{person.name}</h3>
                              {person.premium && <span className="cand-card__badge">Premium</span>}
                              {person.online && <span className="cand-card__online" title="Online" />}
                            </div>
                            <p className="cand-card__role">{person.title}</p>
                          </div>
                        </div>

                        <div className="cand-card__facts">
                          <span>
                            <MapPin size={14} />
                            {person.location}
                          </span>
                          <span>
                            <Briefcase size={14} />
                            {person.experience}
                          </span>
                          <span>{person.salary}</span>
                        </div>

                        <div className="cand-card__skills">
                          {person.skills.map((skill) => (
                            <span key={skill}>{skill}</span>
                          ))}
                        </div>
                      </div>

                      <div className="cand-card__actions">
                        <button
                          type="button"
                          className="cand-card__detail"
                          onClick={(e) => {
                            e.stopPropagation()
                            showDetail(person.id)
                          }}
                        >
                          Batafsil
                          <ArrowRight size={15} />
                        </button>
                        <button
                          type="button"
                          className={`cand-card__heart ${saved.has(person.id) ? 'is-active' : ''}`}
                          aria-label="Saqlash"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSaved(person.id)
                          }}
                        >
                          <Heart size={17} fill={saved.has(person.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {selected && (
                <aside className="cat-detail" ref={detailRef}>
                  <div className="cat-detail__toolbar">
                    <button type="button" aria-label="Ulashish">
                      <Share2 size={17} />
                    </button>
                    <button
                      type="button"
                      aria-label="Saqlash"
                      className={saved.has(selected.id) ? 'is-active' : ''}
                      onClick={() => toggleSaved(selected.id)}
                    >
                      <Heart size={17} fill={saved.has(selected.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="cat-detail__hero">
                    <img src={selected.avatar} alt="" className="cat-detail__avatar" />
                    <div>
                      <div className="cand-card__name-row">
                        <h2>{selected.name}</h2>
                        {selected.online && <span className="cand-card__online" title="Online" />}
                      </div>
                      <p className="cat-detail__role">{selected.title}</p>
                      <div className="cand-card__facts">
                        <span>
                          <MapPin size={14} />
                          {selected.district}
                        </span>
                        <span>
                          <Briefcase size={14} />
                          {selected.experience}
                        </span>
                        <span>{selected.salary}</span>
                      </div>
                    </div>
                  </div>

                  <section className="cat-detail__block">
                    <h3>Murabbiy haqida</h3>
                    <p>{selected.about}</p>
                  </section>

                  <section className="cat-detail__block">
                    <h3>Mutaxassislik</h3>
                    <div className="cand-card__skills">
                      {selected.skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                    </div>
                  </section>

                  <section className="cat-detail__block">
                    <h3>Ta’lim va unvonlar</h3>
                    {selected.education.map((item) => (
                      <div key={item.school} className="cat-detail__edu">
                        <strong>{item.school}</strong>
                        <span>{item.years}</span>
                        <p>{item.degree}</p>
                      </div>
                    ))}
                  </section>

                  <section className="cat-detail__block">
                    <h3>Murabbiylik tajribasi</h3>
                    {selected.work.map((item) => (
                      <div key={`${item.company}-${item.role}`} className="cat-detail__job">
                        <div className="cat-detail__job-head">
                          <strong>{item.role}</strong>
                          <span>{item.years}</span>
                        </div>
                        <p className="cat-detail__company">{item.company}</p>
                        <ul>
                          {item.points.map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </section>

                  <div className="cat-detail__cta">
                    <Link
                      to={`/xabarlar?candidate=${selected.id}`}
                      className="cat-detail__contact"
                    >
                      <MessageCircle size={17} />
                      Mashg‘ulotga yozilish
                    </Link>
                    <button
                      type="button"
                      className={`cat-detail__save ${saved.has(selected.id) ? 'is-active' : ''}`}
                      onClick={() => toggleSaved(selected.id)}
                    >
                      <Heart size={17} fill={saved.has(selected.id) ? 'currentColor' : 'none'} />
                      Saqlash
                    </button>
                  </div>

                  <button type="button" className="cat-detail__back" onClick={() => navigate('/')}>
                    Bosh sahifaga qaytish
                  </button>
                </aside>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
