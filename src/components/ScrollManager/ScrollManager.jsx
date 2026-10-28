import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/**
 * Yangi sahifaga o‘tganda tepaga qaytaradi, `/#bolim` havolalarida esa o‘sha bo‘limga scroll qiladi.
 * Orqaga/oldinga (POP) o‘tishda brauzer pozitsiyasiga tegilmaydi.
 */
export default function ScrollManager() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (!hash) {
      if (navigationType !== 'POP') window.scrollTo({ top: 0, behavior: 'instant' })
      return undefined
    }
    // Bo‘lim hali chizilmagan bo‘lishi mumkin (lazy sahifa) — bir necha kadr kutamiz
    let frame = 0
    let tries = 0
    const find = () => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else if (tries++ < 30) frame = requestAnimationFrame(find)
    }
    find()
    return () => cancelAnimationFrame(frame)
  }, [pathname, hash, navigationType])

  return null
}
