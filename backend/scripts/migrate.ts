import './_env'
import path from 'node:path'
import { mkdirSync } from 'node:fs'

const migrationsFolder = path.resolve('drizzle')

async function main() {
  if (process.env.DATABASE_URL) {
    const { default: postgres } = await import('postgres')
    const { drizzle } = await import('drizzle-orm/postgres-js')
    const { migrate } = await import('drizzle-orm/postgres-js/migrator')
    const client = postgres(process.env.DATABASE_URL, { max: 1 })
    await migrate(drizzle(client), { migrationsFolder })
    await client.end()
  } else {
    const { PGlite } = await import('@electric-sql/pglite')
    const { drizzle } = await import('drizzle-orm/pglite')
    const { migrate } = await import('drizzle-orm/pglite/migrator')
    const { PGLITE_DIR } = await import('../src/db/client')
    mkdirSync(PGLITE_DIR, { recursive: true })
    const client = new PGlite(PGLITE_DIR)
    await migrate(drizzle(client), { migrationsFolder })
    await client.close()
  }
  console.log('✓ Migratsiyalar qo‘llandi')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
