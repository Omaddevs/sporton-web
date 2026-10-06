import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth.js'

/** Kirish/ro‘yxatdan o‘tishdan keyin foydalanuvchini kelgan sahifasiga qaytaradi */
export function useAuthFlow(fallback = '/') {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithProvider } = useAuth()
  const [providerLoading, setProviderLoading] = useState(null)
  const [providerError, setProviderError] = useState('')
  const from = location.state?.from ?? fallback

  const finish = () => navigate(from, { replace: true })

  async function signInWith(provider) {
    setProviderError('')
    setProviderLoading(provider)
    try {
      await loginWithProvider(provider)
      finish()
    } catch (err) {
      setProviderError(err.message)
      setProviderLoading(null)
    }
  }

  // Auth sahifalari orasida o‘tganda «qayerdan kelgan» ma’lumoti saqlanadi
  const linkState = location.state?.from ? { from: location.state.from } : undefined

  return { from, finish, signInWith, providerLoading, providerError, linkState }
}
