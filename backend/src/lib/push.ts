import 'server-only'
import { eq, inArray } from 'drizzle-orm'
import webpush from 'web-push'
import { getDb } from '@/db'
import { pushSubscriptions } from '@/db/schema'

const publicKey = process.env.VAPID_PUBLIC_KEY || ''
const privateKey = process.env.VAPID_PRIVATE_KEY || ''

export const pushEnabled = () => Boolean(publicKey && privateKey)
export const vapidPublicKey = () => publicKey

let configured = false
function configure() {
  if (configured || !pushEnabled()) return
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:info@sporton.uz', publicKey, privateKey)
  configured = true
}

export type PushPayload = { title: string; body: string; url?: string | null; tag?: string }

/**
 * Foydalanuvchilarning barcha qurilmalariga push. Muddati o‘tgan obunalar (404/410) o‘chiriladi.
 * Qaytaradi: muvaffaqiyatli yetkazilgan foydalanuvchilar soni.
 */
export async function sendPush(userIds: string[], payload: PushPayload) {
  if (!pushEnabled() || !userIds.length) return 0
  configure()
  const db = await getDb()
  const delivered = new Set<string>()
  const dead: string[] = []

  for (let i = 0; i < userIds.length; i += 500) {
    const subs = await db.select().from(pushSubscriptions).where(inArray(pushSubscriptions.userId, userIds.slice(i, i + 500)))
    const body = JSON.stringify(payload)
    // Bir vaqtda 20 tadan yuboramiz
    for (let j = 0; j < subs.length; j += 20) {
      await Promise.all(
        subs.slice(j, j + 20).map(async (sub) => {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              body,
              { TTL: 24 * 60 * 60, urgency: 'normal' },
            )
            delivered.add(sub.userId)
          } catch (error) {
            const status = (error as { statusCode?: number }).statusCode
            if (status === 404 || status === 410) dead.push(sub.id)
            else console.error('[push]', status, (error as Error).message)
          }
        }),
      )
    }
  }
  if (dead.length) await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, dead))
  return delivered.size
}

export async function removeSubscription(endpoint: string) {
  const db = await getDb()
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint))
}
