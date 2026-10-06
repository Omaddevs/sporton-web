import EventForm from '@/components/admin/EventForm'
import { Flash, PageHeader } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { createEvent } from '../actions'
import { eventCategories } from '../categories'

export const metadata = { title: 'Yangi tadbir' }

export default async function NewEventPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff()
  return (
    <>
      <PageHeader title="Yangi tadbir" crumbs={[{ href: '/admin/events', label: 'Sport tadbirlari' }]} />
      <Flash params={await searchParams} />
      <EventForm action={createEvent} submitLabel="Yaratish" categories={await eventCategories()} />
    </>
  )
}
