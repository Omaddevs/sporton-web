import 'server-only'

function list(value: string | undefined) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

const isProd = process.env.NODE_ENV === 'production'

function authSecret() {
  const secret = process.env.AUTH_SECRET ?? ''
  if (secret.length >= 32) return secret
  if (isProd) throw new Error('AUTH_SECRET kamida 32 belgidan iborat bo‘lishi kerak')
  return 'dev-only-insecure-secret-change-me-0123456789'
}

export const env = {
  isProd,
  get authSecret() {
    return authSecret()
  },
  corsOrigins: list(process.env.CORS_ORIGINS),
  cookieSameSite: (process.env.COOKIE_SAMESITE === 'none' ? 'none' : 'lax') as 'none' | 'lax',
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    username: process.env.TELEGRAM_BOT_USERNAME || 'SportOnUzBot',
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || '',
  },
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
}
