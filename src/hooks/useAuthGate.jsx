import { useContext } from 'react'
import { AuthGateContext } from '../context/authGate.js'

/**
 * Kirish talab qilinadigan amallar uchun: guard('like') — kirgan bo‘lsa true, aks holda
 * ro‘yxatdan o‘tish oynasini ochib false qaytaradi. Oynani AuthGateProvider bir marta chizadi
 * (modal — orqaga moslik uchun null).
 */
export function useAuthGate() {
  const value = useContext(AuthGateContext)
  if (!value) throw new Error('useAuthGate AuthGateProvider ichida ishlatilishi kerak')
  return { guard: value.guard, isAuthenticated: value.isAuthenticated, modal: null }
}
