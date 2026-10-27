import { tr } from '../i18n/index.js'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import {
  FiArrowRight,
  FiBookmark,
  FiCheck,
  FiClock,
  FiEye,
  FiMapPin,
  FiShare2,
  FiDollarSign,
  FiTrendingUp,
} from 'react-icons/fi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import LogoIcon from '../components/icons/LogoIcon.jsx'
import {
  getJobById,
  getRelatedJobs,
  getSimilarJobs,
} from '../data/jobs.js'
import { getComplexById } from '../data/complexes.js'
import PhoneReveal from '../components/PhoneReveal/PhoneReveal.jsx'
import { BOOKING_MODES, bookingModeOf } from '../utils/booking.js'
import './JobDetailPage.css'
import { useSeo } from '../hooks/useSeo.js'
import { useSaved } from '../hooks/useSaved.js'

export default function JobDetailPage() {
  const { jobId } = useParams()
  const job = useMemo(() => getJobById(jobId), [jobId])
  useSeo({ title: `${job.title} — ${job.company}`, description: `${job.salary}. ${job.description ?? ''}`, image: job.companyMeta?.bannerImage })
  const similar = useMemo(() => getSimilarJobs(job, 6), [job])
  const related = useMemo(() => getRelatedJobs(job, 3), [job])
  const [saved, toggleSave] = useSaved('jobs', job.id)

  const meta = job.companyMeta
  const mode = bookingModeOf(job)
  const hasPhone = getComplexById(job.companyId)?.hasPhone

  return (
    <div className="job-detail-page">
      <div className="container job-detail-page__inner">
        <nav className="job-detail__crumbs" aria-label={tr('Breadcrumb')}>
          <Link to="/">{tr('Bosh sahifa')}</Link>
          <span>/</span>
          <Link to="/#majmualar">{tr('Bron qilish')}</Link>
          <span>/</span>
          <span>{job.category}</span>
          <span>/</span>
          <strong>{job.title}</strong>
        </nav>

        <div className="job-detail__grid">
          <aside className="job-detail__left">
            <h2 className="job-detail__side-title">O&apos;xshash joylar</h2>
            <ul className="job-side-list">
              {similar.map((item) => (
                <li key={item.id}>
                  <SideJobCard job={item} />
                </li>
              ))}
            </ul>
            <Link to="/#majmualar" className="job-detail__all-btn">
              Barcha bo&apos;sh joylar
              <FiArrowRight />
            </Link>
          </aside>

          <main className="job-detail__main">
            <section className="job-hero-card">
              <div className="job-hero-card__top">
                <div className="job-hero-card__identity">
                  <span
                    className="job-hero-card__logo"
                    style={job.logo ? undefined : { background: job.companyColor }}
                  >
                    {job.logo ? (
                      <img src={job.logo} alt="" />
                    ) : (
                      job.company.charAt(0)
                    )}
                  </span>
                  <div>
                    <h1>{job.title}</h1>
                    <div className="job-hero-card__company">
                      <span>{job.company}</span>
                      {job.verified && (
                        <span className="job-verified" title={tr('Tasdiqlangan')}>
                          <Check size={10} strokeWidth={3.5} />
                        </span>
                      )}
                    </div>
                    <p className="job-hero-card__loc">
                      <FiMapPin />
                      {job.location}
                    </p>
                  </div>
                </div>

                <div className="job-hero-card__actions">
                  <div className="job-hero-card__meta">
                    <span>{job.postedAt || job.postedAgo}</span>
                    <span>
                      <FiEye /> {job.views}
                    </span>
                    <button
                      type="button"
                      className={`job-icon-btn ${saved ? 'is-active' : ''}`}
                      aria-label={tr('Saqlash')}
                      onClick={() => toggleSave()}
                    >
                      <FiBookmark />
                    </button>
                    <button type="button" className="job-icon-btn" aria-label={tr('Ulashish')}>
                      <FiShare2 />
                    </button>
                  </div>
                  {mode === 'call' && hasPhone ? (
                    <PhoneReveal complexId={job.companyId} className="job-apply-btn" label={BOOKING_MODES.call.cta} />
                  ) : (
                    <Link to={`/sport-majmua/${job.companyId}?xizmat=${job.id}#bron`} className="job-apply-btn">
                      {BOOKING_MODES[mode].cta}
                      <FiArrowRight />
                    </Link>
                  )}
                </div>
              </div>

              <div className="job-hero-card__tags">
                <span className={`job-pill job-pill--${job.typeTone}`}>{job.typeLabel}</span>
                <span className="job-pill job-pill--outline">{job.category}</span>
                <span className="job-pill job-pill--outline">{job.workMode}</span>
                <span className="job-pill job-pill--outline">{job.level}</span>
              </div>
            </section>

            <div className="job-banner">
              {meta.bannerImage ? (
                <img src={meta.bannerImage} alt="" />
              ) : (
                <div className="job-banner__fallback" style={{ background: job.companyColor }} />
              )}
              {meta.bannerText ? <span className="job-banner__caption">{meta.bannerText}</span> : null}
            </div>

            <section className="job-facts">
              <Fact icon={<FiDollarSign />} label={tr('Narx')} value={job.salary} />
              <Fact icon={<HiOutlineBuildingOffice2 />} label={tr('Joy turi')} value={job.typeLabel} />
              <Fact icon={<FiTrendingUp />} label={tr('Daraja')} value={job.experience} />
              <Fact icon={<FiClock />} label={tr('Ish vaqti')} value={job.hours} />
              <Fact icon={<FiMapPin />} label={tr('Manzil')} value={job.location} />
            </section>

            <section className="job-block">
              <h2>{tr('Xizmat haqida')}</h2>
              <p>{job.description}</p>
            </section>

            <div className="job-split">
              <section className="job-block">
                <h2>{tr('Narxga nimalar kiradi')}</h2>
                <ul className="job-checklist">
                  {job.tasks.map((item) => (
                    <li key={item}>
                      <span className="job-check">
                        <FiCheck />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>

                <h2 className="job-block__spaced">{tr('Qoidalar')}</h2>
                <ul className="job-checklist">
                  {job.requirements.map((item) => (
                    <li key={item}>
                      <span className="job-check">
                        <FiCheck />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="job-offer-card">
                <h2>{tr('Qulayliklar va bonuslar')}</h2>
                <ul className="job-checklist">
                  {job.offers.map((item) => (
                    <li key={item}>
                      <span className="job-check">
                        <FiCheck />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </main>

          <aside className="job-detail__right">
            <section className="company-about">
              <div className="company-about__head">
                <span
                  className="company-about__logo"
                  style={job.logo ? undefined : { background: job.companyColor }}
                >
                  {job.logo ? <img src={job.logo} alt="" /> : job.company.charAt(0)}
                </span>
                <div>
                  <h2>{job.company}</h2>
                  <p>{meta.industry}</p>
                </div>
              </div>
              <Link to={`/majmua/${job.companyId}`} className="company-about__link">
                {tr('Majmua sahifasi')}
                <FiArrowRight />
              </Link>
              <p className="company-about__bio">{meta.about}</p>
              <div className="company-about__stats">
                {meta.stats.map((stat) => (
                  <div key={stat.label}>
                    <HiOutlineBuildingOffice2 />
                    <strong>{stat.label}</strong>
                    <span>{stat.sub}</span>
                  </div>
                ))}
              </div>
              {meta.gallery?.length ? (
                <div className="company-about__gallery">
                  {meta.gallery.map((src) => (
                    <img key={src} src={src} alt="" />
                  ))}
                </div>
              ) : null}
              <blockquote className="company-about__quote">
                <span aria-hidden="true">“</span>
                {meta.quote}
              </blockquote>
            </section>

            <section className="job-related">
              <h2 className="job-detail__side-title">{tr('Boshqa majmualarda')}</h2>
              <ul className="job-side-list">
                {related.map((item) => (
                  <li key={item.id}>
                    <SideJobCard job={item} compact />
                  </li>
                ))}
              </ul>
            </section>

            {hasPhone && (
            <section className="job-support">
              <div className="job-support__copy">
                <h2>{tr('Savollaringiz bormi?')}</h2>
                <p>Majmua administratori bilan to&apos;g&apos;ridan-to&apos;g&apos;ri bog&apos;laning</p>
                <PhoneReveal complexId={job.companyId} className="job-support__btn" label={tr('Qo‘ng‘iroq qilish')} />
              </div>
              <span className="job-support__person job-support__badge" aria-hidden="true">
                <LogoIcon size={44} />
              </span>
            </section>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

function Fact({ icon, label, value }) {
  return (
    <div className="job-fact">
      <span className="job-fact__icon" aria-hidden="true">
        {icon}
      </span>
      <div>
        <span className="job-fact__label">{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  )
}

function SideJobCard({ job, compact = false }) {
  const [saved, toggleSave] = useSaved('jobs', job.id)

  return (
    <Link to={`/bron/${job.id}`} className={`job-side-card ${compact ? 'job-side-card--compact' : ''}`}>
      <span
        className="job-side-card__logo"
        style={job.logo ? undefined : { background: job.companyColor }}
      >
        {job.logo ? <img src={job.logo} alt="" /> : job.company.charAt(0)}
      </span>
      <span className="job-side-card__body">
        <span className="job-side-card__title">{job.title}</span>
        <span className="job-side-card__sub">
          <span className="job-side-card__company">
            <span className="job-side-card__company-name">{job.company}</span>
            {job.verified && (
              <em className="job-verified" title={tr('Tasdiqlangan')}>
                <Check size={9} strokeWidth={3.5} />
              </em>
            )}
          </span>
          <span className="job-side-card__dot" aria-hidden="true" />
          <span className="job-side-card__location">
            <FiMapPin aria-hidden="true" />
            <span>{job.location}</span>
          </span>
        </span>
        <span className="job-side-card__meta">
          <span className={`job-pill job-pill--sm job-pill--${job.typeTone}`}>{job.typeLabel}</span>
          {!compact && <span className="job-side-card__time">{job.postedAt || job.postedAgo}</span>}
        </span>
      </span>
      <button
        type="button"
        className={`job-side-card__save ${saved ? 'is-active' : ''}`}
        aria-label={tr('Saqlash')}
        onClick={(e) => {
          e.preventDefault()
          toggleSave()
        }}
      >
        <FiBookmark />
      </button>
    </Link>
  )
}
