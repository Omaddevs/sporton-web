import { useMemo, useState } from 'react'
import { Newspaper } from 'lucide-react'
import { FeaturedCard, NewsRow, NewsTicker } from '../SportNews/SportNews.jsx'
import { EmptyState } from './CategoryComplexes.jsx'
import '../SportNews/SportNews.css'
import './CategoryContent.css'
import { tr } from '../../i18n/index.js'

const SIDE_COUNT = 3

// Bosh sahifadagi yangilik kartalari kutadigan ko‘rinishga keltiradi
function toCard(article, index) {
  const badge = article.kind === 'blog' ? 'Blog' : index === 0 ? 'Bosh yangilik' : 'Yangilik'
  return { ...article, category: article.tag, badge }
}

export default function CategoryArticles({ category, items }) {
  const [kind, setKind] = useState('all')

  const counts = useMemo(
    () => ({
      all: items.length,
      news: items.filter((a) => a.kind === 'news').length,
      blog: items.filter((a) => a.kind === 'blog').length,
    }),
    [items],
  )

  const visible = (kind === 'all' ? items : items.filter((a) => a.kind === kind)).map(toCard)
  const [featured, ...others] = visible
  const side = others.slice(0, SIDE_COUNT)
  const more = others.slice(SIDE_COUNT)

  const segments = [
    { id: 'all', label: tr('Barchasi') },
    { id: 'news', label: tr('Yangiliklar') },
    { id: 'blog', label: tr('Blog') },
  ]

  return (
    <section className="cc-panel sport-news cc-news" aria-label={tr('Yangiliklar va blog')}>
      <div className="cc-toolbar">
        <div className="cc-toolbar__info">
          <h2>«{category.title}{tr('» bo‘yicha yangiliklar va blog')}</h2>
          <p>
            <strong>{visible.length}</strong> {tr('ta maqola')}
          </p>
        </div>

        <div className="cc-segment" role="radiogroup" aria-label={tr('Maqola turi')}>
          {segments.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={kind === s.id}
              className={kind === s.id ? 'is-active' : ''}
              onClick={() => setKind(s.id)}
              disabled={counts[s.id] === 0}
            >
              {s.label}
              <span>{counts[s.id]}</span>
            </button>
          ))}
        </div>
      </div>

      {featured ? (
        <>
          <div className={`sport-news__top ${side.length === 0 ? 'cc-news__top--single' : ''}`}>
            <FeaturedCard news={featured} />
            {side.length > 0 && (
              <div className="sport-news__side" style={{ gridTemplateRows: `repeat(${side.length}, 1fr)` }}>
                {side.map((article) => (
                  <NewsRow key={article.id} news={article} />
                ))}
              </div>
            )}
          </div>

          {visible.length > 1 && <NewsTicker items={visible.map((a) => a.title)} />}

          {more.length > 0 && (
            <div className="cc-news__more">
              <h3 className="latest-news__title">{tr('Boshqa maqolalar')}</h3>
              <div className="cc-news__grid">
                {more.map((article) => (
                  <NewsRow key={article.id} news={article} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          Icon={Newspaper}
          title={tr('Hozircha maqolalar yo‘q')}
          text={`«${category.title}» bo‘yicha yangiliklar tez orada paydo bo‘ladi.`}
        />
      )}
    </section>
  )
}
