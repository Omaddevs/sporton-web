import path from 'node:path'
import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  // Frontend (Vite) yuqori papkada — backend alohida loyiha sifatida yig‘iladi
  turbopack: { root: path.resolve(import.meta.dirname) },
  outputFileTracingRoot: path.resolve(import.meta.dirname),
  // PGlite (dev uchun o‘rnatilgan Postgres) WASM fayllarini o‘zi yuklaydi — bundle qilinmasin
  serverExternalPackages: ['@electric-sql/pglite'],
  // Admin panel saytning statik rasmlarini (/images/…) ko‘rsata olishi uchun. Production’da nginx
  // ikkalasini bitta domenda beradi, bu qoida faqat alohida portlarda (dev) ishlaydi.
  async rewrites() {
    const site = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '')
    return site ? { fallback: [{ source: '/images/:path*', destination: `${site}/images/:path*` }] } : { fallback: [] }
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
