import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiArrowRight, FiSearch } from 'react-icons/fi'
import ComplexCard from '../components/SportComplexes/ComplexCard.jsx'
import { complexes } from '../data/complexes.js'
import { jobs } from '../data/jobs.js'
import { allNews } from '../data/news.js'
import { categoryMenuItems } from '../data/categoryMenu.js'
import { useSeo } from '../hooks/useSeo.js'
import { tr } from '../i18n/index.js'
import '../components/SportComplexes/SportComplexes.css'
import './SearchPage.css'

const LIMIT = { complexes: 12, services: 8, news: 6 }

// Apostrof va katta-kichik harflar farqi qidiruvga xalaqit bermasin: «o‘g‘il» = «ogil» = «o'g'il»
const normalize = (text) =>
  String(text ?? '')
    .toLowerCase()
    .replace(/[‘’ʻʼ'`]/g, '')
    .trim()

function matcher(query) {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  return (...fields) => {
    const haystack = normalize(fields.flat().join(' '))
    return words.every((word) => haystack.includes(word))
  }
}

export default function SearchPage() {
  const [params] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  useSeo({ title: query ? tr('«{q}» bo‘yicha qidiruv', { q: query }) : tr('Qidiruv') })

  const results = useMemo(() => {
    if (!query) return null
    const match = matcher(query)
    return {
      sports: categoryMenuItems.filter((c) => match(c.title, c.id)),
      complexes: complexes.filter((c) =>
        match(c.name, c.city, c.location, c.tagline, c.sports.map((s) => tr(s))),
      ),
      services: jobs.filter((j) => match(j.title, j.company, tr(j.category), j.location)),
      news: allNews.filter((n) => match(n.title, n.excerpt, n.category)),
    }
  }, [query])

  const total = results
    ? results.sports.length + results.complexes.length + results.services.length + results.news.length
    : 0

  return (
    <div className="search-page container">
      <header className="search-page__head">
        <h1>{query ? tr('«{q}» bo‘yicha natijalar', { q: query }) : tr('Qidiruv')}</h1>
        {results && <p>{tr('{n} ta natija topildi', { n: total })}</p>}
      </header>

      {!results && (
        <div className="search-page__empty">
          <FiSearch aria-hidden="true" />
          <p>{tr('Sport turi, majmua nomi, xizmat yoki shaharni yozing.')}</p>
        </div>
      )}

      {results && total === 0 && (
        <div className="search-page__empty">
          <FiSearch aria-hidden="true" />
          <p>{tr('Hech narsa topilmadi. Boshqa so‘z bilan qidirib ko‘ring yoki sport turlarini ko‘rib chiqing.')}</p>
          <Link to="/sport-turlari" className="search-page__cta">
            {tr('Barcha sport turlari')} <FiArrowRight />
          </Link>
        </div>
      )}

      {results?.sports.length > 0 && (
        <section className="search-page__section">
          <h2>{tr('Sport turlari')}</h2>
          <ul className="search-page__chips">
            {results.sports.map(({ id, title, Icon, iconBg, iconColor }) => (
              <li key={id}>
                <Link to={`/sport/${id}`} className="search-page__chip">
                  <span style={{ background: iconBg, color: iconColor }} aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results?.complexes.length > 0 && (
        <section className="search-page__section">
          <h2>
            {tr('Sport majmualari')} <em>{results.complexes.length}</em>
          </h2>
          <ul className="sport-complexes__grid">
            {results.complexes.slice(0, LIMIT.complexes).map((complex) => (
              <li key={complex.id}>
                <ComplexCard complex={complex} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {results?.services.length > 0 && (
        <section className="search-page__section">
          <h2>
            {tr('Xizmatlar')} <em>{results.services.length}</em>
          </h2>
          <ul className="search-page__list">
            {results.services.slice(0, LIMIT.services).map((job) => (
              <li key={job.id}>
                <Link to={`/bron/${job.id}`} className="search-page__row">
                  <strong>{job.title}</strong>
                  <span>
                    {job.company} · {tr(job.location)}
                  </span>
                  <b>{tr(job.salary)}</b>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {results?.news.length > 0 && (
        <section className="search-page__section">
          <h2>
            {tr('Yangiliklar')} <em>{results.news.length}</em>
          </h2>
          <ul className="search-page__list">
            {results.news.slice(0, LIMIT.news).map((news) => (
              <li key={news.id}>
                <Link to={`/yangilik/${news.id}`} className="search-page__row">
                  <strong>{news.title}</strong>
                  <span>{news.date}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
