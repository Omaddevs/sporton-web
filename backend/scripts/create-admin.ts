/**
 * Admin yaratish yoki mavjud foydalanuvchini admin qilish.
 *   ADMIN_PHONE=901234567 ADMIN_PASSWORD='...' npm run admin:create
 */
import './_env'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { createDb } from '../src/db/client'
import { users } from '../src/db/schema'
import { toLocalDigits } from '../src/lib/phone'

async function main() {
  const phone = toLocalDigits(process.env.ADMIN_PHONE ?? '')
  const password = process.env.ADMIN_PASSWORD ?? ''
  if (!/^\d{9}$/.test(phone)) throw new Error('ADMIN_PHONE noto‘g‘ri (9 ta raqam: 901234567)')
  if (password.length < 8) throw new Error('ADMIN_PASSWORD kamida 8 belgi bo‘lsin')

  const db = await createDb()
  const passwordHash = await bcrypt.hash(password, 11)
  const [existing] = await db.select().from(users).where(eq(users.phone, phone)).limit(1)

  if (existing) {
    await db
      .update(users)
      .set({ role: 'admin', status: 'active', passwordHash, tokenVersion: existing.tokenVersion + 1 })
      .where(eq(users.id, existing.id))
    console.log(`✓ ${phone} admin qilindi, parol yangilandi`)
  } else {
    await db.insert(users).values({
      firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
      lastName: process.env.ADMIN_LAST_NAME || '',
      phone,
      passwordHash,
      role: 'admin',
      consentAt: new Date(),
    })
    console.log(`✓ Admin yaratildi: +998 ${phone}`)
  }
  process.exit(0)
}

main().catch((error) => {
  console.error(error.message ?? error)
  process.exit(1)
})
