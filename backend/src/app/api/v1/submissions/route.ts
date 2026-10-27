import { desc, eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { submissions } from '@/db/schema'
import { requireUser } from '@/lib/auth'
import { ApiError, json, readJson, route } from '@/lib/http'
import { imagesOf, MediaError, normalizeMedia } from '@/lib/media'
import { formatPhone } from '@/lib/phone'
import { rateLimit } from '@/lib/rate-limit'
import { notifyAdmins } from '@/lib/telegram'
import { submissionSchema } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export const GET = route(async () => {
  const user = await requireUser()
  const db = await getDb()
  const rows = await db
    .select({
      id: submissions.id,
      name: submissions.name,
      status: submissions.status,
      adminNote: submissions.adminNote,
      complexId: submissions.complexId,
      createdAt: submissions.createdAt,
    })
    .from(submissions)
    .where(eq(submissions.userId, user.id))
    .orderBy(desc(submissions.createdAt))
  return json({ submissions: rows })
})

/**
 * Majmua arizasi (JSON). Rasm/videolar oldindan /api/v1/uploads orqali yuklanadi yoki havola
 * sifatida qo‘shiladi — bu yerga faqat ularning ro‘yxati (media) keladi.
 */
export const POST = route(async (request) => {
  const user = await requireUser()
  await rateLimit(`submission:${user.id}`, 5, 24 * 60 * 60_000)
  const data = await readJson(request, submissionSchema)

  let media
  try {
    media = normalizeMedia(data.media)
  } catch (error) {
    if (error instanceof MediaError) throw new ApiError(422, 'MEDIA_INVALID', error.message, 'media')
    throw error
  }
  if (!media.length) throw new ApiError(422, 'MEDIA_REQUIRED', 'Kamida bitta rasm yoki video qo‘shing', 'media')

  const db = await getDb()
  const [row] = await db
    .insert(submissions)
    .values({ userId: user.id, name: data.name, payload: { ...data, media, photos: imagesOf(media) } })
    .returning()

  notifyAdmins('🏟 Yangi majmua arizasi', [
    data.name,
    data.address,
    formatPhone(data.phone),
    `${imagesOf(media).length} rasm · ${media.length - imagesOf(media).length} video`,
  ])
  return json({ submission: { id: row.id, name: row.name, status: row.status, createdAt: row.createdAt } }, { status: 201 })
})
