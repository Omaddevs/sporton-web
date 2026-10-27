import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './admin/admin.css'

const urbanist = localFont({
  src: './fonts/Urbanist-Variable.ttf',
  variable: '--font-urbanist',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'SportON Admin', template: '%s · SportON Admin' },
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={urbanist.variable}>
      {/* Brauzer kengaytmalari (ColorZilla, Grammarly…) <body> ga atribut qo‘shadi — faqat shu element uchun e’tiborsiz */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
