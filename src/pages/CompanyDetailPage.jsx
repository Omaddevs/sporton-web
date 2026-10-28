import { tr } from '../i18n/index.js'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import {
  FiArrowRight,
  FiBell,
  FiActivity,
  FiBookmark,
  FiCalendar,
  FiExternalLink,
  FiGlobe,
  FiHeart,
  FiMapPin,
  FiSearch,
  FiUsers,
} from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import {
  companies,
  getCompanyById,
  getSimilarCompanies,
} from '../data/companies.js'
import { jobs } from '../data/jobs.js'
import { useSaved } from '../hooks/useSaved.js'
import NotFound from '../components/ui/NotFound.jsx'
import './CompanyDetailPage.css'

const TABS = [
  { id: 'jobs', label: tr('Xizmatlar') },
  { id: 'about', label: tr('Majmua haqida') },
  { id: 'photos', label: tr('Rasmlar') },
  { id: 'reviews', label: tr('Sharhlar') },
  { id: 'contacts', label: tr('Kontaktlar') },
]

export default function CompanyDetailPage() {
  const { companyId } = useParams()
  const company = useMemo(() => getCompanyById(companyId), [companyId])
  if (!company)
    return (
      <NotFound
        title={tr('Majmua topilmadi')}
        text={tr('Bu sahifa o‘chirilgan yoki manzil noto‘g‘ri. Boshqa majmualarni ko‘rib chiqing.')}
        to="/#majmualar"
        cta={tr('Barcha majmualar')}
      />
    )
  return <CompanyDetailView key={company.id} company={company} />
}

function CompanyDetailView({ company }) {
  const similar = useMemo(() => getSimilarCompanies(company, 4), [company])
  const companyJobs = useMemo(
    () => jobs.filter((j) => j.companyId === company.id),
    [company],
  )
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('jobs')
  const [saved, toggleSaved] = useSaved('companies', company.id)
  const [sort, setSort] = useState('new')

  const filteredSidebar = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return companies.slice(0, 10)
    return companies.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 10)
  }, [query])

  const sortedJobs = useMemo(() => {
    const list = [...companyJobs]
    if (sort === 'old') list.reverse()
    return list
  }, [companyJobs, sort])

  return (
    <div className="company-page">
      <div className="container company-page__inner">
        <div className="company-page__grid">
          <aside className="company-page__sidebar">
            <div className="co-side-card">
              <div className="co-side-card__head">
                <h2>{tr('Top majmualar')}</h2>
                <Link to="/majmualar">
                  {tr('Barchasini ko‘rish')}
                  <FiArrowRight />
                </Link>
              </div>

              <label className="co-side-search">
                <FiSearch />
                <input
                  type="search"
                  placeholder={tr('Majmua qidirish...')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>

              <ul className="co-side-list">
                {filteredSidebar.map((item) => (
                  <li key={item.id}>
                    <Link
                      to={`/majmua/${item.id}`}
                      className={`co-side-row ${item.id === company.id ? 'is-active' : ''}`}
                    >
                      <span
                        className="co-side-row__logo"
                        style={item.logo ? undefined : { background: item.color, color: '#fff' }}
                      >
                        {item.logo ? (
                          <img loading="lazy" decoding="async" src={`${item.logo}?v=2`} alt="" />
                        ) : (
                          item.name.charAt(0)
                        )}
                      </span>
                      <span className="co-side-row__info">
                        <span className="co-side-row__name-line">
                          <span className="co-side-row__name">{item.name}</span>
                          {item.verified && (
                            <em className="co-verified" title={tr('Tasdiqlangan')} aria-label={tr('Tasdiqlangan')}>
                              <Check size={9} strokeWidth={3.5} />
                            </em>
                          )}
                        </span>
                        <span className="co-side-row__meta">
                          <FiCalendar aria-hidden="true" />
                          <span>
                            {item.adsCount} {tr('ta xizmat')}
                          </span>
                        </span>
                      </span>
                      <span className="co-side-row__arrow" aria-hidden="true">
                        <FiArrowRight />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <Link to="/majmualar" className="co-side-cta">
                {tr('Barcha majmualar')}
                <FiArrowRight />
              </Link>
            </div>

            <div className="co-side-teaser">
              <img src="/images/companies/buildings.svg" alt="" width={52} height={44} />
              <p>
                <span>{tr('Ishonchli majmualar —')}</span>
                <span>{tr('sog‘lom hayot!')}</span>
              </p>
            </div>
          </aside>

          <main className="company-page__main">
            <section className="co-hero">
              <div className="co-hero__banner">
                {company.bannerImage ? (
                  <img fetchPriority="high" src={company.bannerImage} alt="" />
                ) : (
                  <div
                    className="co-hero__banner-fallback"
                    style={{ background: company.color || 'var(--color-primary)' }}
                  />
                )}
                <span className="co-hero__slogan">{company.bannerSlogan}</span>
                <button
                  type="button"
                  className={`co-hero__fav ${saved ? 'is-active' : ''}`}
                  aria-label={tr('Saqlash')}
                  aria-pressed={saved}
                  onClick={toggleSaved}
                >
                  <FiHeart />
                </button>
              </div>

              <div className="co-hero__card">
                <div className="co-hero__identity">
                  <span
                    className="co-hero__logo"
                    style={company.logo ? undefined : { background: company.color, color: '#fff' }}
                  >
                    {company.logo ? (
                      <img src={`${company.logo}?v=2`} alt="" />
                    ) : (
                      company.name.charAt(0)
                    )}
                  </span>
                  <div>
                    <h1>
                      {company.name}
                      {company.verified && (
                        <em className="co-verified co-verified--lg">
                          <Check size={11} strokeWidth={3.5} />
                        </em>
                      )}
                    </h1>
                    <p className="co-hero__tagline">{tr(company.tagline)}</p>
                    <div className="co-hero__meta">
                      <span>
                        <FiMapPin />
                        {tr(company.location)}
                      </span>
                      {company.website && (
                        <a href={company.website} target="_blank" rel="noreferrer">
                          <FiGlobe />
                          {company.website.replace(/^https?:\/\//, '')}
                          <FiExternalLink />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={`co-follow-btn ${saved ? 'is-following' : ''}`}
                  aria-pressed={saved}
                  onClick={toggleSaved}
                >
                  {saved ? tr('Saqlanganlarda') : tr('Majmuani saqlash')}
                </button>
              </div>
            </section>

            <div className="co-tabs" role="tablist" aria-label={tr('Majmua bo‘limlari')}>
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={`co-tabs__btn ${tab === item.id ? 'is-active' : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                  {item.id === 'jobs' ? ` ${companyJobs.length || company.adsCount}` : ''}
                  {item.id === 'reviews' ? ` ${company.reviews}` : ''}
                </button>
              ))}
            </div>

            <section className="co-stats">
              <Stat icon={<HiOutlineBuildingOffice2 />} value={`${company.years} ${tr('yil')}`} label={tr('Faoliyatda')} />
              <Stat icon={<FiUsers />} value={tr(company.employees)} label={tr('Murabbiylar')} />
              <Stat icon={<FiActivity />} value={tr(company.industry)} label={tr('Turi')} />
              <Stat icon={<FiMapPin />} value={tr(company.city)} label={tr('Manzil')} />
            </section>

            {tab === 'jobs' && (
              <section className="co-jobs">
                <div className="co-jobs__head">
                  <h2>{tr('{name} xizmatlari', { name: company.name })}</h2>
                  <label className="co-jobs__sort">
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option value="new">{tr('Eng yangi')}</option>
                      <option value="old">{tr('Eskiroq')}</option>
                    </select>
                  </label>
                </div>

                <ul className="co-jobs__list">
                  {sortedJobs.map((job) => (
                    <li key={job.id}>
                      <CompanyJobRow job={job} />
                    </li>
                  ))}
                  {!sortedJobs.length && (
                    <li className="co-jobs__empty">{tr('Hozircha bron uchun bo‘sh joy yo‘q.')}</li>
                  )}
                </ul>

                <div className="co-notify">
                  <span className="co-notify__icon" aria-hidden="true">
                    <FiBell />
                  </span>
                  <p>{tr('Majmuani saqlang — u doim «Saqlanganlar» bo‘limida qo‘l ostingizda bo‘ladi.')}</p>
                  <button type="button" className="co-notify__btn" aria-pressed={saved} onClick={toggleSaved}>
                    {saved ? tr('Saqlanganlarda') : tr('Majmuani saqlash')}
                  </button>
                </div>
              </section>
            )}

            {tab === 'about' && (
              <section className="co-panel">
                <h2>{tr('Majmua haqida')}</h2>
                <p>{tr(company.about)}</p>
              </section>
            )}

            {tab === 'photos' && (
              <section className="co-panel">
                <h2>{tr('Rasmlar')}</h2>
                <div className="co-photos">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <img loading="lazy" decoding="async" key={n} src={`/images/sport/gallery/g${n}.webp`} alt="" />
                  ))}
                </div>
              </section>
            )}

            {tab === 'reviews' && (
              <section className="co-panel">
                <h2>{tr('Sharhlar (')}{company.reviews})</h2>
                <p className="co-panel__muted">
                  {tr('Sportchilar sharhlari tez orada qo‘shiladi.')}
                </p>
              </section>
            )}

            {tab === 'contacts' && (
              <section className="co-panel">
                <h2>{tr('Kontaktlar')}</h2>
                <p>
                  <FiMapPin /> {tr(company.location)}
                </p>
                {company.website && (
                  <p>
                    <FiGlobe />{' '}
                    <a href={company.website} target="_blank" rel="noreferrer">
                      {company.website}
                    </a>
                  </p>
                )}
                <Link to={`/sport-majmua/${company.id}#bron`} className="co-follow-btn">
                  {tr('Bron qilish')}
                </Link>
              </section>
            )}

            <section className="co-similar">
              <h2>{tr('O‘xshash majmualar')}</h2>
              <div className="co-similar__grid">
                {similar.map((item) => (
                  <Link key={item.id} to={`/majmua/${item.id}`} className="co-similar-card">
                    <span
                      className="co-similar-card__logo"
                      style={item.logo ? undefined : { background: item.color, color: '#fff' }}
                    >
                      {item.logo ? (
                        <img loading="lazy" decoding="async" src={`${item.logo}?v=2`} alt="" />
                      ) : (
                        item.name.charAt(0)
                      )}
                    </span>
                    <strong>{item.name}</strong>
                    <span>{item.adsCount} {tr('ta xizmat')}</span>
                    <em>
                      <FiArrowRight />
                    </em>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

function Stat({ icon, value, label }) {
  return (
    <div className="co-stat">
      <span className="co-stat__icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

function CompanyJobRow({ job }) {
  const [saved, toggleSaved] = useSaved('jobs', job.id)

  return (
    <article className="co-job-row">
      <Link to={`/bron/${job.id}`} className="co-job-row__link">
        <div className="co-job-row__main">
          <h3>{job.title}</h3>
          <span className={`job-pill job-pill--sm job-pill--${job.typeTone}`}>{tr(job.typeLabel)}</span>
        </div>
        <div className="co-job-row__meta">
          <span>
            <FiMapPin /> {tr(job.location)}
          </span>
          <span>
            <FiActivity /> {tr(job.category)}
          </span>
          <span>{tr(job.salary)}</span>
        </div>
      </Link>
      <div className="co-job-row__actions">
        <Link to={`/bron/${job.id}`} className="co-job-row__go" aria-label={tr('Ochish')}>
          <FiArrowRight />
        </Link>
        <button
          type="button"
          className={`co-job-row__save ${saved ? 'is-active' : ''}`}
          aria-label={tr('Saqlash')}
          aria-pressed={saved}
          onClick={toggleSaved}
        >
          <FiBookmark />
        </button>
      </div>
    </article>
  )
}
