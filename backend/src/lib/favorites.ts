import 'server-only'
import { and, count, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { getDb } from '@/db'
import { complexes, FAVORITE_KINDS, favorites, LIKE_KINDS, likes, news, services, type FavoriteKind, type LikeKind } from '@/db/schema'
import { ApiError } from './http'

const itemId = z.string().trim().regex(/^[\w-]{1,80}$/, 'Noto‘g‘ri id')
export const favoriteSchema = z.object({ kind: z.enum(FAVORITE_KINDS), id: itemId, saved: z.boolean() })
export const favoriteImportSchema = z.object({
  items: z.array(z.object({ kind: z.enum(FAVORITE_KINDS), id: itemId })).max(300),
})
export const likeSchema = z.object({ kind: z.enum(LIKE_KINDS), id: itemId, liked: z.boolean() })

/** Saqlanadigan narsa haqiqatan bormi (kurslar — statik ro‘yxat, faqat id formati tekshiriladi) */
async function exists(kind: FavoriteKind | LikeKind, id: string) {
  const db = await getDb()
  if (kind === 'complex') return (await db.select({ id: complexes.id }).from(complexes).where(eq(complexes.id, id)).limit(1)).length > 0
  if (kind === 'service') {
    const n = Number(id)
    return Number.isInteger(n) && (await db.select({ id: services.id }).from(services).where(eq(services.id, n)).limit(1)).length > 0
  }
  if (kind === 'news') return (await db.select({ id: news.id }).from(news).where(eq(news.id, id)).limit(1)).length > 0
  return true
}

export async function listFavorites(userId: string) {
  const db = await getDb()
  const rows = await db.select().from(favorites).where(eq(favorites.userId, userId)).orderBy(favorites.createdAt)
  const result = Object.fromEntries(FAVORITE_KINDS.map((k) => [k, [] as string[]])) as Record<FavoriteKind, string[]>
  // Eng yangisi birinchi
  for (const row of rows.reverse()) result[row.kind].push(row.itemId)
  return result
}

export async function setFavorite(userId: string, kind: FavoriteKind, id: string, saved: boolean) {
  const db = await getDb()
  if (!saved) {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.kind, kind), eq(favorites.itemId, id)))
    return
  }
  if (!(await exists(kind, id))) throw new ApiError(404, 'NOT_FOUND', 'Topilmadi')
  await db.insert(favorites).values({ userId, kind, itemId: id }).onConflictDoNothing()
}

/** Kirishdan oldin brauzerda saqlangan (eski) ro‘yxatni hisobga ko‘chirish */
export async function importFavorites(userId: string, items: Array<{ kind: FavoriteKind; id: string }>) {
  if (!items.length) return
  const db = await getDb()
  const valid: typeof items = []
  for (const item of items) if (await exists(item.kind, item.id)) valid.push(item)
  if (valid.length) {
    await db
      .insert(favorites)
      .values(valid.map((v) => ({ userId, kind: v.kind, itemId: v.id })))
      .onConflictDoNothing()
  }
}

export async function likeState(kind: LikeKind, id: string, userId?: string | null) {
  const db = await getDb()
  const [[{ n }], mine] = await Promise.all([
    db.select({ n: count() }).from(likes).where(and(eq(likes.kind, kind), eq(likes.itemId, id))),
    userId
      ? db.select({ id: likes.itemId }).from(likes).where(and(eq(likes.userId, userId), eq(likes.kind, kind), eq(likes.itemId, id))).limit(1)
      : Promise.resolve([]),
  ])
  return { count: Number(n), liked: mine.length > 0 }
}

export async function setLike(userId: string, kind: LikeKind, id: string, liked: boolean) {
  const db = await getDb()
  if (liked) {
    if (!(await exists(kind, id))) throw new ApiError(404, 'NOT_FOUND', 'Topilmadi')
    await db.insert(likes).values({ userId, kind, itemId: id }).onConflictDoNothing()
  } else {
    await db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.kind, kind), eq(likes.itemId, id)))
  }
  return likeState(kind, id, userId)
}

/** Bir nechta element uchun layklar soni (ro‘yxatlar uchun) */
export async function likeCounts(kind: LikeKind, ids: string[]) {
  if (!ids.length) return {}
  const db = await getDb()
  const rows = await db
    .select({ id: likes.itemId, n: count() })
    .from(likes)
    .where(and(eq(likes.kind, kind), inArray(likes.itemId, ids)))
    .groupBy(likes.itemId)
  return Object.fromEntries(rows.map((r) => [r.id, Number(r.n)]))
}
