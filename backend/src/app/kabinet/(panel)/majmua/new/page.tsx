import ComplexForm from '@/components/admin/ComplexForm'
import { Flash, PageHeader } from '@/components/admin/ui'
import { requireOwner } from '@/lib/owner'
import { ownerCreateComplex } from '../../actions'

export const metadata = { title: 'Yangi majmua' }

export default async function OwnerNewComplexPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  await requireOwner()
  return (
    <>
      <PageHeader
        title="Yangi majmua"
        description="Ma’lumot, logotip, rasm va videolarni kiriting. Saqlagach, majmua ichiga sport turlari (xizmatlar) qo‘shasiz."
        crumbs={[{ href: '/kabinet', label: 'Kabinet' }]}
      />
      <Flash params={await searchParams} />
      <div className="alert alert--warning">
        Yangi majmua admin tekshiruvidan so‘ng saytda e’lon qilinadi. Shu vaqtgacha uni «Oldindan ko‘rish» orqali ko‘rishingiz mumkin.
      </div>
      <ComplexForm action={ownerCreateComplex} submitLabel="Majmuani qo‘shish" variant="owner" />
    </>
  )
}
