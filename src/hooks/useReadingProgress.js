import { useEffect, useState } from 'react'

/** Element bo‘ylab o‘qish progressi (0–1) */
export function useReadingProgress(ref) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight * 0.5
      const passed = window.innerHeight * 0.5 - rect.top
      setProgress(Math.min(1, Math.max(0, total > 0 ? passed / total : 0)))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [ref])

  return progress
}
