import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  CalendarCheck,
  Check,
  Clock3,
  Dumbbell,
  Eye,
  Flame,
  Footprints,
  Heart,
  HeartPulse,
  MapPin,
  MoreVertical,
  Search,
  Swords,
  Target,
  Trophy,
  Waves,
} from 'lucide-react'
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiHeart,
  FiTrendingUp,
} from 'react-icons/fi'
import Select from '../components/ui/Select.jsx'
import { jobs } from '../data/jobs.js'
import { companies } from '../data/companies.js'
import { courses } from '../data/courses.js'
import { toggleSaved, useSavedList } from '../hooks/useSaved.js'
import './SavedPage.css'

const COURSE_ICONS = {
  dumbbell: Dumbbell,
  waves: Waves,
  trophy: Trophy,
  heart: HeartPulse,
  swords: Swords,
  footprints: Footprints,
  target: Target,
  flame: Flame,
}

const TABS = [
  { id: 'jobs', label: 'Bo‘sh joylar', icon: CalendarCheck },
  { id: 'companies', label: 'Majmualar', icon: Building2 },
  { id: 'courses', label: 'Mashg‘ulotlar', icon: Dumbbell },
]

const SORT_OPTIONS = [
  { id: 'newest', label: 'Eng yangi' },
  { id: 'oldest', label: 'Eng eski' },
  { id: 'views', label: "Ko'p ko'rilgan" },
  { id: 'az', label: 'A–Z' },
]


function VerifiedBadge() {
  return (
    <span className="saved-verified" title="Tasdiqlangan" aria-label="Tasdiqlangan">
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
  const savedCourseList = useSavedList('courses')
  const savedJobs = useMemo(() => new Set(savedJobList), [savedJobList])
  const savedCompanies = useMemo(() => new Set(savedCompanyList), [savedCompanyList])
  const savedCourses = useMemo(() => new Set(savedCourseList), [savedCourseList])

  const counts = {
    jobs: savedJobs.size,
    companies: savedCompanies.size,
    courses: savedCourses.size,
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

  const courseItems = useMemo(() => {
    let list = courses.filter((c) => savedCourses.has(c.id))
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.provider.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q),
      )
    }
    return sortItems(list, sort, (c) => c.title, () => 0, (c) => c.id)
  }, [savedCourses, query, sort])

  function unsaveJob(id) {
    toggleSaved('jobs', id)
  }

  function unsaveCompany(id) {
    toggleSaved('companies', id)
  }

  function unsaveCourse(id) {
    toggleSaved('courses', id)
  }

  const emptyCopy = {
    jobs: {
      title: "Saqlangan joylar yo'q",
      text: "Yoqtirgan maydon va zallaringizni yurakcha orqali saqlang — ular shu yerda paydo bo'ladi.",
      cta: "Bo'sh joylarni ko'rish",
      to: '/bron',
    },
    companies: {
      title: "Saqlangan majmualar yo'q",
      text: "Sevimli majmualaringizni saqlang va bo'sh vaqtlarini kuzatib boring.",
      cta: "Majmualarni ko'rish",
      to: '/majmualar',
    },
    courses: {
      title: "Saqlangan mashg'ulotlar yo'q",
      text: "Qiziqarli mashg'ulot dasturlarini saqlang va keyinroq qayting.",
      cta: "Mashg'ulotlarni ko'rish",
      to: '/#majmualar',
    },
  }

  const activeList =
    tab === 'jobs' ? jobItems : tab === 'companies' ? companyItems : courseItems
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
              Saqlanganlar
            </h1>
            <p className="saved-hero__sub">
              Yoqtirgan maydonlar, majmualar va mashg&apos;ulotlaringiz — barchasi bir joyda.
            </p>
          </div>
        </header>

        <div className="saved-tabs" role="tablist" aria-label="Saqlanganlar bo'limi">
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
                  ? "Saqlangan joylar ichidan qidirish..."
                  : tab === 'companies'
                    ? 'Majmua nomi bo‘yicha qidirish...'
                    : 'Mashg‘ulot yoki murabbiy bo‘yicha qidirish...'
              }
              aria-label="Saqlanganlar ichidan qidirish"
            />
          </label>

          <div className="saved-sort">
            <span className="saved-sort__label">Saralash</span>
            <Select
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
              ariaLabel="Saralash"
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
            {tab === 'courses' &&
              courseItems.map((course, index) => (
                <li key={course.id} style={{ '--i': index }}>
                  <SavedCourseCard
                    course={course}
                    onUnsave={() => unsaveCourse(course.id)}
                  />
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
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
              {job.location}
            </span>
          </div>
          <div className="saved-card__tags">
            <span className={`saved-tag saved-tag--${job.typeTone}`}>{job.typeLabel}</span>
            <span className="saved-tag saved-tag--neutral">{job.category}</span>
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
          Batafsil ko&apos;rish
          <FiArrowRight />
        </Link>
        <button
          type="button"
          className="saved-card__heart is-active"
          aria-label="Saqlashdan olib tashlash"
          onClick={onUnsave}
        >
          <Heart size={18} fill="currentColor" strokeWidth={0} />
        </button>
        <button type="button" className="saved-card__more" aria-label="Qo'shimcha">
          <MoreVertical size={18} strokeWidth={2.25} />
        </button>
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
              {company.adsCount} ta xizmat
            </span>
          </div>
          <div className="saved-card__tags">
            <span className="saved-tag saved-tag--pink">Majmua</span>
            {company.verified ? (
              <span className="saved-tag saved-tag--green">Tasdiqlangan</span>
            ) : null}
          </div>
        </div>

        <div className="saved-card__meta">
          <span className="saved-card__stat">
            <FiTrendingUp aria-hidden />
            Faol majmua
          </span>
        </div>
      </div>

      <div className="saved-card__actions">
        <Link to={`/majmua/${company.id}`} className="saved-card__cta">
          Profilni ko&apos;rish
          <FiArrowRight />
        </Link>
        <button
          type="button"
          className="saved-card__heart is-active"
          aria-label="Saqlashdan olib tashlash"
          onClick={onUnsave}
        >
          <Heart size={18} fill="currentColor" strokeWidth={0} />
        </button>
        <button type="button" className="saved-card__more" aria-label="Qo'shimcha">
          <MoreVertical size={18} strokeWidth={2.25} />
        </button>
      </div>
    </article>
  )
}

function SavedCourseCard({ course, onUnsave }) {
  const Icon = COURSE_ICONS[course.icon] ?? Dumbbell

  return (
    <article className="saved-card">
      <span className="saved-logo saved-logo--course" style={{ background: course.accent }}>
        <Icon size={22} strokeWidth={1.75} />
      </span>

      <div className="saved-card__body">
        <div className="saved-card__main">
          <h2 className="saved-card__title">{course.title}</h2>
          <div className="saved-card__sub">
            <span className="saved-card__company">{course.provider}</span>
            <span className="saved-card__dot" aria-hidden="true" />
            <span className="saved-card__loc">
              <FiClock aria-hidden />
              {course.duration}
            </span>
          </div>
          <div className="saved-card__tags">
            <span className={`saved-tag ${course.isFree ? 'saved-tag--green' : 'saved-tag--pink'}`}>
              {course.price}
            </span>
            <span className="saved-tag saved-tag--neutral">{course.category}</span>
            <span className="saved-tag saved-tag--orange">{course.level}</span>
          </div>
        </div>
      </div>

      <div className="saved-card__actions">
        <a href="/#majmualar" className="saved-card__cta">
          Batafsil ko&apos;rish
          <FiArrowRight />
        </a>
        <button
          type="button"
          className="saved-card__heart is-active"
          aria-label="Saqlashdan olib tashlash"
          onClick={onUnsave}
        >
          <Heart size={18} fill="currentColor" strokeWidth={0} />
        </button>
        <button type="button" className="saved-card__more" aria-label="Qo'shimcha">
          <MoreVertical size={18} strokeWidth={2.25} />
        </button>
      </div>
    </article>
  )
}
