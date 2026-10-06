import { useEffect, useState } from 'react'
import { FaTelegram } from 'react-icons/fa6'
import { FiBell, FiCheckCircle } from 'react-icons/fi'
import { api } from '../../services/apiClient.js'
import { disablePush, enablePush, pushStatus } from '../../services/push.js'
import { Toggle } from './ProfileModal.jsx'

const PREF_ITEMS = [
  { key: 'bookingReminders', label: 'Bron eslatmalari', description: 'Tasdiqlangan mashg‘ulotdan 2 soat oldin eslatma' },
  { key: 'promotions', label: 'Chegirma va aksiyalar', description: 'Majmualardagi maxsus takliflar' },
  { key: 'news', label: 'Sport yangiliklari', description: 'Muhim yangiliklar e’lon qilinganda' },
]

const PUSH_TEXT = {
  on: 'Yoqilgan — sayt yopiq bo‘lsa ham xabar keladi',
  off: 'Sayt yopiq bo‘lsa ham xabarlarni brauzer orqali oling',
  denied: 'Brauzerda bloklangan. Manzil satridagi qulf belgisi → Bildirishnomalar → Ruxsat berish',
  unsupported: 'Bu brauzer qo‘llab-quvvatlamaydi (iPhone’da saytni «Bosh ekranga qo‘shing»)',
  unavailable: 'Hozircha mavjud emas',
}

/** Bildirishnoma sozlamalari — serverda saqlanadi, barcha qurilmalarda bir xil */
export default function NotificationSettings({ notify }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [push, setPush] = useState('off')
  const [busy, setBusy] = useState('')

  useEffect(() => {
    let active = true
    api('/notifications/prefs')
      .then((res) => active && setData(res))
      .catch((err) => active && setError(err.message))
    pushStatus().then((s) => active && setPush(s))
    return () => {
      active = false
    }
  }, [])

  // Telegram’ga ulanib qaytganda holatni yangilaymiz
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') api('/notifications/prefs').then(setData).catch(() => null)
    }
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [])

  async function setPref(key, value) {
    const prev = data
    setData((d) => ({ ...d, prefs: { ...d.prefs, [key]: value } }))
    try {
      setData(await api('/notifications/prefs', { method: 'PATCH', body: { [key]: value } }))
      notify(value ? 'Yoqildi' : 'O‘chirildi')
    } catch (err) {
      setData(prev)
      notify(err.message)
    }
  }

  async function togglePush(value) {
    setBusy('push')
    try {
      const next = value ? await enablePush(data.push.publicKey) : await disablePush()
      setPush(next)
      if (data.prefs.push !== value) await setPref('push', value)
      else notify(value ? 'Brauzer bildirishnomalari yoqildi' : 'Brauzer bildirishnomalari o‘chirildi')
    } catch (err) {
      notify(err.message)
      setPush(await pushStatus())
    } finally {
      setBusy('')
    }
  }

  async function unlinkTelegram() {
    setBusy('tg')
    try {
      setData(await api('/notifications/prefs', { method: 'DELETE' }))
      notify('Telegram uzildi')
    } catch (err) {
      notify(err.message)
    } finally {
      setBusy('')
    }
  }

  if (error) return <p className="pf-empty">{error}</p>
  if (!data) return <p className="pf-empty">Yuklanmoqda…</p>

  const pushState = !data.push.available ? 'unavailable' : push
  const pushOn = pushState === 'on' && data.prefs.push

  return (
    <>
      <p className="pf-note">Bron tasdiqlari va muhim tizim xabarlari saytda doim ko‘rinadi.</p>
      {PREF_ITEMS.map((item) => (
        <Toggle
          key={item.key}
          label={item.label}
          description={item.description}
          checked={Boolean(data.prefs[item.key])}
          onChange={(value) => setPref(item.key, value)}
        />
      ))}

      <div className="pf-channel">
        <span className="pf-channel__icon pf-channel__icon--tg" aria-hidden>
          <FaTelegram />
        </span>
        <div className="pf-channel__text">
          <strong>Telegram</strong>
          <span>
            {!data.telegram.available
              ? PUSH_TEXT.unavailable
              : data.telegram.linked
                ? 'Ulangan — xabarlar botga ham keladi'
                : 'Botga ulaning: bron holati va eslatmalar Telegram’ga keladi'}
          </span>
        </div>
        {data.telegram.available &&
          (data.telegram.linked ? (
            <div className="pf-channel__actions">
              <label className="pf-switch" title="Telegram xabarlari">
                <input
                  type="checkbox"
                  checked={data.prefs.telegram}
                  onChange={(e) => setPref('telegram', e.target.checked)}
                  aria-label="Telegram xabarlari"
                />
                <span className="pf-toggle__track" aria-hidden />
              </label>
              <button type="button" className="pf-link is-danger" onClick={unlinkTelegram} disabled={busy === 'tg'}>
                Uzish
              </button>
            </div>
          ) : (
            <a className="pf-channel__btn" href={data.telegram.botUrl} target="_blank" rel="noreferrer">
              Ulash
            </a>
          ))}
      </div>

      <div className="pf-channel">
        <span className="pf-channel__icon" aria-hidden>
          {pushOn ? <FiCheckCircle /> : <FiBell />}
        </span>
        <div className="pf-channel__text">
          <strong>Brauzer bildirishnomalari</strong>
          <span>{PUSH_TEXT[pushOn ? 'on' : pushState === 'on' ? 'off' : pushState]}</span>
        </div>
        {(pushState === 'on' || pushState === 'off') && (
          <label className="pf-switch">
            <input
              type="checkbox"
              checked={pushOn}
              disabled={busy === 'push'}
              onChange={(e) => togglePush(e.target.checked)}
              aria-label="Brauzer bildirishnomalari"
            />
            <span className="pf-toggle__track" aria-hidden />
          </label>
        )}
      </div>
    </>
  )
}
