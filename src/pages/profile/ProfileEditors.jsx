import { tr } from '../../i18n/index.js'
import { useState } from 'react'
import { categories } from '../../data/categories.js'
import { REGIONS } from '../../data/regions.js'
import { Field, ProfileModal } from './ProfileModal.jsx'

// Hudud id’si saqlanadi (tildan qat’i nazar bir xil), ko‘rsatishda nomi tanlangan tilda
const CITY_OPTIONS = [{ value: '', label: tr('Tanlanmagan') }, ...REGIONS.filter((r) => r.id !== 'all').map((r) => ({ value: r.id, label: r.label }))]
const SPORTS = categories.filter((c) => c.id !== 'boshqa' && c.id !== 'all')
const MAX_BIO = 300

/** Profilni tahrirlash: faqat serverda saqlanadigan haqiqiy maydonlar */
export default function ProfileEditor({ open, profile, update, notify, onClose }) {
  const [form, setForm] = useState(() => ({
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    email: profile.email ?? '',
    city: profile.city ?? '',
    bio: profile.bio ?? '',
    sports: profile.sports ?? [],
  }))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }
  const toggleSport = (id) =>
    setForm((prev) => ({ ...prev, sports: prev.sports.includes(id) ? prev.sports.filter((s) => s !== id) : [...prev.sports, id] }))

  async function submit() {
    const next = {}
    if (form.firstName.trim().length < 2) next.firstName = tr('Ismingizni kiriting')
    if (form.lastName.trim().length < 2) next.lastName = tr('Familiyangizni kiriting')
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = tr('Email noto‘g‘ri')
    if (Object.keys(next).length) return setErrors(next)
    setSaving(true)
    try {
      await update({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        city: form.city,
        bio: form.bio.trim(),
        sports: form.sports,
      })
      notify(tr('Profil saqlandi'))
      onClose()
    } catch (err) {
      setErrors({ [err.field ?? 'firstName']: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ProfileModal open={open} title={tr('Profilni tahrirlash')} onClose={onClose} onSubmit={submit} submitLabel={saving ? tr('Saqlanmoqda…') : tr('Saqlash')} wide>
      <div className="pf-grid">
        <Field label={tr('Ism')} error={errors.firstName}>
          <input className="pf-input" value={form.firstName} onChange={set('firstName')} maxLength={50} autoComplete="given-name" />
        </Field>
        <Field label={tr('Familiya')} error={errors.lastName}>
          <input className="pf-input" value={form.lastName} onChange={set('lastName')} maxLength={50} autoComplete="family-name" />
        </Field>
        <Field label={tr('Email (ixtiyoriy)')} error={errors.email}>
          <input className="pf-input" type="email" value={form.email} onChange={set('email')} autoComplete="email" placeholder={'nom@email.uz'} />
        </Field>
        <Field label={tr('Shahar / hudud')}>
          <select className="pf-input pf-select" value={form.city} onChange={set('city')}>
            {CITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={tr('O‘zim haqimda (ixtiyoriy)')} hint={`${MAX_BIO - form.bio.length} belgi qoldi`} full>
          <textarea
            className="pf-input pf-textarea"
            rows={3}
            maxLength={MAX_BIO}
            value={form.bio}
            onChange={set('bio')}
            placeholder={tr('Masalan: haftasiga 3 marta mini-futbol o‘ynayman')}
          />
        </Field>
        <div className="pf-field pf-field--full">
          <span className="pf-field__label">{tr('Qiziqadigan sport turlari')}</span>
          <div className="profile-tags">
            {SPORTS.map((s) => {
              const on = form.sports.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  className={`profile-tag${on ? '' : ' profile-tag--outline'}`}
                  onClick={() => toggleSport(s.id)}
                >
                  {s.title}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </ProfileModal>
  )
}
