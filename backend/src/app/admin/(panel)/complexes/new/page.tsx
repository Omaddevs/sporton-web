import ComplexForm from '@/components/admin/ComplexForm'
import { Flash, PageHeader } from '@/components/admin/ui'
import { requireStaff } from '@/lib/admin'
import { createComplex } from '../actions'

export const metadata = { title: 'Yangi majmua' }

export default async function NewComplexPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireStaff()
  return (
    <>
      <PageHeader title="Yangi majmua" crumbs={[{ href: '/admin/complexes', label: 'Majmualar' }]} />
      <Flash params={await searchParams} />
      <ComplexForm action={createComplex} submitLabel="Majmuani yaratish" />
    </>
  )
}
