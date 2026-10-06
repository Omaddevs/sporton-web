'use client'

import { useActionState, useMemo, useState } from 'react'
import { Bell, CalendarClock, Info, LifeBuoy, Newspaper, Send, Tag, CalendarCheck, Building2, X } from 'lucide-react'
import { createBroadcast, sendTest, type FormState, type TestState } from '@/app/admin/(panel)/notifications/actions'
import ConfirmButton from './ConfirmButton'

const TYPES = [
  { id: 'system', label: 'Tizim xabari', Icon: Info },
  { id: 'promo', label: 'Aksiya / chegirma', Icon: Tag },
  { id: 'news', label: 'Yangilik', Icon: Newspaper },
  { id: 'booking', label: 'Bron', Icon: CalendarCheck },
  { id: 'submission', label: 'Majmua', Icon: Building2 },
  { id: 'support', label: 'Yordam', Icon: LifeBuoy },
] as const

const LINK_PRESETS = [
  { label: 'Bosh sahifa', value: '/' },
  { label: 'Profil · bronlar', value: '/profil?bolim=bronlar' },
  { label: 'Sport turlari', value: '/sport-turlari' },
  { label: 'Xarita', value: '/xarita' },
  { label: 'Majmua qo‘shish', value: '/majmua-qoshish' },
]

type Counts = { all: number; bookers: number; active30: number }
type Picked = { id: string; name: string; phone: string }

const toLocalInput = (d: Date) => new Date(d.getTime() + 5 * 3_600_000).toISOString().slice(0, 16)

export default function BroadcastForm({
  counts,
  picked,
  telegramAvailable,
  pushAvailable,
}: {
  counts: Counts
  picked: Picked[]
  telegramAvailable: boolean
  pushAvailable: boolean
}) {
  const [type, setType] = useState<(typeof TYPES)[number]['id']>(picked.length ? 'system' : 'promo')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [link, setLink] = useState('')
  const [audience, setAudience] = useState(picked.length ? 'users' : 'all')
  const [users, setUsers] = useState(picked)
  const [phones, setPhones] = useState('')
  const [when, setWhen] = useState<'now' | 'later'>('now')
  const [test, testAction, testing] = useActionState<TestState, FormData>(sendTest, {})
  const [created, createAction] = useActionState<FormState, FormData>(createBroadcast, {})

  const meta = TYPES.find((t) => t.id === type)!
  const optOutNote = type === 'promo' || type === 'news'
  const phoneCount = useMemo(
    () => phones.split(/[\n,;]+/).filter((p) => p.replace(/\D/g, '').length >= 9).length,
    [phones],
  )
  const estimate =
    audience === 'users' ? users.length + phoneCount : counts[audience as keyof Counts] ?? 0

  return (
    <form action={createAction} className="grid-main">
      {/* Tanlovlar shu yerda — test yuborilgandan keyin forma qayta tiklansa ham saqlanadi */}
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="audience" value={audience} />
      <input type="hidden" name="when" value={when} />
      <div className="stack">
        <section className="card card-pad form">
          <h2 className="section-title">Xabar</h2>
          <div className="type-picker" role="radiogroup" aria-label="Turi">
            {TYPES.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={type === id}
                className={`type-chip ${type === id ? 'is-active' : ''}`}
                onClick={() => setType(id)}
              >
                <Icon aria-hidden="true" /> {label}
              </button>
            ))}
          </div>
          <label className="fld">
            <span>Sarlavha *</span>
            <input className="input" name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} required placeholder="Masalan: Dam olish kunlari −20%" />
            <small>{80 - title.length} belgi qoldi</small>
          </label>
          <label className="fld">
            <span>Matn *</span>
            <textarea className="textarea" name="body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={500} rows={4} required placeholder="Qisqa va aniq yozing: nima, qachon, qanday foyda." />
            <small>{500 - body.length} belgi qoldi</small>
          </label>
          <label className="fld">
            <span>Havola (bosilganda ochiladi)</span>
            <input className="input" name="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/sport-majmua/olimpiya yoki https://…" />
            <div className="chips">
              {LINK_PRESETS.map((p) => (
                <button key={p.value} type="button" className="chip chip--btn" onClick={() => setLink(p.value)}>
                  {p.label}
                </button>
              ))}
            </div>
          </label>
        </section>

        <section className="card card-pad form">
          <h2 className="section-title">Kimga</h2>
          <div className="radio-list" role="radiogroup" aria-label="Kimga">
            {[
              { id: 'all', label: 'Barcha foydalanuvchilar', n: counts.all },
              { id: 'bookers', label: 'Kamida bir marta bron qilganlar', n: counts.bookers },
              { id: 'active30', label: 'So‘nggi 30 kunda kirganlar', n: counts.active30 },
              { id: 'users', label: 'Tanlangan foydalanuvchilar', n: null },
            ].map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={audience === o.id}
                className={`radio-row ${audience === o.id ? 'is-active' : ''}`}
                onClick={() => setAudience(o.id)}
              >
                <span className="radio-dot" aria-hidden="true" />
                <span>{o.label}</span>
                {o.n != null && <em>{o.n} kishi</em>}
              </button>
            ))}
          </div>
          {audience === 'users' && (
            <div className="form">
              {users.length > 0 && (
                <div className="chips">
                  {users.map((u) => (
                    <span key={u.id} className="chip chip--user">
                      <input type="hidden" name="userIds" value={u.id} />
                      {u.name} {u.phone && <small>{u.phone}</small>}
                      <button type="button" aria-label="Olib tashlash" onClick={() => setUsers((list) => list.filter((x) => x.id !== u.id))}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <label className="fld">
                <span>Telefon raqamlar</span>
                <textarea className="textarea" name="phones" value={phones} onChange={(e) => setPhones(e.target.value)} rows={3} placeholder={'90 123 45 67\n93 111 22 33'} />
                <small>Har qatorda bitta raqam. Foydalanuvchilar ro‘yxatidagi «Xabar» tugmasi orqali ham qo‘shiladi.</small>
              </label>
            </div>
          )}
          {optOutNote && audience !== 'users' && (
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>
              «{meta.label}» turini o‘chirib qo‘ygan foydalanuvchilarga yuborilmaydi — soni biroz kam bo‘lishi mumkin.
            </p>
          )}
        </section>

        <section className="card card-pad form">
          <h2 className="section-title">Kanallar va vaqt</h2>
          <div className="checks">
            <label className="check">
              <input type="checkbox" checked disabled /> Saytdagi qo‘ng‘iroqcha
            </label>
            <label className="check" title={telegramAvailable ? '' : 'TELEGRAM_BOT_TOKEN sozlanmagan'}>
              <input type="checkbox" name="telegram" defaultChecked={telegramAvailable} disabled={!telegramAvailable} /> Telegram
              {!telegramAvailable && <small className="muted"> (sozlanmagan)</small>}
            </label>
            <label className="check" title={pushAvailable ? '' : 'VAPID kalitlari sozlanmagan'}>
              <input type="checkbox" name="push" defaultChecked={pushAvailable} disabled={!pushAvailable} /> Brauzer push
              {!pushAvailable && <small className="muted"> (sozlanmagan)</small>}
            </label>
          </div>
          <div className="radio-list radio-list--inline" role="radiogroup" aria-label="Vaqt">
            {(
              [
                ['now', 'Hozir yuborish'],
                ['later', 'Rejalashtirish'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={when === id}
                className={`radio-row ${when === id ? 'is-active' : ''}`}
                onClick={() => setWhen(id)}
              >
                <span className="radio-dot" aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>
          {when === 'later' && (
            <label className="fld">
              <span>
                <CalendarClock size={14} style={{ verticalAlign: -2 }} /> Yuborish vaqti (Toshkent)
              </span>
              <input className="input" type="datetime-local" name="scheduledAt" min={toLocalInput(new Date())} defaultValue={toLocalInput(new Date(Date.now() + 3_600_000))} required />
            </label>
          )}
        </section>
      </div>

      <aside className="stack sticky-aside">
        <section className="card card-pad">
          <h2 className="section-title" style={{ marginBottom: 12 }}>Ko‘rinishi</h2>
          <div className="notif-preview">
            <span className={`notif-preview__icon is-${type}`}>
              <meta.Icon size={18} />
            </span>
            <div>
              <b>{title || 'Sarlavha'}</b>
              <p>{body || 'Xabar matni shu yerda ko‘rinadi.'}</p>
              <small>Hozirgina{link && ' · bosilganda ochiladi'}</small>
            </div>
          </div>
          <div className="push-preview" aria-label="Brauzer push ko‘rinishi">
            <span className="push-preview__head">
              <Bell size={13} /> SportON · hozir
            </span>
            <span className="push-preview__title">{title || 'Sarlavha'}</span>
            <span>{body.slice(0, 90) || 'Brauzer push ko‘rinishi'}</span>
          </div>
        </section>

        <section className="card card-pad form">
          <p style={{ margin: 0 }}>
            Taxminan <b>{estimate}</b> kishiga {when === 'later' ? 'rejalashtiriladi' : 'yuboriladi'}.
          </p>
          {created.error && <div className="alert alert--danger" style={{ margin: 0 }} role="alert">{created.error}</div>}
          {test.error && <div className="alert alert--danger" style={{ margin: 0 }}>{test.error}</div>}
          {test.ok && <div className="alert alert--success" style={{ margin: 0 }}>{test.ok}</div>}
          <button type="submit" formAction={testAction} formNoValidate className="btn btn--block" disabled={testing}>
            {testing ? 'Yuborilmoqda…' : 'O‘zimga test yuborish'}
          </button>
          <ConfirmButton
            className="btn btn--primary btn--block"
            name="intent"
            value="send"
            confirm={when === 'later' ? undefined : `${estimate} kishiga hozir yuborilsinmi? Buni qaytarib bo‘lmaydi.`}
          >
            <Send size={16} /> {when === 'later' ? 'Rejalashtirish' : 'Yuborish'}
          </ConfirmButton>
          <ConfirmButton className="btn btn--block btn--ghost" name="intent" value="draft">
            Qoralama sifatida saqlash
          </ConfirmButton>
        </section>
      </aside>
    </form>
  )
}
