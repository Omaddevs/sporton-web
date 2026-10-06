import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiArrowRight, FiArrowUpRight, FiCalendar } from 'react-icons/fi'
import { featuredNews, latestNews, newsTicker, sideNews } from '../../data/news.js'
import LogoIcon from '../icons/LogoIcon.jsx'
import './SportNews.css'

export default function SportNews({ id = 'yangiliklar' }) {
  return (
    <section className="sport-news container" id={id}>
      <div className="sport-news__top">
        <FeaturedCard news={featuredNews} />
        <div className="sport-news__side">
          {sideNews.map((news) => (
            <NewsRow key={news.id} news={news} />
          ))}
        </div>
      </div>

      <NewsTicker items={newsTicker} />
      <LatestNews items={latestNews} />
    </section>
  )
}

const newsHref = (news) => news.href ?? `/yangilik/${news.id}`

function Meta({ category, date }) {
  return (
    <div className="news-meta">
      <span className="news-meta__source">
        <span className="news-meta__avatar">
          <LogoIcon size={11} />
        </span>
        {category}
      </span>
      <span className="news-meta__dot" aria-hidden="true" />
      <span className="news-meta__date">
        <FiCalendar />
        {date}
      </span>
    </div>
  )
}

function NotchArrow({ size = 'sm' }) {
  return (
    <span className={`news-notch news-notch--${size}`} aria-hidden="true">
      <span className="news-notch__btn">
        <FiArrowUpRight />
      </span>
    </span>
  )
}

export function FeaturedCard({ news }) {
  return (
    <Link to={newsHref(news)} className="news-featured">
      <img className="news-featured__img" src={news.image} alt="" />
      <div className="news-featured__shade" />
      <div className="news-featured__body">
        <span className="news-featured__badge">{news.badge}</span>
        <h3 className="news-featured__title">{news.title}</h3>
        <p className="news-featured__excerpt">{news.excerpt}</p>
        <Meta category={news.category} date={news.date} />
      </div>
      <NotchArrow size="lg" />
    </Link>
  )
}

export function NewsRow({ news }) {
  return (
    <Link to={newsHref(news)} className="news-row">
      <div className="news-row__media">
        <img src={news.image} alt="" loading="lazy" />
        <NotchArrow />
      </div>
      <div className="news-row__body">
        <h3 className="news-row__title">{news.title}</h3>
        <p className="news-row__excerpt">{news.excerpt}</p>
        <Meta category={news.category} date={news.date} />
      </div>
    </Link>
  )
}

export function NewsTicker({ items, label = 'So‘nggi xabarlar' }) {
  // Uzluksiz aylanish uchun ro‘yxat ikki marta takrorlanadi
  const loop = [...items, ...items]

  return (
    <div className="news-ticker">
      <span className="news-ticker__label">
        <span className="news-ticker__pulse" />
        {label}
      </span>
      <div className="news-ticker__viewport">
        <div className="news-ticker__track">
          {loop.map((text, i) => (
            <span key={i} className="news-ticker__item" aria-hidden={i >= items.length}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LatestNews({ items, title = 'So‘nggi yangiliklar' }) {
  const trackRef = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const updateEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setEdges({
      start: el.scrollLeft <= 2,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 2,
    })
  }, [])

  useEffect(() => {
    updateEdges()
    window.addEventListener('resize', updateEdges)
    return () => window.removeEventListener('resize', updateEdges)
  }, [updateEdges])

  const scroll = (dir) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('.news-row')
    const step = card ? card.offsetWidth + 24 : el.clientWidth
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }

  return (
    <div className="latest-news">
      <div className="latest-news__header">
        <h2 className="latest-news__title">{title}</h2>
        <div className="latest-news__nav">
          <button
            type="button"
            className="latest-news__btn"
            onClick={() => scroll(-1)}
            disabled={edges.start}
            aria-label={`${title}: oldingilari`}
          >
            <FiArrowLeft />
          </button>
          <button
            type="button"
            className="latest-news__btn"
            onClick={() => scroll(1)}
            disabled={edges.end}
            aria-label={`${title}: keyingilari`}
          >
            <FiArrowRight />
          </button>
        </div>
      </div>

      <div className="latest-news__track" ref={trackRef} onScroll={updateEdges}>
        {items.map((news) => (
          <NewsRow key={news.id} news={news} />
        ))}
      </div>
    </div>
  )
}
