import { Link } from 'react-router-dom'
import { FiArrowLeft, FiCheck } from 'react-icons/fi'
import BrandLogo from '../Brand/BrandLogo.jsx'
import './Auth.css'
import { tr } from '../../i18n/index.js'

/**
 * Auth sahifalari karkasi: chapda brend paneli va bosqichlar, o‘ngda forma.
 * steps — bosqich nomlari, activeStep — joriy bosqich indeksi (0 dan).
 */
export default function AuthLayout({
  panelTitle,
  panelText,
  steps = [],
  activeStep = 0,
  title,
  subtitle,
  children,
}) {
  return (
    <div className="auth">
      <div className="auth__frame">
        <aside className="auth-panel" aria-label={tr('SportON')}>
          <div className="auth-panel__glow" aria-hidden="true" />
          <div className="auth-panel__content">
            <Link to="/" className="auth-panel__logo" aria-label={tr('Bosh sahifa')}>
              <BrandLogo tone="onPrimary" />
            </Link>
            <h2 className="auth-panel__title">{panelTitle}</h2>
            <p className="auth-panel__text">{panelText}</p>

            {steps.length > 0 && (
              <ol className="auth-steps">
                {steps.map((label, index) => {
                  const state = index < activeStep ? 'done' : index === activeStep ? 'active' : 'todo'
                  return (
                    <li
                      key={label}
                      className={`auth-steps__item auth-steps__item--${state}`}
                      aria-current={state === 'active' ? 'step' : undefined}
                    >
                      <span className="auth-steps__num" aria-hidden="true">
                        {state === 'done' ? <FiCheck /> : index + 1}
                      </span>
                      {tr(label)}
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </aside>

        <div className="auth-main">
          <Link to="/" className="auth-main__back">
            <FiArrowLeft />
            {tr('Bosh sahifa')}
          </Link>

          <div className="auth-main__inner">
            <header className="auth-main__head">
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </header>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
