import { Link, Navigate, useParams } from 'react-router-dom'
import { footerPageBySlug } from '../data/footerPages.js'
import './InfoPage.css'
import { tr } from '../i18n/index.js'

export default function InfoPage() {
  const { slug } = useParams()
  const page = footerPageBySlug(slug)

  if (!page) {
    return <Navigate to="/" replace />
  }

  return (
    <section className="info-page">
      <div className="container info-page__inner">
        <nav className="info-page__crumbs" aria-label={tr('Navigatsiya')}>
          <Link to="/">{tr('Bosh sahifa')}</Link>
          <span aria-hidden="true">/</span>
          <span>{page.title}</span>
        </nav>

        <header className="info-page__header">
          <h1 className="info-page__title">{page.title}</h1>
          <p className="info-page__subtitle">{page.subtitle}</p>
        </header>

        <div className="info-page__sections">
          {page.sections.map((section) => (
            <article key={section.heading} className="info-page__section">
              <h2>{section.heading}</h2>
              {section.body.split('\n').map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
