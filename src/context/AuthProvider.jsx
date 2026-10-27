import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../services/authApi.js'
import { disablePush } from '../services/push.js'
import { syncFavorites } from '../hooks/useSaved.js'
import { AuthContext } from './auth.js'

// Sessiyaning o‘zi httpOnly cookie’da. Bu yerda faqat UI darhol chizilishi uchun profil nusxasi
const SESSION_KEY = 'sporton-session'

function readSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(user) {
  try {
    if (user) window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(readSession)

  const start = useCallback((next) => {
    saveSession(next)
    setUser(next)
    return next
  }, [])

  // Sessiyani server bilan tekshiramiz: cookie muddati tugagan yoki bloklangan bo‘lsa — chiqaramiz
  useEffect(() => {
    let active = true
    authApi
      .fetchMe()
      .then((me) => {
        if (active) start(me)
      })
      .catch(() => {
        /* tarmoq xatosi — saqlangan nusxa bilan davom etamiz */
      })
    return () => {
      active = false
    }
  }, [start])

  // Saqlanganlar hisobga bog‘langan: foydalanuvchi o‘zgarganda serverdan qayta yuklanadi
  const userId = user?.id ?? null
  useEffect(() => {
    syncFavorites(userId)
  }, [userId])

  const login = useCallback((data) => authApi.login(data).then(start), [start])
  const register = useCallback((data) => authApi.register(data).then(start), [start])
  const loginWithProvider = useCallback((provider) => authApi.loginWithProvider(provider).then(start), [start])
  const refresh = useCallback((next) => start(next), [start])
  const logout = useCallback(async () => {
    // Umumiy qurilmada boshqa odam bu hisobning push xabarlarini olmasin
    await disablePush().catch(() => null)
    start(null)
    return authApi.logout()
  }, [start])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, register, loginWithProvider, logout, refresh }),
    [user, login, register, loginWithProvider, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
