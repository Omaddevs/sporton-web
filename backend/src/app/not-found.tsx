import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="login">
      <div className="card login-card" style={{ textAlign: 'center' }}>
        <h1>Sahifa topilmadi</h1>
        <p>Manzil noto‘g‘ri yoki ma’lumot o‘chirilgan.</p>
        <Link href="/admin" className="btn btn--primary">Boshqaruv paneliga</Link>
      </div>
    </div>
  )
}
