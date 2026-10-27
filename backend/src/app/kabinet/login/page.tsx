import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { count, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { complexes } from '@/db/schema'
import { getCurrentUser } from '@/lib/auth'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: 'Majmua kabineti — kirish' }

export default async function OwnerLoginPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const user = await getCurrentUser()
  if (user) {
    const db = await getDb()
    const [{ n }] = await db.select({ n: count() }).from(complexes).where(eq(complexes.ownerId, user.id))
    if (n) redirect('/kabinet')
  }
  const site = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '') ?? ''

  return (
    <div className="login">
      <div className="card login-card">
        <div className="adm-brand">
          <img src="/icon.svg" alt="" />
          <div>
            SportON
            <small>Majmua kabineti</small>
          </div>
        </div>
        <h1>Majmua egasi kabineti</h1>
        <p>Saytdagi telefon raqamingiz va parolingiz bilan kiring.</p>
        <LoginForm
          notice={
            params.error === 'not-owner'
              ? 'Bu hisobga hali majmua biriktirilmagan. Ariza tasdiqlangach kabinet ochiladi.'
              : undefined
          }
        />
        <p className="muted" style={{ marginTop: 16, fontSize: 13 }}>
          Majmuangiz hali saytda yo‘qmi? <a href={`${site}/majmua-qoshish`}>Ariza yuboring</a> — admin tekshirib tasdiqlagach,
          shu sahifa orqali bronlar va ma’lumotlarni boshqarasiz. Parolni unutdingizmi?{' '}
          <a href={`${site}/parolni-tiklash`}>Tiklash</a>
        </p>
      </div>
    </div>
  )
}
