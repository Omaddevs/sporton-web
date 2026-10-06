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

const STEPS = ['Telefon raqamni kiriting', 'Telegram botdan kod oling', 'Yangi parol o‘rnating']
const STEP_INDEX = { phone: 0, code: 1, password: 2, done: 3 }

const HEADINGS = {
  phone: {
    title: 'Parolni tiklash',
    subtitle: 'Hisobingizga bog‘langan telefon raqamni kiriting.',
  },
  code: {
    title: 'Tasdiqlash kodi',
    subtitle: 'Kodni Telegram botimizdan oling va quyida kiriting.',
  },
  password: {
    title: 'Yangi parol',
    subtitle: 'Hisobingiz uchun yangi, ishonchli parol o‘ylab toping.',
  },
  done: {
    title: 'Parol yangilandi',
    subtitle: 'Endi yangi parolingiz bilan hisobingizga kirishingiz mumkin.',
  },
}

export default function ForgotPasswordPage() {
  const { linkState } = useAuthFlow('/')
  const [step, setStep] = useState('phone')
  const [phone, setPhone] = useState('')
  const [resetToken, setResetToken] = useState('')

  return (
    <AuthLayout
      panelTitle="Hisobingizni tiklang"
      panelText="Parolni unutdingizmi? Xavotir olmang — Telegram orqali bir daqiqada tiklaysiz."
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
            Hisobga kirish
          </Link>
        </div>
      )}

      {step !== 'done' && (
        <p className="auth-footer">
          Parolingiz esingizga tushdimi?
          <Link to="/kirish" state={linkState}>
            Kirish
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
      setError('Telefon raqamni to‘liq kiriting')
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
        hint="Ro‘yxatdan o‘tishda ko‘rsatgan raqamingiz."
        autoFocus
      />

      {notFound && (
        <FormAlert tone="info">
          Bu raqam bilan hisob topilmadi.{' '}
          <Link to="/royxatdan-otish" state={linkState} className="auth-link">
            Ro‘yxatdan o‘ting
          </Link>
        </FormAlert>
      )}

      <SubmitButton loading={loading}>Davom etish</SubmitButton>
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
      setError(`${CODE_LENGTH} xonali kodni to‘liq kiriting`)
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
          Raqam: <strong>{maskPhone(phone)}</strong>
        </span>
        <button type="button" className="auth-link" onClick={onBack}>
          O‘zgartirish
        </button>
      </div>

      <section className="auth-tg" aria-label="Telegram bot orqali kod olish">
        <div className="auth-tg__head">
          <span className="auth-tg__logo" aria-hidden="true">
            <FaTelegramPlane />
          </span>
          <div>
            <strong>@{TELEGRAM_BOT}</strong>
            <span>Rasmiy SportON boti</span>
          </div>
        </div>

        <ol className="auth-tg__steps">
          <li>
            <span>
              Botni oching va <strong>/start</strong> buyrug‘ini bosing.
            </span>
          </li>
          <li>
            <span>
              <strong>«Raqamni yuborish»</strong> tugmasi orqali telefon raqamingizni yuboring.
            </span>
          </li>
          <li>
            <span>
              Raqam bazamizda bo‘lsa, bot sizga <strong>{CODE_LENGTH} xonali kod</strong> yuboradi —
              uni quyida kiriting.
            </span>
          </li>
        </ol>

        <a className="auth-tg__btn" href={TELEGRAM_BOT_URL} target="_blank" rel="noreferrer">
          <FaTelegram />
          Telegram botni ochish
          <FiExternalLink aria-hidden="true" />
        </a>
      </section>

      <div className="auth-field">
        <span className="auth-field__label">Tasdiqlash kodi</span>
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
          Dev rejim (bot ulanmagan): kod — <code>{devCode}</code>
        </p>
      )}

      <div className="auth-code-meta">
        <span>Kod kelmadimi?</span>
        {seconds > 0 ? (
          <span aria-live="polite">
            Qayta yuborish: <strong>0:{String(seconds).padStart(2, '0')}</strong>
          </span>
        ) : (
          <button type="button" className="auth-link" onClick={resend} disabled={resending}>
            {resending ? 'Yuborilmoqda…' : 'Yangi kod olish'}
          </button>
        )}
      </div>

      <SubmitButton loading={loading}>Tasdiqlash</SubmitButton>

      <button type="button" className="auth-secondary" onClick={onBack}>
        <FiArrowLeft />
        Orqaga
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
    if (password.length < MIN_PASSWORD) next.password = `Parol kamida ${MIN_PASSWORD} ta belgidan iborat bo‘lsin`
    if (confirm !== password) next.confirm = 'Parollar mos kelmadi'
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
        label="Yangi parol"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Yangi parolni kiriting"
        autoComplete="new-password"
        error={errors.password}
        hint={`Kamida ${MIN_PASSWORD} ta belgi.`}
        autoFocus
      />
      <PasswordInput
        label="Parolni tasdiqlang"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Parolni qayta kiriting"
        autoComplete="new-password"
        error={errors.confirm}
      />
      <SubmitButton loading={loading}>Parolni saqlash</SubmitButton>
    </form>
  )
}
