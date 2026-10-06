import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser, hasRole } from '@/lib/auth'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: 'Kirish' }

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const user = await getCurrentUser()
  if (hasRole(user, 'moderator')) redirect('/admin')

  return (
    <div className="login">
      <div className="card login-card">
        <div className="adm-brand">
          <img src="/icon.svg" alt="" />
          <div>
            SportON
            <small>Boshqaruv paneli</small>
          </div>
        </div>
        <h1>Xush kelibsiz</h1>
        <p>Admin yoki moderator hisobingiz bilan kiring.</p>
        <LoginForm
          next={params.next ?? '/admin'}
          notice={params.error === 'forbidden' ? 'Bu hisobda admin panelga kirish huquqi yo‘q' : undefined}
        />
      </div>
    </div>
  )
}
