import { tr } from '../../i18n/index.js'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { FiCheck, FiLock, FiX } from 'react-icons/fi'
import { useAuth } from '../../context/auth.js'
import './AuthGate.css'

const REASONS = {
  complex: {
    title: tr('Majmua joylash uchun hisobingizga kiring'),
    text: tr('Sport majmuasini faqat ro‘yxatdan o‘tgan foydalanuvchilar joylay oladi. Bu bor-yo‘g‘i bir daqiqa vaqt oladi.'),
    benefits: ['Majmuangizni bepul joylang', 'Onlayn bronlarni qabul qiling', 'Mijozlar bilan to‘g‘ridan-to‘g‘ri yozishing'],
  },
  phone: {
    title: tr('Raqamni ko‘rish uchun ro‘yxatdan o‘ting'),
    text: tr('Majmualarning telefon raqamlari faqat ro‘yxatdan o‘tgan foydalanuvchilarga ko‘rinadi. Ro‘yxatdan o‘tish Telegram orqali bir daqiqa oladi.'),
    benefits: ['Barcha majmualar raqamlarini ko‘ring', 'Onlayn bron qiling', 'Sharh va izoh qoldiring'],
  },
  like: {
    title: tr('Yoqtirish uchun hisobingizga kiring'),
    text: tr('Yoqtirish va saqlash faqat ro‘yxatdan o‘tgan foydalanuvchilar uchun.'),
    benefits: ['Yoqqan joylaringizni saqlang', 'Majmualar raqamlarini ko‘ring', 'Sharh va izoh qoldiring'],
  },
  saved: {
    title: tr('Saqlanganlar — hisobingizda'),
    text: tr('Yoqqan majmua va mashg‘ulotlaringiz hisobingizga saqlanadi: telefonda ham, kompyuterda ham bir xil ko‘rinadi.'),
    benefits: ['Sevimli joylaringizni bir joyda saqlang', 'Majmualar raqamlarini ko‘ring', 'Onlayn bron qiling'],
  },
  event: {
    title: tr('Tadbirga yozilish uchun hisobingizga kiring'),
    text: tr('Ro‘yxatdan o‘tgan ishtirokchilar haqida tashkilotchi biladi, tadbir tafsilotlari esa sizga Telegram orqali keladi.'),
    benefits: ['Turnir va tadbirlarga yoziling', 'Eslatma va tafsilotlarni oling', 'Onlayn bron qiling'],
  },
  comment: {
    title: tr('Izoh yozish uchun hisobingizga kiring'),
    text: tr('Sharh va izohlarni faqat ro‘yxatdan o‘tgan (raqami tasdiqlangan) foydalanuvchilar qoldira oladi — bu soxta sharhlardan himoya qiladi.'),
    benefits: ['Fikringizni boshqalar bilan ulashing', 'Majmualar raqamlarini ko‘ring', 'Onlayn bron qiling'],
  },
}

/** «Kirish talab qilinadi» bloki: modal ichida ham, sahifada ham ishlatiladi */
export function AuthGateContent({ from, onNavigate, titleId, reason = 'complex' }) {
  const state = { from }
  const { title, text, benefits } = REASONS[reason] ?? REASONS.complex

  return (
    <div className="auth-gate">
      <span className="auth-gate__icon" aria-hidden="true">
        <FiLock />
      </span>
      <h2 id={titleId} className="auth-gate__title">
        {title}
      </h2>
      <p className="auth-gate__text">{text}</p>

      <ul className="auth-gate__list">
        {benefits.map((item) => (
          <li key={item}>
            <FiCheck aria-hidden="true" />
            {tr(item)}
          </li>
        ))}
      </ul>

      <div className="auth-gate__actions">
        <Link to="/royxatdan-otish" state={state} className="auth-gate__btn auth-gate__btn--primary" onClick={onNavigate}>
          {tr('Ro‘yxatdan o‘tish')}
        </Link>
        <Link to="/kirish" state={state} className="auth-gate__btn" onClick={onNavigate}>
          {tr('Hisobim bor — kirish')}
        </Link>
      </div>
    </div>
  )
}

/** Native <dialog>: fokus tuzog‘i, Esc va fon ustida bosish bilan yopiladi */
export function AuthGateModal({ open, onClose, from = '/majmua-qoshish', reason }) {
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
        <button type="button" className="auth-gate-modal__close" onClick={onClose} aria-label={tr('Yopish')}>
          <FiX />
        </button>
        {open && <AuthGateContent from={from} reason={reason} onNavigate={onClose} titleId="auth-gate-title" />}
      </div>
    </dialog>
  )
}

/** Himoyalangan sahifa: kirmagan foydalanuvchiga sahifa o‘rnida kirish oynasi ko‘rsatiladi */
export function RequireAuth({ children, from, reason }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return children

  return (
    <div className="auth-gate-page container">
      <div className="auth-gate-page__card">
        <AuthGateContent from={from} reason={reason} />
      </div>
    </div>
  )
}
