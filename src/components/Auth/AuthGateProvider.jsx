import { useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/auth.js'
import { AuthGateContext } from '../../context/authGate.js'
import { AuthGateModal } from './AuthGate.jsx'

/**
 * Butun ilova uchun bitta «ro‘yxatdan o‘ting» oynasi. Har qanday komponent yoki hook
 * guard('like') chaqiradi: kirgan bo‘lsa true, aks holda oyna ochiladi va false qaytadi.
 */
export default function AuthGateProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const [reason, setReason] = useState(null)

  const guard = useCallback(
    (next) => {
      if (isAuthenticated) return true
      setReason(next)
      return false
    },
    [isAuthenticated],
  )
  const value = useMemo(() => ({ guard, isAuthenticated }), [guard, isAuthenticated])

  return (
    <AuthGateContext.Provider value={value}>
      {children}
      {reason !== null && (
        <AuthGateModal open reason={reason} from={location.pathname + location.search} onClose={() => setReason(null)} />
      )}
    </AuthGateContext.Provider>
  )
}
