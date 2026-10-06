import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'sporton-theme'
const CHANGE_EVENT = 'sporton-theme-change'

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  window.localStorage.setItem(STORAGE_KEY, theme)
  // TopBar va profil sozlamalari bir vaqtda ochiq bo‘lishi mumkin — holatini sinxronlaymiz
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: theme }))
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme)

  useEffect(() => {
    if (document.documentElement.getAttribute('data-theme') !== theme) applyTheme(theme)
  }, [theme])

  useEffect(() => {
    const onChange = (event) => setThemeState(event.detail)
    window.addEventListener(CHANGE_EVENT, onChange)
    return () => window.removeEventListener(CHANGE_EVENT, onChange)
  }, [])

  const setTheme = useCallback((next) => {
    const value = next === 'light' ? 'light' : 'dark'
    applyTheme(value)
    setThemeState(value)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const value = prev === 'dark' ? 'light' : 'dark'
      applyTheme(value)
      return value
    })
  }, [])

  return { theme, setTheme, toggleTheme }
}
