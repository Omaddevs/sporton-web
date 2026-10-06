import 'server-only'
import { getDb } from '@/db'
import { auditLogs } from '@/db/schema'

export async function audit(
  actorId: string | null,
  action: string,
  entity: string,
  entityId?: string | number | null,
  meta?: Record<string, unknown>,
) {
  try {
    const db = await getDb()
    await db.insert(auditLogs).values({
      actorId,
      action,
      entity,
      entityId: entityId == null ? null : String(entityId),
      meta: meta ?? null,
    })
  } catch (error) {
    console.error('[audit]', error)
  }
}
