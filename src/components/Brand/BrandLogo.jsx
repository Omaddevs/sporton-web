import LogoIcon from '../icons/LogoIcon.jsx'
import './BrandLogo.css'

/**
 * SportON wordmark: belgi + «SPORT» + yashil «ON» plashka.
 * tone="onPrimary" — ko‘k fon ustida (oq matn), tone="default" — oddiy fon ustida.
 */
export default function BrandLogo({ size = 'md', tone = 'default', className = '' }) {
  return (
    <span
      className={`brand-logo brand-logo--${size} brand-logo--${tone} ${className}`.trim()}
      aria-label="SportON"
      role="img"
    >
      <LogoIcon className="brand-logo__mark" size={24} />
      <span className="brand-logo__word" aria-hidden="true">
        SPORT
      </span>
      <span className="brand-logo__on" aria-hidden="true">
        ON
      </span>
    </span>
  )
}
