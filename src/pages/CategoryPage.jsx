import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Building2,
  Heart,
  MapPin,
  MessageCircle,
  Newspaper,
  RotateCcw,
  Share2,
  UsersRound,
} from 'lucide-react'
import { categoryMenuById } from '../data/categoryMenu.js'
import { getCandidatesForCategory } from '../data/candidates.js'
import { getComplexesForCategory } from '../data/complexes.js'
import { getCategoryArticles } from '../data/articles.js'
import { REGIONS } from '../data/regions.js'
import Select from '../components/ui/Select.jsx'
import CategoryComplexes from '../components/CategoryContent/CategoryComplexes.jsx'
import CategoryArticles from '../components/CategoryContent/CategoryArticles.jsx'
import './CategoryPage.css'

const JOB_TYPES = [
  { id: 'full', label: 'Yakka mashg‘ulot' },
  { id: 'part', label: 'Guruh mashg‘uloti' },
  { id: 'remote', label: 'Onlayn' },
  { id: 'intern', label: 'Bolalar uchun' },
]

const FIELDS = [
  { id: 'beginner', label: 'Boshlang‘ichlar uchun' },
  { id: 'competition', label: 'Musobaqaga tayyorlov' },
  { id: 'weight', label: 'Ozish va forma' },
  { id: 'rehab', label: 'Reabilitatsiya' },
  { id: 'kids', label: 'Bolalar bilan ishlash' },
]

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Tavsiya etilgan' },
  { id: 'newest', label: 'Eng yangi' },
  { id: 'salary', label: 'Narx bo‘yicha' },
]

const SALARY_OPTIONS = [
  { id: 'all', label: 'Barchasi' },
  { id: '100', label: '100 ming gacha' },
  { id: '100-150', label: '100–150 ming' },
  { id: '150-200', label: '150–200 ming' },
  { id: '200', label: '200 ming+' },
]

const EXPERIENCE_OPTIONS = [
  { id: 'all', label: 'Barchasi' },
  { id: '0', label: 'Tajribasiz' },
  { id: '1', label: '1–2 yil' },
  { id: '3', label: '3–5 yil' },
  { id: '5', label: '5+ yil' },
]

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
  const coachCount = candidates.length * 6 + 4
  const tabCounts = {
    murabbiylar: coachCount,
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
  const [region, setRegion] = useState('toshkent-shahar')
  const [jobTypes, setJobTypes] = useState(() => new Set(['full']))
  const [fields, setFields] = useState(() => new Set())
  const [salary, setSalary] = useState('all')
  const [experience, setExperience] = useState('all')
  const [sortBy, setSortBy] = useState('recommended')

  // Kategoriya almashganda birinchi elementni tanlaymiz (render paytida — effekt kerak emas)
  const [prevCandidates, setPrevCandidates] = useState(candidates)
  if (prevCandidates !== candidates) {
    setPrevCandidates(candidates)
    setSelectedId(candidates[0]?.id)
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [candidates])

  const selected = candidates.find((item) => item.id === selectedId) ?? candidates[0]
  const Icon = category.Icon

  function toggleSet(setter, id) {
    setter((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSaved(id) {
    setSaved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearFilters() {
    setRegion('all')
    setJobTypes(new Set())
    setFields(new Set())
    setSalary('all')
    setExperience('all')
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
              <aside className="cat-filters">
                <FilterGroup title="Viloyat / Shahar">
                  <Select
                    value={region}
                    onChange={setRegion}
                    options={REGIONS}
                    ariaLabel="Viloyat / Shahar"
                  />
                </FilterGroup>

                <FilterGroup title="Mashg&apos;ulot turi">
                  <div className="cat-checks">
                    {JOB_TYPES.map((item) => (
                      <label key={item.id} className="cat-check">
                        <input
                          type="checkbox"
                          checked={jobTypes.has(item.id)}
                          onChange={() => toggleSet(setJobTypes, item.id)}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup title="Narx (bir dars)">
                  <Select
                    value={salary}
                    onChange={setSalary}
                    options={SALARY_OPTIONS}
                    ariaLabel="Narx"
                  />
                </FilterGroup>

                <FilterGroup title="Tajriba">
                  <Select
                    value={experience}
                    onChange={setExperience}
                    options={EXPERIENCE_OPTIONS}
                    ariaLabel="Tajriba"
                  />
                </FilterGroup>

                <FilterGroup title="Mutaxassislik">
                  <div className="cat-checks">
                    {FIELDS.map((item) => (
                      <label key={item.id} className="cat-check">
                        <input
                          type="checkbox"
                          checked={fields.has(item.id)}
                          onChange={() => toggleSet(setFields, item.id)}
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                <button type="button" className="cat-filters__apply">
                  Qidiruvni qo‘llash
                </button>
                <button type="button" className="cat-filters__clear" onClick={clearFilters}>
                  <RotateCcw size={14} />
                  Filtrlarni tozalash
                </button>
              </aside>

              <section className="cat-results">
                <div className="cat-results__head">
                  <p className="cat-results__found">
                    <strong>{coachCount}</strong> ta murabbiy topildi
                  </p>

                  <div className="cat-results__meta">
                    <Select
                      value={sortBy}
                      onChange={setSortBy}
                      options={SORT_OPTIONS}
                      ariaLabel="Saralash"
                      size="sm"
                    />
                  </div>
                </div>

                <div className="cat-results__list">
                  {candidates.map((person) => (
                    <article
                      key={person.id}
                      className={`cand-card ${selected?.id === person.id ? 'cand-card--active' : ''} ${
                        person.premium ? 'cand-card--premium' : ''
                      }`}
                      onClick={() => setSelectedId(person.id)}
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
                            setSelectedId(person.id)
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
                <aside className="cat-detail">
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

function FilterGroup({ title, children }) {
  return (
    <div className="cat-filters__group">
      <h3>{title}</h3>
      {children}
    </div>
  )
}
