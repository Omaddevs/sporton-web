import { Link } from 'react-router-dom'
import { FiChevronRight, FiMapPin } from 'react-icons/fi'
import { sportEvents } from '../../data/campaigns.js'
import './Campaigns.css'
import { tr } from '../../i18n/index.js'

export default function Campaigns({
  id,
  title = tr('Sport'),
  highlight = tr('tadbirlari'),
  items = sportEvents,
  allLabel = tr('Barchasini ko‘rish'),
}) {
  // Admin paneldan tadbir qo‘shilmaguncha bo‘lim ko‘rsatilmaydi
  if (!items.length) return null

  return (
    <section className="campaigns container" id={id}>
      <div className="campaigns__panel">
        <div className="campaigns__bg" aria-hidden="true" />

        <div className="campaigns__header">
          <h2 className="campaigns__title">
            {title} <span className="campaigns__title-accent">{highlight}</span>
          </h2>
          <Link to="/bolim/musobaqalar" className="campaigns__all">
            {allLabel}
            <FiChevronRight />
          </Link>
        </div>

        <div className="campaigns__grid">
          {items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  )
}

function EventCard({ event }) {
  return (
    <Link to={`/tadbir/${event.id}`} className="event-card">
      <div className="event-card__body">
        <h3 className="event-card__title">{event.title}</h3>
        <span className="event-card__location" title={tr(event.location)}>
          <FiMapPin />
          <span>{tr(event.location)}</span>
        </span>
      </div>

      <div className="event-card__date">
        {event.dates.map((date) => (
          <span key={date} className="event-card__day">
            {date}
          </span>
        ))}
        <span className="event-card__year">{event.year}</span>
        <span className="event-card__time">{tr(event.time)}</span>
      </div>
    </Link>
  )
}
