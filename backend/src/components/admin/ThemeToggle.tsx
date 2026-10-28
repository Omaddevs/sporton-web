'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export const THEME_COOKIE = 'adm-theme'
type Theme = 'light' | 'dark'

/** Yorug‘/qorong‘i mavzu. Tanlov cookie’da saqlanadi — server keyingi sahifani darhol shu mavzuda chizadi */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    const chosen = document.documentElement.dataset.theme
    setTheme(chosen === 'light' || chosen === 'dark' ? chosen : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
    setTheme(next)
  }

  const dark = theme === 'dark'
  return (
    <button type="button" className="btn btn--block btn--sm" onClick={toggle} aria-label="Mavzuni almashtirish">
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      {dark ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
    </button>
  )
}
