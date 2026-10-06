import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { broadcasts, news } from '@/db/schema'
import ConfirmButton from '@/components/admin/ConfirmButton'
import NewsForm from '@/components/admin/NewsForm'
import { Flash, PageHeader } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { deleteNews, updateNews } from '../actions'

export default async function EditNewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  await requireStaff()
  const { id } = await params
  const db = await getDb()
  const [item] = await db.select().from(news).where(eq(news.id, decodeURIComponent(id))).limit(1)
  if (!item) notFound()
  const [announcement] = await db.select({ id: broadcasts.id }).from(broadcasts).where(eq(broadcasts.link, `/yangilik/${item.id}`)).limit(1)
  return (
    <>
      <PageHeader
        title={item.title}
        crumbs={[{ href: '/admin/news', label: 'Yangiliklar' }]}
        actions={
          <form action={deleteNews}>
            <input type="hidden" name="id" value={item.id} />
            <ConfirmButton className="btn btn--danger" confirm="Yangilik va uning izohlari o‘chirilsinmi?">O‘chirish</ConfirmButton>
          </form>
        }
      />
      <Flash params={await searchParams} />
      {announcement && (
        <p className="muted" style={{ marginTop: -8 }}>
          Bu yangilik haqida foydalanuvchilarga xabar yuborilgan —{' '}
          <a href={`/admin/notifications/${announcement.id}`} style={{ color: 'var(--primary)' }}>
            statistikani ko‘rish
          </a>
        </p>
      )}
      <NewsForm item={item} action={updateNews} submitLabel="Saqlash" announced={Boolean(announcement)} />
    </>
  )
}
