import { desc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { subscribers } from '@/db/schema'
import { getCurrentUser, hasRole } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()
  if (!hasRole(user, 'moderator')) return new Response('Forbidden', { status: 403 })
  const db = await getDb()
  const rows = await db.select().from(subscribers).where(eq(subscribers.status, 'active')).orderBy(desc(subscribers.createdAt))
  const csv = ['email,created_at', ...rows.map((r) => `"${r.email.replace(/"/g, '""')}",${r.createdAt.toISOString()}`)].join('\n')
  return new Response(`﻿${csv}`, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="sporton-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
