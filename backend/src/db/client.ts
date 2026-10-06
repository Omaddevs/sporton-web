import path from 'node:path'
import { mkdirSync } from 'node:fs'
import { drizzle as drizzlePostgres, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import * as schema from './schema'

export type DB = PostgresJsDatabase<typeof schema>

export const PGLITE_DIR = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '.data/pglite')

/**
 * DATABASE_URL bo‘lsa — PostgreSQL. Bo‘lmasa (faqat dev) — fayl ichidagi PGlite.
 * Ikkalasi ham bir xil Postgres dialekti, shuning uchun so‘rovlar va migratsiyalar bir xil.
 */
export async function createDb(): Promise<DB> {
  const url = process.env.DATABASE_URL
  if (url) {
    const { default: postgres } = await import('postgres')
    const client = postgres(url, { max: Number(process.env.DB_POOL_SIZE ?? 10), prepare: false })
    return drizzlePostgres(client, { schema })
  }

  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PGLITE) {
    throw new Error('DATABASE_URL o‘rnatilmagan. Production’da PostgreSQL manzilini kiriting.')
  }

  mkdirSync(PGLITE_DIR, { recursive: true })
  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle: drizzlePglite } = await import('drizzle-orm/pglite')
  const client = new PGlite(PGLITE_DIR)
  return drizzlePglite(client, { schema }) as unknown as DB
}
