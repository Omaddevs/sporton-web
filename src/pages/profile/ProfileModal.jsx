import { useEffect, useId, useRef, useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import Button from '../../components/ui/Button.jsx'
import { tr } from '../../i18n/index.js'

/** Native <dialog>: fokus tuzog‘i, Esc va fon ustida bosish bilan yopiladi */
export function ProfileModal({ open, title, onClose, onSubmit, submitLabel = tr('Saqlash'), danger, wide, children }) {
  const ref = useRef(null)
  const openRef = useRef(open)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    // Dasturiy yopilishda (open=false) «close» hodisasi onClose’ni qayta chaqirmasligi uchun
    openRef.current = open
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className={`pf-modal${wide ? ' pf-modal--wide' : ''}`}
      aria-labelledby={titleId}
      onClose={() => {
        if (openRef.current) onClose()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {open && (
        <form
          className="pf-modal__box"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit?.()
          }}
        >
          <div className="pf-modal__head">
            <h2 id={titleId}>{title}</h2>
            <button type="button" className="pf-modal__close" onClick={onClose} aria-label={tr('Yopish')}>
              <FiX />
            </button>
          </div>
          <div className="pf-modal__body">{children}</div>
          {onSubmit && (
            <div className="pf-modal__foot">
              <Button type="button" variant="outline" onClick={onClose}>
                {tr('Bekor qilish')}
              </Button>
              <Button type="submit" variant="primary" className={danger ? 'pf-btn-danger' : ''}>
                {submitLabel}
              </Button>
            </div>
          )}
        </form>
      )}
    </dialog>
  )
}

export function ConfirmModal({ open, title, text, confirmLabel = tr('Tasdiqlash'), onConfirm, onClose, danger = true }) {
  return (
    <ProfileModal
      open={open}
      title={title}
      onClose={onClose}
      onSubmit={onConfirm}
      submitLabel={confirmLabel}
      danger={danger}
    >
      <p className="pf-modal__text">{text}</p>
    </ProfileModal>
  )
}

export function Field({ label, error, hint, full, children }) {
  return (
    <label className={`pf-field${full ? ' pf-field--full' : ''}${error ? ' has-error' : ''}`}>
      <span className="pf-field__label">{label}</span>
      {children}
      {error ? <span className="pf-field__error">{error}</span> : hint && <span className="pf-field__hint">{hint}</span>}
    </label>
  )
}

/** Modal ichida native select — ro‘yxat modalning skroll maydoni bilan kesilib qolmaydi */
export function SelectInput({ value, onChange, options, ...rest }) {
  return (
    <select className="pf-input pf-select" value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
      {options.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  )
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="pf-toggle">
      <span className="pf-toggle__text">
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="pf-toggle__track" aria-hidden />
    </label>
  )
}

/** Teglar muharriri: chip’larni o‘chirish, Enter bilan yoki takliflardan qo‘shish */
export function TagEditor({ value, onChange, suggestions = [], placeholder, max = 20 }) {
  const [draft, setDraft] = useState('')
  const listId = useId()

  function add(raw) {
    const tag = raw.trim()
    if (!tag || value.length >= max) return
    if (value.some((item) => item.toLowerCase() === tag.toLowerCase())) return
    onChange([...value, tag])
    setDraft('')
  }

  const rest = suggestions.filter((item) => !value.includes(item))

  return (
    <div className="pf-tags-editor">
      <div className="profile-tags">
        {value.map((tag) => (
          <span key={tag} className="profile-tag">
            {tag}
            <button
              type="button"
              className="profile-tag__remove"
              aria-label={`${tag} — o‘chirish`}
              onClick={() => onChange(value.filter((item) => item !== tag))}
            >
              <FiX />
            </button>
          </span>
        ))}
        {!value.length && <span className="pf-muted">{tr('Hali hech narsa qo‘shilmagan')}</span>}
      </div>

      <div className="pf-tags-editor__add">
        <input
          className="pf-input"
          value={draft}
          list={listId}
          placeholder={placeholder}
          maxLength={40}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add(draft)
            }
          }}
        />
        <datalist id={listId}>
          {rest.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        <Button type="button" variant="outline" icon={<FiPlus />} onClick={() => add(draft)} disabled={!draft.trim()}>
          {tr('Qo‘shish')}
        </Button>
      </div>

      {rest.length > 0 && (
        <div className="pf-suggest">
          <span className="pf-muted">{tr('Tavsiyalar:')}</span>
          {rest.slice(0, 10).map((item) => (
            <button key={item} type="button" className="pf-suggest__chip" onClick={() => add(item)}>
              <FiPlus aria-hidden /> {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
