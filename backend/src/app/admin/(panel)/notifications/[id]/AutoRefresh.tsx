'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

/** Yuborish tugaguncha sahifani avtomatik yangilab turadi */
export default function AutoRefresh({ seconds }: { seconds: number }) {
  const router = useRouter()
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), seconds * 1000)
    return () => clearInterval(timer)
  }, [router, seconds])
  return null
}
