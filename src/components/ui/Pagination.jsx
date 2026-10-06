import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './Pagination.css'

/** 1 … 4 5 [6] 7 8 … 20 ko‘rinishidagi sahifalar ro‘yxati */
function getPages(current, total, siblings = 1) {
  const pages = []
  const start = Math.max(2, current - siblings)
  const end = Math.min(total - 1, current + siblings)

  pages.push(1)
  if (start > 2) pages.push(start === 3 ? 2 : 'start-gap')
  for (let page = start; page <= end; page += 1) pages.push(page)
  if (end < total - 1) pages.push(end === total - 2 ? total - 1 : 'end-gap')
  if (total > 1) pages.push(total)

  return pages
}

export default function Pagination({ page, totalPages, onChange, className = '' }) {
  if (totalPages <= 1) return null

  return (
    <nav className={`pagination ${className}`} aria-label="Sahifalar">
      <button
        type="button"
        className="pagination__arrow"
        aria-label="Oldingi sahifa"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        <FiChevronLeft />
        <span className="pagination__arrow-label">Oldingi</span>
      </button>

      <ul className="pagination__list">
        {getPages(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={`pagination__page ${item === page ? 'pagination__page--active' : ''}`}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`${item}-sahifa`}
                onClick={() => onChange(item)}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className="pagination__gap" aria-hidden="true">
              …
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className="pagination__arrow"
        aria-label="Keyingi sahifa"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        <span className="pagination__arrow-label">Keyingi</span>
        <FiChevronRight />
      </button>
    </nav>
  )
}
