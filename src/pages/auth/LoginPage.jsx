import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/auth.js'
import AuthLayout from '../../components/Auth/AuthLayout.jsx'
import {
  Divider,
  FormAlert,
  PasswordInput,
  PhoneInput,
  SocialButtons,
  SubmitButton,
} from '../../components/Auth/fields.jsx'
import { isValidPhone } from '../../utils/phone.js'
import { useAuthFlow } from './useAuthFlow.js'
import { tr } from '../../i18n/index.js'

export default function LoginPage() {
  const { login } = useAuth()
  const { finish, signInWith, providerLoading, providerError, linkState } = useAuthFlow('/')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const next = {}
    if (!isValidPhone(phone)) next.phone = tr('Telefon raqamni to‘liq kiriting')
    if (!password) next.password = tr('Parolni kiriting')
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return

    setLoading(true)
    try {
      await login({ phone, password })
      finish()
    } catch (err) {
      setFormError(err.message)
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      panelTitle={tr('Qaytganingizdan xursandmiz')}
      panelText={tr('Hisobingizga kiring va sport majmuangizni minglab mijozlarga ko‘rsating.')}
      steps={['Hisobingizga kiring', 'Majmuangizni joylang', 'Bronlarni qabul qiling']}
      activeStep={0}
      title={tr('Hisobga kirish')}
      subtitle={tr('Telefon raqamingiz va parolingizni kiriting.')}
    >
      <SocialButtons onSelect={signInWith} loading={providerLoading} />
      <Divider />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormAlert>{formError || providerError}</FormAlert>

        <PhoneInput
          value={phone}
          onChange={setPhone}
          error={errors.phone}
          autoFocus
        />

        <div className="auth-field">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={tr('Parolingizni kiriting')}
            autoComplete="current-password"
            error={errors.password}
          />
          <div className="auth-field__aside">
            <span />
            <Link to="/parolni-tiklash" state={linkState} className="auth-link">
              {tr('Parolni unutdingizmi?')}
            </Link>
          </div>
        </div>

        <SubmitButton loading={loading}>{tr('Kirish')}</SubmitButton>
      </form>

      <p className="auth-footer">
        {tr('Hisobingiz yo‘qmi?')}
        <Link to="/royxatdan-otish" state={linkState}>
          {tr('Ro‘yxatdan o‘tish')}
        </Link>
      </p>
    </AuthLayout>
  )
}
