import { useEffect, useState } from 'react'
import { FiPhone } from 'react-icons/fi'
import { phoneHref } from '../../data/complexes.js'
import { useAuthGate } from '../../hooks/useAuthGate.jsx'
import { api } from '../../services/apiClient.js'
import { tr } from '../../i18n/index.js'

export const MASKED_PHONE = '+998 ** *** ** **'

// Bir sahifada bir necha joyda chiqadi — raqam har majmua uchun bir marta so‘raladi
const cache = new Map()

function loadPhone(complexId) {
  if (!cache.has(complexId)) {
    const request = api(`/complexes/${encodeURIComponent(complexId)}/contact`)
      .then((data) => data.phone ?? null)
      .catch((error) => {
        cache.delete(complexId)
        throw error
      })
    cache.set(complexId, request)
  }
  return cache.get(complexId)
}

/**
 * Majmua telefoni: mehmonga «+998 ** *** ** **» ko‘rinadi, bosilsa ro‘yxatdan o‘tish oynasi ochiladi.
 * Kirgan foydalanuvchiga haqiqiy raqam backenddan olinadi (katalogda raqam yo‘q).
 * label — raqam o‘rniga ko‘rsatiladigan matn (masalan, «Qo‘ng‘iroq»); bo‘lmasa raqamning o‘zi.
 */
export default function PhoneReveal({ complexId, className, label, icon = true }) {
  const { guard, modal, isAuthenticated } = useAuthGate()
  const [phone, setPhone] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return undefined
    let cancelled = false
    loadPhone(complexId)
      .then((value) => !cancelled && setPhone(value))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [complexId, isAuthenticated])

  if (isAuthenticated && phone) {
    return (
      <a href={phoneHref(phone)} className={className}>
        {icon && <FiPhone />} {label ?? phone}
      </a>
    )
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => guard('phone')}
        disabled={isAuthenticated && !failed}
        aria-label={tr('Telefon raqamini ko‘rish')}
      >
        {icon && <FiPhone />} {label ?? MASKED_PHONE}
      </button>
      {modal}
    </>
  )
}
