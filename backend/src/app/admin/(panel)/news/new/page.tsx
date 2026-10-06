import NewsForm from '@/components/admin/NewsForm'
import { Flash, PageHeader } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { createNews } from '../actions'

export const metadata = { title: 'Yangi maqola' }

export default async function NewNewsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff()
  return (
    <>
      <PageHeader title="Yangi maqola" crumbs={[{ href: '/admin/news', label: 'Yangiliklar' }]} />
      <Flash params={await searchParams} />
      <NewsForm action={createNews} submitLabel="Yaratish" />
    </>
  )
}
