import { Link } from 'react-router-dom'
import './QuickLinks.css'

// Bosh sahifadagi bo‘limlar — anchor bilan, alohida sahifalar — route bilan
const LINKS = [
  { id: 'complexes', label: 'Sport majmualari', href: '#majmualar', image: '/images/quick/complexes.webp' },
  { id: 'news', label: 'Sport yangiliklari', to: '/bolim/yangiliklar', image: '/images/quick/news.webp' },
  { id: 'events', label: 'Tadbirlar', href: '#tadbirlar', image: '/images/quick/events.webp' },
  { id: 'competitions', label: 'Musobaqalar', to: '/bolim/musobaqalar', image: '/images/quick/competitions.webp' },
]

/** Mobil (≤639px) bosh sahifa: 3D rasmli 2×2 bo‘lim kartalari */
export default function QuickLinks() {
  return (
    <nav className="quick-links container" aria-label="Asosiy bo‘limlar">
      {LINKS.map(({ id, label, href, to, image }) => {
        const content = (
          <>
            <span className="quick-link__media">
              <img className="quick-link__img" src={image} alt="" draggable="false" />
            </span>
            <span className="quick-link__label">{label}</span>
          </>
        )

        return to ? (
          <Link key={id} to={to} className={`quick-link quick-link--${id}`}>
            {content}
          </Link>
        ) : (
          <a key={id} href={href} className={`quick-link quick-link--${id}`}>
            {content}
          </a>
        )
      })}
    </nav>
  )
}
