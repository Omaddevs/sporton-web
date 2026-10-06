import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/auth.js'
import { MIN_PASSWORD } from '../../services/authApi.js'
import AuthLayout from '../../components/Auth/AuthLayout.jsx'
import {
  Divider,
  FormAlert,
  PasswordInput,
  PhoneInput,
  SocialButtons,
  SubmitButton,
  TextInput,
} from '../../components/Auth/fields.jsx'
import { isValidPhone } from '../../utils/phone.js'
import { useAuthFlow } from './useAuthFlow.js'

const EMPTY = { firstName: '', lastName: '', phone: '', password: '', consent: false }

function validate(form) {
  const errors = {}
  if (form.firstName.trim().length < 2) errors.firstName = 'Ismingizni kiriting'
  if (form.lastName.trim().length < 2) errors.lastName = 'Familiyangizni kiriting'
  if (!isValidPhone(form.phone)) errors.phone = 'Telefon raqamni to‘liq kiriting'
  if (form.password.length < MIN_PASSWORD) errors.password = `Parol kamida ${MIN_PASSWORD} ta belgidan iborat bo‘lsin`
  if (!form.consent) errors.consent = 'Davom etish uchun rozilik bering'
  return errors
}

export default function RegisterPage() {
  const { register } = useAuth()
  // Ro‘yxatdan o‘tgach — majmua qo‘shish sahifasiga
  const { finish, signInWith, providerLoading, providerError, linkState } = useAuthFlow('/')
  const [form, setForm] = useState(EMPTY)
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
      await register(form)
      finish()
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message })
      else setFormError(err.message)
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      panelTitle="Biz bilan boshlang"
      panelText="Bir necha oddiy qadam — va sport majmuangiz platformada."
      steps={['Hisob yarating', 'Majmua ma’lumotlarini kiriting', 'E’loningizni joylang']}
      activeStep={0}
      title="Ro‘yxatdan o‘tish"
      subtitle="Hisob yaratish uchun ma’lumotlaringizni kiriting."
    >
      <SocialButtons onSelect={signInWith} loading={providerLoading} />
      <Divider />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormAlert>{formError || providerError}</FormAlert>

        <div className="auth-row">
          <TextInput
            label="Ism"
            placeholder="Masalan, Aziz"
            autoComplete="given-name"
            value={form.firstName}
            onChange={update('firstName')}
            error={errors.firstName}
            autoFocus
          />
          <TextInput
            label="Familiya"
            placeholder="Masalan, Rahimov"
            autoComplete="family-name"
            value={form.lastName}
            onChange={update('lastName')}
            error={errors.lastName}
          />
        </div>

        <PhoneInput value={form.phone} onChange={update('phone')} error={errors.phone} />

        <PasswordInput
          value={form.password}
          onChange={update('password')}
          placeholder="Parol o‘ylab toping"
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
              Shaxsiy ma’lumotlarimni qayta ishlash va ularni uchinchi shaxslarga berishga roziman.{' '}
              <Link to="/sahifa/maxfiylik-siyosati" target="_blank">
                Maxfiylik siyosati
              </Link>{' '}
              va{' '}
              <Link to="/sahifa/foydalanish-shartlari" target="_blank">
                Foydalanish shartlari
              </Link>
            </span>
          </label>
          {errors.consent && (
            <p className="auth-field__error" role="alert">
              {errors.consent}
            </p>
          )}
        </div>

        <SubmitButton loading={loading}>Ro‘yxatdan o‘tish</SubmitButton>
      </form>

      <p className="auth-footer">
        Hisobingiz bormi?
        <Link to="/kirish" state={linkState}>
          Kirish
        </Link>
      </p>
    </AuthLayout>
  )
}
