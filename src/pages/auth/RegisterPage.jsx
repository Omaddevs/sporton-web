import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi'
import { FaTelegram } from 'react-icons/fa6'
import { FaTelegramPlane } from 'react-icons/fa'
import { useAuth } from '../../context/auth.js'
import {
  CODE_LENGTH,
  MIN_PASSWORD,
  RESEND_SECONDS,
  TELEGRAM_BOT,
  TELEGRAM_REGISTER_URL,
  peekDevCode,
  startRegistration,
} from '../../services/authApi.js'
import AuthLayout from '../../components/Auth/AuthLayout.jsx'
import {
  Divider,
  FormAlert,
  OtpInput,
  PasswordInput,
  PhoneInput,
  SocialButtons,
  SubmitButton,
  TextInput,
} from '../../components/Auth/fields.jsx'
import { isValidPhone, maskPhone } from '../../utils/phone.js'
import { useAuthFlow } from './useAuthFlow.js'
import { tr } from '../../i18n/index.js'

const EMPTY = { firstName: '', lastName: '', phone: '', password: '', consent: false }

const STEPS = ['Ma’lumotlaringizni kiriting', 'Telegram botdan kod oling', 'Kodni kiriting — hisob tayyor']

function validate(form) {
  const errors = {}
  if (form.firstName.trim().length < 2) errors.firstName = tr('Ismingizni kiriting')
  if (form.lastName.trim().length < 2) errors.lastName = tr('Familiyangizni kiriting')
  if (!isValidPhone(form.phone)) errors.phone = tr('Telefon raqamni to‘liq kiriting')
  if (form.password.length < MIN_PASSWORD) errors.password = `Parol kamida ${MIN_PASSWORD} ta belgidan iborat bo‘lsin`
  if (!form.consent) errors.consent = tr('Davom etish uchun rozilik bering')
  return errors
}

export default function RegisterPage() {
  const { finish, signInWith, providerLoading, providerError, linkState } = useAuthFlow('/')
  const [form, setForm] = useState(EMPTY)
  const [step, setStep] = useState('form')

  return (
    <AuthLayout
      panelTitle={tr('Biz bilan boshlang')}
      panelText={tr('Raqamingiz Telegram bot orqali tasdiqlanadi — bu sizni va majmualarni soxta hisoblardan himoya qiladi.')}
      steps={STEPS}
      activeStep={step === 'form' ? 0 : 1}
      title={step === 'form' ? tr('Ro‘yxatdan o‘tish') : tr('Raqamni tasdiqlang')}
      subtitle={
        step === 'form'
          ? tr('Hisob yaratish uchun ma’lumotlaringizni kiriting.')
          : tr('Kodni Telegram botimizdan oling va quyida kiriting.')
      }
    >
      {step === 'form' ? (
        <FormStep
          form={form}
          setForm={setForm}
          onNext={() => setStep('code')}
          signInWith={signInWith}
          providerLoading={providerLoading}
          providerError={providerError}
        />
      ) : (
        <CodeStep form={form} onBack={() => setStep('form')} onDone={finish} />
      )}

      <p className="auth-footer">
        {tr('Hisobingiz bormi?')}
        <Link to="/kirish" state={linkState}>
          {tr('Kirish')}
        </Link>
      </p>
    </AuthLayout>
  )
}

function FormStep({ form, setForm, onNext, signInWith, providerLoading, providerError }) {
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (key) => (event) => {
    const value = key === 'phone' ? event : event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const next = validate(form)
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return

    setLoading(true)
    try {
      await startRegistration(form.phone)
      onNext()
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message })
      else setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SocialButtons onSelect={signInWith} loading={providerLoading} />
      <Divider />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormAlert>{formError || providerError}</FormAlert>

        <div className="auth-row">
          <TextInput
            label={tr('Ism')}
            placeholder={tr('Masalan, Aziz')}
            autoComplete="given-name"
            value={form.firstName}
            onChange={update('firstName')}
            error={errors.firstName}
            autoFocus
          />
          <TextInput
            label={tr('Familiya')}
            placeholder={tr('Masalan, Rahimov')}
            autoComplete="family-name"
            value={form.lastName}
            onChange={update('lastName')}
            error={errors.lastName}
          />
        </div>

        <PhoneInput
          value={form.phone}
          onChange={update('phone')}
          error={errors.phone}
          hint={tr('Telegram hisobingiz ochilgan raqam — bot aynan shu raqamga kod beradi.')}
        />

        <PasswordInput
          value={form.password}
          onChange={update('password')}
          placeholder={tr('Parol o‘ylab toping')}
          autoComplete="new-password"
          error={errors.password}
          hint={`Kamida ${MIN_PASSWORD} ta belgi.`}
        />

        <div className="auth-field">
          <label className="auth-consent">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={update('consent')}
              aria-invalid={Boolean(errors.consent)}
            />
            <span>
              {tr('Shaxsiy ma’lumotlarimni qayta ishlash va ularni uchinchi shaxslarga berishga roziman.')}{' '}
              <Link to="/sahifa/maxfiylik-siyosati" target="_blank">
                {tr('Maxfiylik siyosati')}
              </Link>{' '}
              va{' '}
              <Link to="/sahifa/foydalanish-shartlari" target="_blank">
                {tr('Foydalanish shartlari')}
              </Link>
            </span>
          </label>
          {errors.consent && (
            <p className="auth-field__error" role="alert">
              {errors.consent}
            </p>
          )}
        </div>

        <SubmitButton loading={loading}>{tr('Davom etish — kod olish')}</SubmitButton>
      </form>
    </>
  )
}

function CodeStep({ form, onBack, onDone }) {
  const { register } = useAuth()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  const devCode = peekDevCode(form.phone)

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
      await register({ ...form, code: value })
      onDone()
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
          {tr('Raqam:')} <strong>{maskPhone(form.phone)}</strong>
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
              <strong>{tr('«Raqamni yuborish»')}</strong> {tr('tugmasi orqali raqamingizni yuboring. Telegram’dagi raqam')}{' '}
              <strong>{maskPhone(form.phone)}</strong> {tr('bilan bir xil bo‘lishi kerak.')}
            </span>
          </li>
          <li>
            <span>
              {tr('Bot sizga')} <strong>{CODE_LENGTH} {tr('xonali kod')}</strong> {tr('yuboradi — uni quyida kiriting.')}
            </span>
          </li>
        </ol>

        <a className="auth-tg__btn" href={TELEGRAM_REGISTER_URL} target="_blank" rel="noreferrer">
          <FaTelegram />
          {tr('Telegram botni ochish')}
          <FiExternalLink aria-hidden="true" />
        </a>
      </section>

      <div className="auth-field">
        <span className="auth-field__label">{tr('Tasdiqlash kodi')}</span>
        <OtpInput length={CODE_LENGTH} value={code} onChange={handleChange} error={error} disabled={loading} autoFocus />
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
            {tr('Qayta urinish:')} <strong>0:{String(seconds).padStart(2, '0')}</strong>
          </span>
        ) : (
          <a
            className="auth-link"
            href={TELEGRAM_REGISTER_URL}
            target="_blank"
            rel="noreferrer"
            onClick={() => setSeconds(RESEND_SECONDS)}
          >
            {tr('Botda raqamni qayta yuboring')}
          </a>
        )}
      </div>

      <SubmitButton loading={loading}>{tr('Tasdiqlash va ro‘yxatdan o‘tish')}</SubmitButton>

      <button type="button" className="auth-secondary" onClick={onBack}>
        <FiArrowLeft />
        {tr('Orqaga')}
      </button>
    </form>
  )
}
