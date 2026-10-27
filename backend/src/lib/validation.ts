import { z } from 'zod'
import { isValidLocalPhone, toLocalDigits } from './phone'

export const MIN_PASSWORD = 8

const trimmed = (min: number, max: number, label: string) =>
  z
    .string({ error: `${label} kiritilmagan` })
    .trim()
    .min(min, min <= 1 ? `${label} kiritilmagan` : `${label} kamida ${min} ta belgi bo‘lsin`)
    .max(max, `${label} ${max} belgidan oshmasin`)

export const phoneSchema = z
  .string({ error: 'Telefon raqamni kiriting' })
  .transform((value) => toLocalDigits(value))
  .refine(isValidLocalPhone, 'Telefon raqamni to‘liq kiriting')

export const passwordSchema = z
  .string({ error: 'Parolni kiriting' })
  .min(MIN_PASSWORD, `Parol kamida ${MIN_PASSWORD} ta belgidan iborat bo‘lsin`)
  .max(128, 'Parol juda uzun')

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Parolni kiriting').max(128),
})

export const registerSchema = z.object({
  firstName: trimmed(2, 50, 'Ism'),
  lastName: trimmed(2, 50, 'Familiya'),
  phone: phoneSchema,
  password: passwordSchema,
  consent: z.literal(true, { error: 'Rozilik berish majburiy' }),
  /** Telegram bot bergan tasdiqlash kodi (botga aynan shu raqam yuborilgan bo‘lishi kerak) */
  code: z.string({ error: 'Telegram botdan olingan kodni kiriting' }).regex(/^\d{6}$/, 'Kod 6 ta raqamdan iborat'),
})

export const registerStartSchema = z.object({ phone: phoneSchema })

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Joriy parolni kiriting'),
  newPassword: passwordSchema,
})

export const resetRequestSchema = z.object({ phone: phoneSchema })
export const resetVerifySchema = z.object({
  phone: phoneSchema,
  code: z.string().regex(/^\d{6}$/, 'Kod 6 ta raqamdan iborat'),
})
export const resetPasswordSchema = z.object({
  resetToken: z.string().min(10),
  password: passwordSchema,
})

export const profileSchema = z.object({
  firstName: trimmed(2, 50, 'Ism').optional(),
  lastName: trimmed(2, 50, 'Familiya').optional(),
  email: z.union([z.literal(''), z.email('Email noto‘g‘ri')]).optional(),
  bio: z.string().trim().max(300, 'Ko‘pi bilan 300 belgi').optional(),
  city: z.string().trim().max(60).optional(),
  sports: z.array(z.string().regex(/^[\w-]{1,40}$/)).max(20, 'Ko‘pi bilan 20 ta sport turi').optional(),
  /** Yuklangan rasm (/api/v1/files/…) yoki bo‘sh — o‘chirish */
  avatar: z.union([z.literal(''), z.string().regex(/^\/api\/v1\/files\/[\w./-]+$/, 'Rasm noto‘g‘ri')]).optional(),
})

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Sana noto‘g‘ri')

export const bookingSchema = z.object({
  serviceId: z.coerce.number().int().positive(),
  date: isoDate.nullable().optional(),
  hour: z.number().int().min(0).max(23).nullable().optional(),
  name: trimmed(2, 80, 'Ism'),
  phone: phoneSchema,
  note: z.string().trim().max(500).optional(),
})

export const reviewSchema = z.object({
  rating: z.number().int().min(1, 'Baho 1–5').max(5, 'Baho 1–5'),
  text: trimmed(3, 1000, 'Sharh'),
  name: z.string().trim().max(60).optional(),
})

export const commentSchema = z.object({
  text: trimmed(2, 1000, 'Izoh'),
  name: z.string().trim().max(60).optional(),
})

export const subscribeSchema = z.object({
  email: z.email('Email manzil noto‘g‘ri').max(160).transform((v) => v.toLowerCase()),
})

export const supportSchema = z.object({
  topic: trimmed(2, 60, 'Mavzu'),
  message: trimmed(10, 2000, 'Xabar'),
  name: z.string().trim().max(80).optional(),
  contact: z.string().trim().max(120).optional(),
})

export const submissionSchema = z.object({
  name: trimmed(3, 120, 'Majmua nomi'),
  sports: z.array(z.string().max(40)).min(1, 'Kamida bitta sport turini tanlang').max(15),
  description: trimmed(30, 3000, 'Tavsif'),
  region: z.string().max(40),
  address: trimmed(3, 300, 'Manzil'),
  landmark: z.string().trim().max(200).optional().default(''),
  price: z.coerce.number().int().positive('Narxni kiriting').max(100_000_000),
  opens: z.string().regex(/^\d{2}:\d{2}$/),
  closes: z.string().regex(/^\d{2}:\d{2}$/),
  amenities: z.array(z.string().max(40)).max(20).default([]),
  phone: phoneSchema,
  telegram: z.string().trim().max(64).optional().default(''),
  media: z.array(z.object({ url: z.string().max(2000), type: z.string().optional(), provider: z.string().optional() })).min(1, 'Kamida bitta rasm yoki video qo‘shing').max(200, 'Ko‘pi bilan 200 ta rasm/video'),
})
