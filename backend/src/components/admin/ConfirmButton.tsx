'use client'

import type { ReactNode } from 'react'
import { useFormStatus } from 'react-dom'

/** Forma ichidagi submit tugma: ixtiyoriy tasdiqlash oynasi va yuborilayotgan holat */
export default function ConfirmButton({
  children,
  confirm,
  className = 'btn btn--sm',
  name,
  value,
}: {
  children: ReactNode
  confirm?: string
  className?: string
  name?: string
  value?: string
}) {
  const { pending } = useFormStatus()
  return (
    <button
      className={className}
      disabled={pending}
      name={name}
      value={value}
      onClick={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault()
      }}
    >
      {children}
    </button>
  )
}
