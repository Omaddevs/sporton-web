import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  CalendarCheck,
  Check,
  Clock3,
  Eye,
  Heart,
  MapPin,
  Search,
  Share2,
} from 'lucide-react'
import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiHeart,
  FiTrendingUp,
} from 'react-icons/fi'
import Select from '../components/ui/Select.jsx'
import { jobs } from '../data/jobs.js'
import { companies } from '../data/companies.js'
import { toggleSaved, useSavedList } from '../hooks/useSaved.js'
import { sharePage } from '../utils/share.js'
import './SavedPage.css'
import { tr } from '../i18n/index.js'

const TABS = [
  { id: 'jobs', label: tr('Bo‘sh joylar'), icon: CalendarCheck },
  { id: 'companies', label: tr('Majmualar'), icon: Building2 },
]

const SORT_OPTIONS = [
  { id: 'newest', label: tr('Eng yangi') },
  { id: 'oldest', label: tr('Eng eski') },
  { id: 'views', label: tr('Ko\'p ko\'rilgan') },
  { id: 'az', label: 'A–Z' },
]


function VerifiedBadge() {
  return (
    <span className="saved-verified" title={tr('Tasdiqlangan')} aria-label={tr('Tasdiqlangan')}>
      <Check size={9} strokeWidth={3.5} />
    </span>
  )
}

function LogoMark({ src, name, color, size = 52 }) {
  const initial = name?.charAt(0) || '?'
  return (
    <span
      className="saved-logo"
      style={{
        width: size,
        height: size,
        ...(src ? undefined : { background: color || 'var(--color-primary)', color: '#fff' }),
      }}
    >
      {src ? <img src={src} alt="" width={size} height={size} /> : initial}
    </span>
  )
}

function formatViews(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return String(n)
}

export default function SavedPage() {
  const [tab, setTab] = useState('jobs')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const savedJobList = useSavedList('jobs')
  const savedCompanyList = useSavedList('companies')
  const savedJobs = useMemo(() => new Set(savedJobList), [savedJobList])
  const savedCompanies = useMemo(() => new Set(savedCompanyList), [savedCompanyList])

  const counts = {
    jobs: savedJobs.size,
    companies: savedCompanies.size,
  }

  const jobItems = useMemo(() => {
    let list = jobs.filter((j) => savedJobs.has(j.id))
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q),
      )
    }
    return sortItems(list, sort, (j) => j.title, (j) => j.views ?? 0, (j) => j.id)
  }, [savedJobs, query, sort])

  const companyItems = useMemo(() => {
    let list = companies.filter((c) => savedCompanies.has(c.id))
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((c) => c.name.toLowerCase().includes(q))
    }
    return sortItems(list, sort, (c) => c.name, (c) => c.adsCount ?? 0, (c) => c.id)
  }, [savedCompanies, query, sort])

  function unsaveJob(id) {
    toggleSaved('jobs', id)
  }

  function unsaveCompany(id) {
    toggleSaved('companies', id)
  }

  const emptyCopy = {
    jobs: {
      title: tr('Saqlangan joylar yo\'q'),
      text: tr('Yoqtirgan maydon va zallaringizni yurakcha orqali saqlang — ular shu yerda paydo bo\'ladi.'),
      cta: tr('Bo\'sh joylarni ko\'rish'),
      to: '/#majmualar',
    },
    companies: {
      title: tr('Saqlangan majmualar yo\'q'),
      text: tr('Sevimli majmualaringizni saqlang va bo\'sh vaqtlarini kuzatib boring.'),
      cta: tr('Majmualarni ko\'rish'),
      to: '/#majmualar',
    },
  }

  const activeList = tab === 'jobs' ? jobItems : companyItems
  const empty = emptyCopy[tab]

  return (
    <section className="saved-page">
      <div className="container saved-page__inner">
        <header className="saved-hero">
          <div className="saved-hero__copy">
            <h1 className="saved-hero__title">
              <span className="saved-hero__icon" aria-hidden="true">
                <Heart size={28} fill="currentColor" strokeWidth={0} />
              </span>
              {tr('Saqlanganlar')}
            </h1>
            <p className="saved-hero__sub">
              {tr('Yoqtirgan maydon va majmualaringiz — barchasi bir joyda.')}
            </p>
          </div>
        </header>

        <div className="saved-tabs" role="tablist" aria-label={tr('Saqlanganlar bo\'limi')}>
          {TABS.map((item) => {
            const Icon = item.icon
            const active = tab === item.id
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`saved-tab ${active ? 'saved-tab--active' : ''}`}
                onClick={() => {
                  setTab(item.id)
                  setQuery('')
                }}
              >
                <Icon size={16} strokeWidth={2.25} aria-hidden />
                <span>{item.label}</span>
                <em className="saved-tab__count">{counts[item.id]}</em>
              </button>
            )
          })}
        </div>

        <div className="saved-toolbar">
          <label className="saved-search">
            <Search size={17} strokeWidth={2.25} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === 'jobs'
                  ? tr('Saqlangan joylar ichidan qidirish...')
                  : tr('Majmua nomi bo‘yicha qidirish...')
              }
              aria-label={tr('Saqlanganlar ichidan qidirish')}
            />
          </label>

          <div className="saved-sort">
            <span className="saved-sort__label">{tr('Saralash')}</span>
            <Select
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
              ariaLabel={tr('Saralash')}
              size="sm"
              className="saved-sort__select"
            />
          </div>
        </div>

        {activeList.length === 0 ? (
          <div className="saved-empty">
            <span className="saved-empty__icon" aria-hidden="true">
              <FiHeart />
            </span>
            <h2 className="saved-empty__title">{empty.title}</h2>
            <p className="saved-empty__text">{empty.text}</p>
            <Link to={empty.to} className="saved-empty__cta">
              {empty.cta}
              <FiArrowRight />
            </Link>
          </div>
        ) : (
          <ul className="saved-list" role="list">
            {tab === 'jobs' &&
              jobItems.map((job, index) => (
                <li key={job.id} style={{ '--i': index }}>
                  <SavedJobCard job={job} onUnsave={() => unsaveJob(job.id)} />
                </li>
              ))}
            {tab === 'companies' &&
              companyItems.map((company, index) => (
                <li key={company.id} style={{ '--i': index }}>
                  <SavedCompanyCard
                    company={company}
                    onUnsave={() => unsaveCompany(company.id)}
                  />
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function ShareButton({ title, path }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    if ((await sharePage({ title, url: `${window.location.origin}${path}` })) !== 'copied') return
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <button type="button" className="saved-card__more" aria-label={tr('Ulashish')} onClick={share}>
      {copied ? <FiCheck /> : <Share2 size={17} strokeWidth={2.25} />}
    </button>
  )
}

function sortItems(list, sort, getName, getViews, getId) {
  const next = [...list]
  if (sort === 'az') {
    next.sort((a, b) => getName(a).localeCompare(getName(b), 'uz'))
  } else if (sort === 'views') {
    next.sort((a, b) => getViews(b) - getViews(a))
  } else if (sort === 'oldest') {
    next.sort((a, b) => String(getId(a)).localeCompare(String(getId(b))))
  } else {
    next.sort((a, b) => String(getId(b)).localeCompare(String(getId(a))))
  }
  return next
}

function SavedJobCard({ job, onUnsave }) {
  return (
    <article className="saved-card">
      <LogoMark src={job.logo} name={job.company} color={job.companyColor} />

      <div className="saved-card__body">
        <div className="saved-card__main">
          <h2 className="saved-card__title">
            <Link to={`/bron/${job.id}`}>{job.title}</Link>
          </h2>
          <div className="saved-card__sub">
            <span className="saved-card__company">
              {job.company}
              {job.verified ? <VerifiedBadge /> : null}
            </span>
            <span className="saved-card__dot" aria-hidden="true" />
            <span className="saved-card__loc">
              <MapPin size={13} strokeWidth={2.25} aria-hidden />
              {tr(job.location)}
            </span>
          </div>
          <div className="saved-card__tags">
            <span className={`saved-tag saved-tag--${job.typeTone}`}>{tr(job.typeLabel)}</span>
            <span className="saved-tag saved-tag--neutral">{tr(job.category)}</span>
          </div>
        </div>

        <div className="saved-card__meta">
          <span className="saved-card__stat">
            <Clock3 size={14} strokeWidth={2.25} aria-hidden />
            {job.postedAgo}
          </span>
          <span className="saved-card__stat">
            <Eye size={14} strokeWidth={2.25} aria-hidden />
            {formatViews(job.views ?? 0)}
          </span>
        </div>
      </div>

      <div className="saved-card__actions">
        <Link to={`/bron/${job.id}`} className="saved-card__cta">
          {tr('Batafsil ko‘rish')}
          <FiArrowRight />
        </Link>
        <button
          type="button"
          className="saved-card__heart is-active"
          aria-label={tr('Saqlashdan olib tashlash')}
          onClick={onUnsave}
        >
          <Heart size={18} fill="currentColor" strokeWidth={0} />
        </button>
        <ShareButton title={job.title} path={`/bron/${job.id}`} />
      </div>
    </article>
  )
}

function SavedCompanyCard({ company, onUnsave }) {
  return (
    <article className="saved-card">
      <LogoMark
        src={company.logo ? `${company.logo}?v=2` : undefined}
        name={company.name}
        color={company.color}
      />

      <div className="saved-card__body">
        <div className="saved-card__main">
          <h2 className="saved-card__title">
            <Link to={`/majmua/${company.id}`}>{company.name}</Link>
            {company.verified ? <VerifiedBadge /> : null}
          </h2>
          <div className="saved-card__sub">
            <span className="saved-card__loc">
              <FiCalendar aria-hidden />
              {company.adsCount} {tr('ta xizmat')}
            </span>
          </div>
          <div className="saved-card__tags">
            <span className="saved-tag saved-tag--pink">{tr('Majmua')}</span>
            {company.verified ? (
              <span className="saved-tag saved-tag--green">{tr('Tasdiqlangan')}</span>
            ) : null}
          </div>
        </div>

        <div className="saved-card__meta">
          <span className="saved-card__stat">
            <FiTrendingUp aria-hidden />
            {tr('Faol majmua')}
          </span>
        </div>
      </div>

      <div className="saved-card__actions">
        <Link to={`/majmua/${company.id}`} className="saved-card__cta">
          {tr('Profilni ko‘rish')}
          <FiArrowRight />
        </Link>
        <button
          type="button"
          className="saved-card__heart is-active"
          aria-label={tr('Saqlashdan olib tashlash')}
          onClick={onUnsave}
        >
          <Heart size={18} fill="currentColor" strokeWidth={0} />
        </button>
        <ShareButton title={company.name} path={`/majmua/${company.id}`} />
      </div>
    </article>
  )
}

