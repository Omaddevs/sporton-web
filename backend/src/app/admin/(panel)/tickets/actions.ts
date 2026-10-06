'use server'

import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getDb } from '@/db'
import { supportTickets } from '@/db/schema'
import { requireStaff } from '@/lib/admin'
import { audit } from '@/lib/audit'
import { notifyUserSafe } from '@/lib/notify'

export async function setTicketStatus(form: FormData) {
  const actor = await requireStaff()
  const id = String(form.get('id'))
  const status = form.get('status') === 'open' ? 'open' : 'closed'
  const reply = String(form.get('adminNote') ?? '').trim()
  const db = await getDb()
  const [ticket] = await db
    .update(supportTickets)
    .set({ status, adminNote: reply || null })
    .where(eq(supportTickets.id, id))
    .returning()
  // Yopilganda javob bo‘lsa — foydalanuvchiga yuboriladi
  if (ticket && status === 'closed' && reply) {
    notifyUserSafe(ticket.userId, {
      type: 'support',
      title: 'Murojaatingizga javob',
      body: `«${ticket.topic}»: ${reply}`,
      link: '/profil?bolim=yordam',
    })
  }
  await audit(actor.id, `ticket.${status}`, 'ticket', id)
  redirect(String(form.get('back') || '/admin/tickets'))
}
