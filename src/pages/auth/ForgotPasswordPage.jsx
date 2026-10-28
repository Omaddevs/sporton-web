import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiCheck, FiExternalLink } from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa6'
import { FaTelegramPlane } from 'react-icons/fa'
import {
  CODE_LENGTH,
  MIN_PASSWORD,
  RESEND_SECONDS,
  TELEGRAM_BOT,
  TELEGRAM_BOT_URL,
  peekDevCode,
  requestResetCode,
  resetPassword,
  verifyResetCode,
} from '../../services/authApi.js'
import AuthLayout from '../../components/Auth/AuthLayout.jsx'
import {
  FormAlert,
  OtpInput,
  PasswordInput,
  PhoneInput,
  SubmitButton,
} from '../../components/Auth/fields.jsx'
import { isValidPhone, maskPhone } from '../../utils/phone.js'
import { useAuthFlow } from './useAuthFlow.js'
import { tr } from '../../i18n/index.js'

const STEPS = ['Telefon raqamni kiriting', 'Telegram botdan kod oling', 'Yangi parol o‘rnating']
const STEP_INDEX = { phone: 0, code: 1, password: 2, done: 3 }

const HEADINGS = {
  phone: {
    title: tr('Parolni tiklash'),
    subtitle: tr('Hisobingizga bog‘langan telefon raqamni kiriting.'),
  },
  code: {
    title: tr('Tasdiqlash kodi'),
    subtitle: tr('Kodni Telegram botimizdan oling va quyida kiriting.'),
  },
  password: {
    title: tr('Yangi parol'),
    subtitle: tr('Hisobingiz uchun yangi, ishonchli parol o‘ylab toping.'),
  },
  done: {
    title: tr('Parol yangilandi'),
    subtitle: tr('Endi yangi parolingiz bilan hisobingizga kirishingiz mumkin.'),
  },
}

export default function ForgotPasswordPage() {
  const { linkState } = useAuthFlow('/')
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [resetToken, setResetToken] = useState('')

  return (
    <AuthLayout
      panelTitle={tr('Hisobingizni tiklang')}
      panelText={tr('Parolni unutdingizmi? Xavotir olmang — Telegram orqali bir daqiqada tiklaysiz.')}
      steps={STEPS}
      activeStep={STEP_INDEX[step]}
      {...HEADINGS[step]}
    >
      {step === 'phone' && (
        <PhoneStep
          phone={phone}
          setPhone={setPhone}
          linkState={linkState}
          onSent={() => setStep('code')}
        />
      )}

      {step === 'code' && (
        <CodeStep
          phone={phone}
          onBack={() => setStep('phone')}
          onVerified={(token) => {
            setResetToken(token)
            setStep('password')
          }}
        />
      )}

      {step === 'password' && (
        <PasswordStep resetToken={resetToken} onDone={() => setStep('done')} />
      )}

      {step === 'done' && (
        <div className="auth-success">
          <span className="auth-success__icon" aria-hidden="true">
            <FiCheck />
          </span>
          <Link to="/kirish" state={linkState} className="auth-submit">
            {tr('Hisobga kirish')}
          </Link>
        </div>
      )}

      {step !== 'done' && (
        <p className="auth-footer">
          {tr('Parolingiz esingizga tushdimi?')}
          <Link to="/kirish" state={linkState}>
            {tr('Kirish')}
          </Link>
        </p>
      )}
    </AuthLayout>
  )
}

function PhoneStep({ phone, setPhone, linkState, onSent }) {
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setNotFound(false)
    if (!isValidPhone(phone)) {
      setError(tr('Telefon raqamni to‘liq kiriting'))
      return
    }
    setError('')
    setLoading(true)
    try {
      await requestResetCode(phone)
      onSent()
    } catch (err) {
      setError(err.message)
      setNotFound(err.code === 'PHONE_NOT_FOUND')
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <PhoneInput
        value={phone}
        onChange={(value) => {
          setPhone(value)
          setError('')
          setNotFound(false)
        }}
        error={error}
        hint={tr('Ro‘yxatdan o‘tishda ko‘rsatgan raqamingiz.')}
        autoFocus
      />

      {notFound && (
        <FormAlert tone="info">
          {tr('Bu raqam bilan hisob topilmadi.')}{' '}
          <Link to="/royxatdan-otish" state={linkState} className="auth-link">
            {tr('Ro‘yxatdan o‘ting')}
          </Link>
        </FormAlert>
      )}

      <SubmitButton loading={loading}>{tr('Davom etish')}</SubmitButton>
    </form>
  )
}

function CodeStep({ phone, onBack, onVerified }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  const [resending, setResending] = useState(false)
  const devCode = peekDevCode(phone)

  useEffect(() => {
    if (seconds <= 0) return undefined
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [seconds])

  async function verify(value) {
    if (value.length !== CODE_LENGTH) {
      setError(tr('{n} xonali kodni to‘liq kiriting', { n: CODE_LENGTH }))
      return
    }
    setError('')
    setLoading(true)
    try {
      const { resetToken } = await verifyResetCode(phone, value)
      onVerified(resetToken)
    } catch (err) {
      setError(err.message)
      setCode('')
      setLoading(false)
    }
  }

  function handleChange(value) {
    setCode(value)
    setError('')
    // Oxirgi raqam kiritilganda avtomatik tekshiramiz
    if (value.length === CODE_LENGTH && !loading) verify(value)
  }

  async function resend() {
    setResending(true)
    setError('')
    try {
      await requestResetCode(phone)
      setCode('')
      setSeconds(RESEND_SECONDS)
    } catch (err) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <form
      className="auth-form"
      onSubmit={(e) => {
        e.preventDefault()
        verify(code)
      }}
      noValidate
    >
      <div className="auth-code-meta">
        <span>
          {tr('Raqam:')} <strong>{maskPhone(phone)}</strong>
        </span>
        <button type="button" className="auth-link" onClick={onBack}>
          {tr('O‘zgartirish')}
        </button>
      </div>

      <section className="auth-tg" aria-label={tr('Telegram bot orqali kod olish')}>
        <div className="auth-tg__head">
          <span className="auth-tg__logo" aria-hidden="true">
            <FaTelegramPlane />
          </span>
          <div>
            <strong>@{TELEGRAM_BOT}</strong>
            <span>{tr('Rasmiy SportON boti')}</span>
          </div>
        </div>

        <ol className="auth-tg__steps">
          <li>
            <span>
              {tr('Botni oching va')} <strong>/start</strong> {tr('buyrug‘ini bosing.')}
            </span>
          </li>
          <li>
            <span>
              <strong>{tr('«Raqamni yuborish»')}</strong> {tr('tugmasi orqali telefon raqamingizni yuboring.')}
            </span>
          </li>
          <li>
            <span>
              {tr('Raqam bazamizda bo‘lsa, bot sizga')} <strong>{CODE_LENGTH} {tr('xonali kod')}</strong> {tr('yuboradi — uni quyida kiriting.')}
            </span>
          </li>
        </ol>

        <a className="auth-tg__btn" href={TELEGRAM_BOT_URL} target="_blank" rel="noreferrer">
          <FaTelegram />
          {tr('Telegram botni ochish')}
          <FiExternalLink aria-hidden="true" />
        </a>
      </section>

      <div className="auth-field">
        <span className="auth-field__label">{tr('Tasdiqlash kodi')}</span>
        <OtpInput
          length={CODE_LENGTH}
          value={code}
          onChange={handleChange}
          error={error}
          disabled={loading}
          autoFocus
        />
        {error && (
          <p className="auth-field__error" role="alert">
            {error}
          </p>
        )}
      </div>

      {devCode && (
        <p className="auth-dev-hint">
          {tr('Dev rejim (bot ulanmagan): kod —')} <code>{devCode}</code>
        </p>
      )}

      <div className="auth-code-meta">
        <span>{tr('Kod kelmadimi?')}</span>
        {seconds > 0 ? (
          <span aria-live="polite">
            {tr('Qayta yuborish:')} <strong>0:{String(seconds).padStart(2, '0')}</strong>
          </span>
        ) : (
          <button type="button" className="auth-link" onClick={resend} disabled={resending}>
            {resending ? tr('Yuborilmoqda…') : tr('Yangi kod olish')}
          </button>
        )}
      </div>

      <SubmitButton loading={loading}>{tr('Tasdiqlash')}</SubmitButton>

      <button type="button" className="auth-secondary" onClick={onBack}>
        <FiArrowLeft />
        {tr('Orqaga')}
      </button>
    </form>
  )
}

function PasswordStep({ resetToken, onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const next = {}
    if (password.length < MIN_PASSWORD) next.password = tr('Parol kamida {n} ta belgidan iborat bo‘lsin', { n: MIN_PASSWORD })
    if (confirm !== password) next.confirm = tr('Parollar mos kelmadi')
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return

    setLoading(true)
    try {
      await resetPassword(resetToken, password)
      onDone()
    } catch (err) {
      setFormError(err.message)
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <FormAlert>{formError}</FormAlert>
      <PasswordInput
        label={tr('Yangi parol')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={tr('Yangi parolni kiriting')}
        autoComplete="new-password"
        error={errors.password}
        hint={tr('Kamida {n} ta belgi.', { n: MIN_PASSWORD })}
        autoFocus
      />
      <PasswordInput
        label={tr('Parolni tasdiqlang')}
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder={tr('Parolni qayta kiriting')}
        autoComplete="new-password"
        error={errors.confirm}
      />
      <SubmitButton loading={loading}>{tr('Parolni saqlash')}</SubmitButton>
    </form>
  )
}
