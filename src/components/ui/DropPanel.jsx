/**
 * Shared animated dropdown panel.
 * Keep mounted and toggle `open` so open + close both animate smoothly.
 */
export default function DropPanel({
  open,
  className = '',
  center = false,
  origin = 'center',
  children,
  ...rest
}) {
  const originClass =
    origin === 'start'
      ? 'drop-panel--origin-start'
      : origin === 'end'
        ? 'drop-panel--origin-end'
        : ''

  return (
    <div
      className={[
        'drop-panel',
        open ? 'is-open' : '',
        center ? 'drop-panel--center' : '',
        originClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden={!open}
      inert={open ? undefined : true}
      {...rest}
    >
      {children}
    </div>
  )
}
