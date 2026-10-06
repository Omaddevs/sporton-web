import 'server-only'
import { createDb, type DB } from './client'

const globalForDb = globalThis as unknown as { __sportonDb?: Promise<DB> }

/**
 * Bitta ulanish (dev’da HMR qayta yuklaganda ham). Birinchi chaqiruvda ochiladi.
 */
export function getDb(): Promise<DB> {
  globalForDb.__sportonDb ??= createDb()
  return globalForDb.__sportonDb
}

export * as schema from './schema'
