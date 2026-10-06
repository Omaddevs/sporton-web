import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck, FiLock, FiX } from 'react-icons/fi'
import { useAuth } from '../../context/auth.js'
import './AuthGate.css'

const BENEFITS = [
  'Majmuangizni bepul joylang',
  'Onlayn bronlarni qabul qiling',
  'Mijozlar bilan to‘g‘ridan-to‘g‘ri yozishing',
]

/** «Kirish talab qilinadi» bloki: modal ichida ham, sahifada ham ishlatiladi */
export function AuthGateContent({ from, onNavigate, titleId }) {
  const state = { from }

  return (
    <div className="auth-gate">
      <span className="auth-gate__icon" aria-hidden="true">
        <FiLock />
      </span>
      <h2 id={titleId} className="auth-gate__title">
        Majmua joylash uchun hisobingizga kiring
      </h2>
      <p className="auth-gate__text">
        Sport majmuasini faqat ro‘yxatdan o‘tgan foydalanuvchilar joylay oladi. Bu bor-yo‘g‘i bir
        daqiqa vaqt oladi.
      </p>

      <ul className="auth-gate__list">
        {BENEFITS.map((item) => (
          <li key={item}>
            <FiCheck aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>

      <div className="auth-gate__actions">
        <Link to="/royxatdan-otish" state={state} className="auth-gate__btn auth-gate__btn--primary" onClick={onNavigate}>
          Ro‘yxatdan o‘tish
        </Link>
        <Link to="/kirish" state={state} className="auth-gate__btn" onClick={onNavigate}>
          Hisobim bor — kirish
        </Link>
      </div>
    </div>
  )
}

/** Native <dialog>: fokus tuzog‘i, Esc va fon ustida bosish bilan yopiladi */
export function AuthGateModal({ open, onClose, from = '/majmua-qoshish' }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="auth-gate-modal"
      aria-labelledby="auth-gate-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="auth-gate-modal__box">
        <button type="button" className="auth-gate-modal__close" onClick={onClose} aria-label="Yopish">
          <FiX />
        </button>
        {open && <AuthGateContent from={from} onNavigate={onClose} titleId="auth-gate-title" />}
      </div>
    </dialog>
  )
}

/** Himoyalangan sahifa: kirmagan foydalanuvchiga sahifa o‘rnida kirish oynasi ko‘rsatiladi */
export function RequireAuth({ children, from }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return children

  return (
    <div className="auth-gate-page container">
      <div className="auth-gate-page__card">
        <AuthGateContent from={from} />
      </div>
    </div>
  )
}
