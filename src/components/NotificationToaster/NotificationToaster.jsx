import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBell, FiX } from 'react-icons/fi'
import { markRead, onArrival } from '../../services/notifications.js'
import './NotificationToaster.css'

const VISIBLE_MS = 7000

/** Sayt ochiq turganda kelgan yangi bildirishnoma — burchakda qisqa toast */
export default function NotificationToaster() {
  const navigate = useNavigate()
  const [toasts, setToasts] = useState([])

  useEffect(
    () =>
      onArrival((item) => {
        setToasts((list) => [item, ...list].slice(0, 3))
        setTimeout(() => setToasts((list) => list.filter((t) => t.id !== item.id)), VISIBLE_MS)
      }),
    [],
  )

  const close = (id) => setToasts((list) => list.filter((t) => t.id !== id))

  if (!toasts.length) return null

  return (
    <div className="ntoast-stack" role="region" aria-live="polite" aria-label="Yangi bildirishnomalar">
      {toasts.map((t) => (
        <div key={t.id} className="ntoast">
          <button
            type="button"
            className="ntoast__main"
            onClick={() => {
              markRead(t.id)
              close(t.id)
              if (!t.link) return
              if (/^https?:\/\//.test(t.link)) window.open(t.link, '_blank', 'noopener')
              else navigate(t.link)
            }}
          >
            <span className="ntoast__icon" aria-hidden="true">
              <FiBell />
            </span>
            <span className="ntoast__body">
              <strong>{t.title}</strong>
              <span>{t.body}</span>
            </span>
          </button>
          <button type="button" className="ntoast__close" aria-label="Yopish" onClick={() => close(t.id)}>
            <FiX />
          </button>
        </div>
      ))}
    </div>
  )
}
