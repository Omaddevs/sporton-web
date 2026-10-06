'use client'

import { useActionState } from 'react'
import { adminLogin, type LoginState } from './actions'

export default function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(adminLogin, {})
  const error = state.error ?? notice
  return (
    <form action={action} className="form" noValidate>
      {error && <div className="alert alert--danger" role="alert">{error}</div>}
      <input type="hidden" name="next" value={next} />
      <label className="fld">
        <span>Telefon raqam</span>
        <div className="phone-input">
          <span>+998</span>
          <input className="input" name="phone" inputMode="numeric" autoComplete="username" placeholder="90 123 45 67" required autoFocus />
        </div>
      </label>
      <label className="fld">
        <span>Parol</span>
        <input className="input" name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="btn btn--primary btn--block" disabled={pending} style={{ height: 44 }}>
        {pending ? 'Tekshirilmoqda…' : 'Kirish'}
      </button>
    </form>
  )
}
