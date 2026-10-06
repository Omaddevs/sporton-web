import './IconButton.css'

export default function IconButton({ children, variant = 'dark', className = '', ...rest }) {
  return (
    <button className={`icon-btn icon-btn--${variant} ${className}`} {...rest}>
      {children}
    </button>
  )
}
