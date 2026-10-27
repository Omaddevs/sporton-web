import { tr } from '../../i18n/index.js'
import { useId, useRef, useState } from 'react'
import { FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { FaTelegram } from 'react-icons/fa6'
import { formatLocal, PHONE_PREFIX, toLocalDigits } from '../../utils/phone.js'

/** Yorliq + boshqaruv elementi + xato/izoh matni */
export function Field({ label, error, hint, children, className = '' }) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={`auth-field ${error ? 'has-error' : ''} ${className}`}>
      {label && (
        <label htmlFor={id} className="auth-field__label">
          {label}
        </label>
      )}
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy })}
      {error ? (
        <p id={`${id}-error`} className="auth-field__error" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="auth-field__hint">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function TextInput({ label, error, hint, ...props }) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(a11y) => <input className="auth-input" {...a11y} {...props} />}
    </Field>
  )
}

/** +998 prefiksli telefon maydoni; value — 9 ta mahalliy raqam */
export function PhoneInput({ label = 'Telefon raqam', error, hint, value, onChange, ...props }) {
  return (
    <Field label={label} error={error} hint={hint}>
      {(a11y) => (
        <div className="auth-input auth-input--group">
          <span className="auth-input__prefix" aria-hidden="true">
            <span className="auth-input__flag">🇺🇿</span>
            {PHONE_PREFIX}
          </span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="90 123 45 67"
            value={formatLocal(value)}
            onChange={(e) => onChange(toLocalDigits(e.target.value))}
            {...a11y}
            {...props}
          />
        </div>
      )}
    </Field>
  )
}

export function PasswordInput({ label = 'Parol', error, hint, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <Field label={label} error={error} hint={hint}>
      {(a11y) => (
        <div className="auth-input auth-input--group">
          <input type={visible ? 'text' : 'password'} {...a11y} {...props} />
          <button
            type="button"
            className="auth-input__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? tr('Parolni yashirish') : tr('Parolni ko‘rsatish')}
            aria-pressed={visible}
          >
            {visible ? <FiEye /> : <FiEyeOff />}
          </button>
        </div>
      )}
    </Field>
  )
}

/** 6 katakli tasdiqlash kodi: yozish, o‘chirish, strelkalar va joylashtirish (paste) */
export function OtpInput({ length = 6, value, onChange, error, disabled, autoFocus }) {
  const refs = useRef([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  function focus(index) {
    refs.current[Math.max(0, Math.min(length - 1, index))]?.focus()
  }

  function setAt(index, char) {
    const next = digits.slice()
    next[index] = char
    onChange(next.join('').slice(0, length))
  }

  function handleChange(index, raw) {
    const chars = raw.replace(/\D/g, '')
    if (!chars) return
    if (chars.length > 1) {
      // Avtoto‘ldirish yoki paste: bir nechta raqamni ketma-ket joylaymiz
      const next = (digits.slice(0, index).join('') + chars).slice(0, length)
      onChange(next)
      focus(next.length)
      return
    }
    setAt(index, chars)
    focus(index + 1)
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (digits[index]) setAt(index, '')
      else if (index > 0) {
        setAt(index - 1, '')
        focus(index - 1)
      }
    } else if (event.key === 'ArrowLeft') focus(index - 1)
    else if (event.key === 'ArrowRight') focus(index + 1)
  }

  function handlePaste(event) {
    const chars = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!chars) return
    event.preventDefault()
    onChange(chars)
    focus(chars.length)
  }

  return (
    <div className={`auth-otp ${error ? 'has-error' : ''}`} role="group" aria-label={tr('Tasdiqlash kodi')}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el
          }}
          className={`auth-otp__cell ${digit ? 'is-filled' : ''}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`${index + 1}-raqam`}
          aria-invalid={Boolean(error)}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  )
}

// Ijtimoiy kirish hozircha o‘chiq: hisob faqat Telegram bot orqali tasdiqlangan raqam bilan ochiladi
const SOCIAL_SOON = true

export function SocialButtons({ onSelect, loading }) {
  const soon = SOCIAL_SOON && <span className="auth-social__soon">{tr('Tez orada')}</span>
  return (
    <div className="auth-social">
      <button
        type="button"
        className="auth-social__btn"
        onClick={() => onSelect('google')}
        disabled={SOCIAL_SOON || Boolean(loading)}
        aria-label={SOCIAL_SOON ? tr('Google orqali kirish — tez orada') : undefined}
      >
        {loading === 'google' ? <Spinner /> : <FcGoogle />}
        {tr('Google')}
        {soon}
      </button>
      <button
        type="button"
        className="auth-social__btn"
        onClick={() => onSelect('telegram')}
        disabled={SOCIAL_SOON || Boolean(loading)}
        aria-label={SOCIAL_SOON ? tr('Telegram orqali kirish — tez orada') : undefined}
      >
        {loading === 'telegram' ? <Spinner /> : <FaTelegram className="auth-social__tg" />}
        {tr('Telegram')}
        {soon}
      </button>
    </div>
  )
}

export function Divider({ children = 'Yoki' }) {
  return (
    <div className="auth-divider" role="separator">
      <span>{children}</span>
    </div>
  )
}

export function SubmitButton({ loading, children, ...props }) {
  return (
    <button type="submit" className="auth-submit" disabled={loading} aria-busy={loading} {...props}>
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export function FormAlert({ children, tone = 'error' }) {
  if (!children) return null
  return (
    <div className={`auth-alert auth-alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <FiAlertCircle aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export function Spinner() {
  return <span className="auth-spinner" aria-hidden="true" />
}
