import 'server-only'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/db/schema'
import { getCurrentUser, hasRole } from './auth'

/** Admin sahifalari va server action’lari uchun: moderator yoki admin */
export async function requireStaff(role: UserRole = 'moderator') {
  const user = await getCurrentUser()
  if (!user) redirect('/admin/login')
  if (!hasRole(user, role)) redirect(hasRole(user, 'moderator') ? '/admin?error=forbidden' : '/admin/login?error=forbidden')
  return user
}

export const PAGE_SIZE = 25

export function pageParam(value: string | string[] | undefined) {
  const n = Number(Array.isArray(value) ? value[0] : value)
  return Number.isInteger(n) && n > 0 ? n : 1
}

export function str(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? ''
}

const dateFmt = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Tashkent',
})

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return '—'
  return dateFmt.format(new Date(value))
}

export function formatSum(value: number | null | undefined) {
  if (value == null) return '—'
  return `${value.toLocaleString('ru-RU').replace(/\s/g, ' ')} so‘m`
}

/** Formadan matn: bo‘sh bo‘lsa null */
export function field(form: FormData, name: string) {
  const value = String(form.get(name) ?? '').trim()
  return value || null
}

export function lines(form: FormData, name: string) {
  return String(form.get(name) ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[‘’ʻʼ']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
