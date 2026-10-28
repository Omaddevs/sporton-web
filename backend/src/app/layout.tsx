import type { Metadata } from 'next'
import { cookies } from 'next/headers'
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Qo‘lda tanlangan mavzu (ThemeToggle); bo‘lmasa CSS tizim sozlamasiga qaraydi
  const theme = (await cookies()).get('adm-theme')?.value
  return (
    <html lang="uz" className={urbanist.variable} data-theme={theme === 'light' || theme === 'dark' ? theme : undefined}>
      {/* Brauzer kengaytmalari (ColorZilla, Grammarly…) <body> ga atribut qo‘shadi — faqat shu element uchun e’tiborsiz */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
