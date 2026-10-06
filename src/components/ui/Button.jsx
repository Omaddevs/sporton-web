import './Button.css'

export default function Button({
  children,
  icon,
  variant = 'dark',
  iconPosition = 'start',
  className = '',
  ...rest
}) {
  const iconEl = icon && (
    <span className={`btn__icon ${iconPosition === 'end' ? 'btn__icon--end' : ''}`}>{icon}</span>
  )

  return (
    <button className={`btn btn--${variant} ${className}`} {...rest}>
      {iconPosition === 'start' && iconEl}
      {children && <span className="btn__label">{children}</span>}
      {iconPosition === 'end' && iconEl}
    </button>
  )
}
