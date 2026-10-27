import ConfirmButton from './ConfirmButton'
import { StatusBadge } from './ui'
import { formatDateTime } from '@/lib/admin'
import { formatPhone } from '@/lib/phone'
import { ownerSetBookingStatus } from '@/app/kabinet/(panel)/bronlar/actions'

export type OwnerBooking = {
  id: string
  code: string
  status: string
  date: string | null
  hour: number | null
  customerName: string
  customerPhone: string
  priceLabel: string | null
  note: string | null
  createdAt: Date
  serviceTitle: string
  complexName: string
}

/** Bron qatori: mijoz, vaqt va amallar (tasdiqlash / yakunlash / bekor qilish + mijozga izoh) */
export default function OwnerBookingRow({ b, back, showComplex }: { b: OwnerBooking; back: string; showComplex: boolean }) {
  const open = b.status === 'pending' || b.status === 'confirmed'
  return (
    <tr>
      <td className="nowrap">
        <span className="cell-main">{b.code}</span>
        <span className="cell-sub">{formatDateTime(b.createdAt)}</span>
      </td>
      <td>
        <span className="cell-main">{b.customerName}</span>
        <a className="cell-sub" href={`tel:+998${b.customerPhone}`}>{formatPhone(b.customerPhone)}</a>
      </td>
      <td>
        <span className="cell-main">{b.serviceTitle}</span>
        {showComplex && <span className="cell-sub">{b.complexName}</span>}
        {b.note && <span className="cell-sub">💬 {b.note}</span>}
      </td>
      <td className="nowrap">
        {b.date ? (
          <>
            <span className="cell-main">{b.date.split('-').reverse().join('.')}</span>
            <span className="cell-sub">{String(b.hour).padStart(2, '0')}:00</span>
          </>
        ) : (
          <span className="muted">Kelishiladi (ariza)</span>
        )}
      </td>
      <td>{b.priceLabel}</td>
      <td>
        <StatusBadge status={b.status} />
      </td>
      <td>
        {open ? (
          <form action={ownerSetBookingStatus} className="row-actions" style={{ flexWrap: 'wrap' }}>
            <input type="hidden" name="id" value={b.id} />
            <input type="hidden" name="back" value={back} />
            <input className="input" name="note" placeholder="Mijozga izoh (ixtiyoriy)" style={{ height: 30, minWidth: 160 }} aria-label="Mijozga izoh" />
            {b.status === 'pending' && (
              <ConfirmButton className="btn btn--sm btn--success" name="status" value="confirmed">
                Tasdiqlash
              </ConfirmButton>
            )}
            {b.status === 'confirmed' && (
              <ConfirmButton className="btn btn--sm" name="status" value="completed">
                Yakunlash
              </ConfirmButton>
            )}
            <ConfirmButton className="btn btn--sm btn--danger" name="status" value="cancelled" confirm={`${b.code} bronini bekor qilasizmi? Mijozga xabar boradi.`}>
              Bekor qilish
            </ConfirmButton>
          </form>
        ) : (
          <span className="muted">—</span>
        )}
      </td>
    </tr>
  )
}
