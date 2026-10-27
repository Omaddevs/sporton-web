import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiPlus } from 'react-icons/fi'
import { fetchPartners } from '../../services/partners.js'
import './Partners.css'
import { tr } from '../../i18n/index.js'

const COLUMNS = 5
// Har bir ustun o‘z tezligida va yo‘nalishida aylanadi — devor «tirik» ko‘rinadi
const DURATIONS = [46, 38, 52, 42, 48]
// Hamkorlar kam bo‘lsa ham ustunlar to‘la ko‘rinishi uchun har ustunda kamida shuncha plitka
const MIN_PER_COLUMN = 4

function PartnerTile({ partner, hidden }) {
  const content = (
    <>
      <span className="partners__mark">
        <img src={partner.logo} alt="" loading="lazy" />
      </span>
      <span className="partners__name">{partner.name}</span>
    </>
  )
  const common = {
    className: 'partners__tile',
    title: partner.name,
    'aria-hidden': hidden || undefined,
  }
  if (!partner.link) return <div {...common}>{content}</div>
  return (
    <a {...common} href={partner.link} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined}>
      {content}
    </a>
  )
}

export default function Partners({ id = 'hamkorlar' }) {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [partners, setPartners] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    fetchPartners({ signal: controller.signal })
      .then(setPartners)
      .catch(() => null)
    return () => controller.abort()
  }, [])

  const columns = useMemo(() => {
    if (!partners.length) return []
    // Kam hamkor bo‘lsa ro‘yxatni takrorlab devorni to‘ldiramiz
    const pool = []
    while (pool.length < COLUMNS * MIN_PER_COLUMN) pool.push(...partners)
    return Array.from({ length: COLUMNS }, (_, col) => pool.filter((_, i) => i % COLUMNS === col))
  }, [partners])

  const hasPartners = partners.length > 0

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasPartners])

  // Admin paneldan hamkor kiritilmaguncha bo‘lim umuman ko‘rsatilmaydi
  if (!hasPartners) return null

  return (
    <section ref={sectionRef} id={id} className={`partners container ${visible ? 'is-visible' : ''}`}>
      <div className="partners__panel">
        <div className="partners__copy">
          <span className="partners__eyebrow">{tr('Hamkorlar')}</span>
          <h2 className="partners__title">
            {tr('Bizga ishonch bildirgan')} <span>{tr('sport klublari')}</span>
          </h2>
          <p className="partners__text">
            {tr('Toshkent va viloyatlardagi sport majmualari, bolalar klublari va murabbiylar SportON orqali yangi shogirdlar topmoqda. Klubingizni platformaga qo‘shing — e’loningizni minglab ota-onalar ko‘radi.')}
          </p>

          <dl className="partners__stats">
            <div>
              <dt>{partners.length}</dt>
              <dd>{tr('Hamkor')}</dd>
            </div>
          </dl>

          <div className="partners__actions">
            <Link to="/majmua-qoshish" className="partners__btn partners__btn--primary">
              <FiPlus /> {tr('Hamkor bo‘lish')}
            </Link>
            <Link to="/#majmualar" className="partners__btn partners__btn--ghost">
              {tr('Barcha klublar')} <FiArrowRight />
            </Link>
          </div>
        </div>

        <div className="partners__wall">
          {columns.map((items, col) => (
            <div
              key={col}
              className={`partners__col ${col % 2 ? 'partners__col--down' : ''}`}
              style={{ '--duration': `${DURATIONS[col % DURATIONS.length]}s`, '--delay': `${col * 90}ms` }}
            >
              <div className="partners__track">
                {/* Ikki nusxa — cheksiz silliq aylanish uchun */}
                {[0, 1].map((copy) =>
                  items.map((partner, i) => (
                    <PartnerTile key={`${copy}-${i}-${partner.id}`} partner={partner} hidden={copy === 1} />
                  )),
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
