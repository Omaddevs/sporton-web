import LogoIcon from '../icons/LogoIcon.jsx'
import './BrandLogo.css'
import { tr } from '../../i18n/index.js'

/**
 * SportON wordmark: belgi + «SPORT» + yashil «ON» plashka.
 * tone="onPrimary" — ko‘k fon ustida (oq matn), tone="default" — oddiy fon ustida.
 */
export default function BrandLogo({ size = 'md', tone = 'default', className = '' }) {
  return (
    <span
      className={`brand-logo brand-logo--${size} brand-logo--${tone} ${className}`.trim()}
      aria-label={tr('SportON')}
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
