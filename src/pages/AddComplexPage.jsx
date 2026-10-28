import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiImage,
  FiMapPin,
  FiPhone,
} from 'react-icons/fi'
import { useAuth } from '../context/auth.js'
import { api } from '../services/apiClient.js'
import MediaUploader from '../components/MediaUploader/MediaUploader.jsx'
import { isUploading, readyMedia } from '../utils/media.js'
import { categoryMenuItems } from '../data/categoryMenu.js'
import { isRegionActive, REGIONS } from '../data/regions.js'
import Select from '../components/ui/Select.jsx'
import { formatLocal, formatPhone, isValidPhone, PHONE_PREFIX, toLocalDigits } from '../utils/phone.js'
import './AddComplexPage.css'
import { tr } from '../i18n/index.js'

const MAX_DESCRIPTION = 600

const SPORTS = categoryMenuItems.filter((s) => s.id !== 'boshqa')
// Hozircha faqat Toshkent shahridagi majmualar qabul qilinadi
const REGION_OPTIONS = REGIONS.filter((r) => isRegionActive(r.id))

const AMENITIES = [
  'Dush va kiyinish xonasi',
  'Bepul avtoturargoh',
  'Bepul Wi-Fi',
  'Shaxsiy shkaflar',
  'Kafe va dam olish zonasi',
  'Inventar ijarasi',
  'Malakali murabbiylar',
  'Konditsioner',
]

const SECTIONS = [
  { id: 'basic', label: tr('Asosiy ma’lumotlar') },
  { id: 'location', label: tr('Manzil') },
  { id: 'pricing', label: tr('Narx va ish vaqti') },
  { id: 'amenities', label: tr('Qulayliklar') },
  { id: 'photos', label: tr('Rasm va video') },
  { id: 'contact', label: tr('Aloqa') },
]

function validate(form) {
  const errors = {}
  if (form.name.trim().length < 3) errors.name = tr('Majmua nomini kiriting')
  if (form.sports.length === 0) errors.sports = tr('Kamida bitta sport turini tanlang')
  if (form.description.trim().length < 30) errors.description = tr('Tavsif kamida 30 ta belgidan iborat bo‘lsin')
  if (!form.address.trim()) errors.address = tr('Manzilni kiriting')
  if (!Number(form.price)) errors.price = tr('Narxni kiriting')
  if (!form.opens || !form.closes) errors.hours = tr('Ish vaqtini kiriting')
  if (isUploading(form.media)) errors.photos = tr('Fayllar yuklanmoqda — tugashini kuting')
  else if (readyMedia(form.media).length === 0) errors.photos = tr('Kamida bitta rasm yoki video qo‘shing')
  if (!isValidPhone(form.phone)) errors.phone = tr('Telefon raqamni to‘liq kiriting')
  return errors
}

// Har bir bo‘lim to‘ldirilganmi — o‘ng paneldagi progress uchun
const SECTION_DONE = {
  basic: (f) => f.name.trim().length >= 3 && f.sports.length > 0 && f.description.trim().length >= 30,
  location: (f) => Boolean(f.address.trim()),
  pricing: (f) => Boolean(Number(f.price)) && Boolean(f.opens && f.closes),
  amenities: (f) => f.amenities.length > 0,
  photos: (f) => readyMedia(f.media).length > 0,
  contact: (f) => isValidPhone(f.phone),
}

const ERROR_SECTION = {
  name: 'basic',
  sports: 'basic',
  description: 'basic',
  address: 'location',
  price: 'pricing',
  hours: 'pricing',
  photos: 'photos',
  phone: 'contact',
}

export default function AddComplexPage() {
  const { user } = useAuth()
  const [form, setForm] = useState(() => ({
    name: '',
    sports: [],
    description: '',
    region: 'toshkent-shahar',
    address: '',
    landmark: '',
    price: '',
    opens: '07:00',
    closes: '23:00',
    amenities: [],
    media: [],
    phone: user?.phone ?? '',
    telegram: '',
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const coverItem = form.media.find((m) => m.type === 'image' && !m.error)
  const coverUrl = coverItem ? (coverItem.preview ?? coverItem.url) : null

  const progress = useMemo(
    () => SECTIONS.map((s) => ({ ...s, done: SECTION_DONE[s.id](form) })),
    [form],
  )
  const percent = Math.round((progress.filter((s) => s.done).length / SECTIONS.length) * 100)
  const regionLabel = REGION_OPTIONS.find((r) => r.id === form.region)?.label

  function set(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    const errorKey = key === 'opens' || key === 'closes' ? 'hours' : key
    if (errors[errorKey]) setErrors((prev) => ({ ...prev, [errorKey]: undefined }))
  }

  function toggle(key, value) {
    const list = form[key]
    set(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const setMedia = (updater) => {
    setForm((prev) => ({ ...prev, media: typeof updater === 'function' ? updater(prev.media) : updater }))
    if (errors.photos) setErrors((prev) => ({ ...prev, photos: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const next = validate(form)
    setErrors(next)
    const firstError = Object.keys(next)[0]
    if (firstError) {
      document.getElementById(`acf-${ERROR_SECTION[firstError]}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    setSubmitting(true)
    setSubmitError('')
    const { media, ...fields } = form
    try {
      const { submission } = await api('/submissions', {
        method: 'POST',
        body: { ...fields, phone: toLocalDigits(fields.phone), price: Number(fields.price), media: readyMedia(media) },
      })
      setSubmitted({ ...submission, name: form.name })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err.message)
      const field = err.field === 'media' ? 'photos' : err.field
      if (field && ERROR_SECTION[field]) {
        setErrors((prev) => ({ ...prev, [field]: err.message }))
        document.getElementById(`acf-${ERROR_SECTION[field]}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="acf-page">
        <div className="container acf-success">
          <span className="acf-success__icon" aria-hidden="true">
            <FiCheckCircle />
          </span>
          <h1>{tr('Majmua moderatsiyaga yuborildi')}</h1>
          <p>
            «{submitted.name}{tr('» ma’lumotlari tekshiruvga yuborildi. Odatda bu 24 soatgacha davom etadi — natija haqida sizga xabar beramiz.')}
          </p>
          <div className="acf-success__actions">
            <Link to="/profil" className="acf-btn acf-btn--primary">
              {tr('Profilimga o‘tish')}
            </Link>
            <Link to="/" className="acf-btn">
              {tr('Bosh sahifa')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="acf-page">
      <div className="container">
        <nav className="acf-crumbs" aria-label={tr('Breadcrumb')}>
          <Link to="/">{tr('Bosh sahifa')}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{tr('Majmua qo‘shish')}</span>
        </nav>

        <header className="acf-head">
          <h1>{tr('Sport majmuasini qo‘shish')}</h1>
          <p>
            {tr('Ma’lumotlarni to‘ldiring — moderatsiyadan so‘ng majmuangiz minglab foydalanuvchilarga ko‘rinadi.')}
          </p>
        </header>

        <form className="acf-layout" onSubmit={handleSubmit} noValidate>
          <div className="acf-sections">
            <Section id="basic" index={1} title={tr('Asosiy ma’lumotlar')} text={tr('Mijozlar birinchi ko‘radigan ma’lumotlar.')}>
              <Control label={tr('Majmua nomi')} required error={errors.name}>
                {(a11y) => (
                  <input
                    className="acf-input"
                    placeholder={tr('Masalan, Olimpiya Sport Majmuasi')}
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    {...a11y}
                  />
                )}
              </Control>

              <Control label={tr('Sport turlari')} required error={errors.sports} hint={tr('Bir nechtasini tanlash mumkin.')}>
                {(a11y) => (
                  <div className="acf-chips" role="group" {...a11y}>
                    {SPORTS.map(({ id, title, Icon, iconColor }) => {
                      const on = form.sports.includes(id)
                      return (
                        <button
                          key={id}
                          type="button"
                          className={`acf-chip ${on ? 'is-active' : ''}`}
                          aria-pressed={on}
                          onClick={() => toggle('sports', id)}
                        >
                          <Icon size={16} style={on ? undefined : { color: iconColor }} />
                          {title}
                        </button>
                      )
                    })}
                  </div>
                )}
              </Control>

              <Control label={tr('Tavsif')} required error={errors.description}>
                {(a11y) => (
                  <div className="acf-textarea">
                    <textarea
                      className="acf-input"
                      rows={5}
                      maxLength={MAX_DESCRIPTION}
                      placeholder={tr('Majmua, maydonlar, murabbiylar va xizmatlar haqida yozing…')}
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      {...a11y}
                    />
                    <span className="acf-counter">
                      {form.description.length}/{MAX_DESCRIPTION}
                    </span>
                  </div>
                )}
              </Control>
            </Section>

            <Section id="location" index={2} title={tr('Manzil')} text={tr('Mijozlar sizni xaritada oson topishi uchun.')}>
              <div className="acf-grid">
                <Control label={tr('Viloyat / Shahar')} required>
                  {() => (
                    <Select value={form.region} onChange={(v) => set('region', v)} options={REGION_OPTIONS} ariaLabel={tr('Viloyat / Shahar')} />
                  )}
                </Control>
                <Control label={tr('Manzil')} required error={errors.address}>
                  {(a11y) => (
                    <input
                      className="acf-input"
                      placeholder={tr('Ko‘cha, uy raqami')}
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      {...a11y}
                    />
                  )}
                </Control>
              </div>
              <Control label={tr('Mo‘ljal')} hint={tr('Ixtiyoriy.')}>
                {(a11y) => (
                  <input
                    className="acf-input"
                    placeholder={tr('Masalan, Minor metro bekati yonida')}
                    value={form.landmark}
                    onChange={(e) => set('landmark', e.target.value)}
                    {...a11y}
                  />
                )}
              </Control>
            </Section>

            <Section id="pricing" index={3} title={tr('Narx va ish vaqti')}>
              <div className="acf-grid acf-grid--3">
                <Control label={tr('Narx (1 soat)')} required error={errors.price}>
                  {(a11y) => (
                    <div className="acf-input acf-input--group">
                      <input
                        inputMode="numeric"
                        placeholder="150 000"
                        value={form.price ? Number(form.price).toLocaleString('ru-RU') : ''}
                        onChange={(e) => set('price', e.target.value.replace(/\D/g, '').slice(0, 9))}
                        {...a11y}
                      />
                      <span className="acf-input__suffix">{tr('so‘m')}</span>
                    </div>
                  )}
                </Control>
                <Control label={tr('Ochilish')} required error={errors.hours}>
                  {(a11y) => (
                    <input type="time" className="acf-input" value={form.opens} onChange={(e) => set('opens', e.target.value)} {...a11y} />
                  )}
                </Control>
                <Control label={tr('Yopilish')} required>
                  {(a11y) => (
                    <input type="time" className="acf-input" value={form.closes} onChange={(e) => set('closes', e.target.value)} {...a11y} />
                  )}
                </Control>
              </div>
            </Section>

            <Section id="amenities" index={4} title={tr('Qulayliklar')} text={tr('Majmuangizda mavjud bo‘lganlarini belgilang.')}>
              <div className="acf-checks">
                {AMENITIES.map((item) => (
                  <label key={item} className={`acf-check ${form.amenities.includes(item) ? 'is-active' : ''}`}>
                    <input type="checkbox" checked={form.amenities.includes(item)} onChange={() => toggle('amenities', item)} />
                    <span className="acf-check__box" aria-hidden="true">
                      <FiCheck />
                    </span>
                    {tr(item)}
                  </label>
                ))}
              </div>
            </Section>

            <Section
              id="photos"
              index={5}
              title={tr('Rasm va video')}
              text={tr('Sifatli rasm va videolar ko‘proq bron olib keladi. Istalgancha qo‘shing — birinchi rasm muqova bo‘ladi.')}
            >
              <MediaUploader
                value={form.media}
                onChange={setMedia}
                invalid={Boolean(errors.photos)}
                describedBy={errors.photos ? 'acf-photos-error' : undefined}
              />
              {errors.photos && (
                <p className="acf-error" id="acf-photos-error" role="alert">
                  {errors.photos}
                </p>
              )}
            </Section>

            <Section id="contact" index={6} title={tr('Aloqa')} text={tr('Bron va savollar uchun mijozlar shu raqamga murojaat qiladi.')}>
              <div className="acf-grid">
                <Control label={tr('Telefon raqam')} required error={errors.phone}>
                  {(a11y) => (
                    <div className="acf-input acf-input--group">
                      <span className="acf-input__prefix">{PHONE_PREFIX}</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        placeholder="90 123 45 67"
                        value={formatLocal(form.phone)}
                        onChange={(e) => set('phone', toLocalDigits(e.target.value))}
                        {...a11y}
                      />
                    </div>
                  )}
                </Control>
                <Control label={tr('Telegram')} hint={tr('Ixtiyoriy.')}>
                  {(a11y) => (
                    <input
                      className="acf-input"
                      placeholder={'@username'}
                      value={form.telegram}
                      onChange={(e) => set('telegram', e.target.value)}
                      {...a11y}
                    />
                  )}
                </Control>
              </div>
            </Section>
          </div>

          <aside className="acf-aside">
            <div className="acf-card">
              <div className="acf-progress__head">
                <p className="acf-aside__label">{tr('To‘ldirilganlik')}</p>
                <strong>{percent}%</strong>
              </div>
              <div className="acf-progress__bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={tr('To‘ldirilganlik')}>
                <span style={{ width: `${percent}%` }} />
              </div>
              <ul className="acf-progress__list">
                {progress.map((s) => (
                  <li key={s.id} className={s.done ? 'is-done' : ''}>
                    <a href={`#acf-${s.id}`}>
                      <span className="acf-progress__dot" aria-hidden="true">
                        {s.done && <FiCheck />}
                      </span>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>

              {submitError && (
                <p className="acf-error-banner" role="alert">
                  {submitError}
                </p>
              )}
              <button type="submit" className="acf-btn acf-btn--primary acf-submit" disabled={submitting} aria-busy={submitting}>
                {submitting && <span className="acf-spinner" aria-hidden="true" />}
                {tr('Moderatsiyaga yuborish')}
              </button>
              <p className="acf-note">{tr('Tekshiruv 24 soatgacha davom etadi. Joylash bepul.')}</p>
            </div>
            <div className="acf-card acf-preview">
              <p className="acf-aside__label">{tr('Ko‘rinishi')}</p>
              <div className="acf-preview__media">
                {coverUrl ? (
                  <img src={coverUrl} alt="" />
                ) : (
                  <span>
                    <FiImage aria-hidden="true" />
                    {tr('Muqova rasmi')}
                  </span>
                )}
              </div>
              <p className="acf-preview__price">
                {form.price ? `${Number(form.price).toLocaleString('ru-RU')} ${tr('so‘mdan')}` : tr('Narx ko‘rsatilmagan')}
              </p>
              <p className="acf-preview__name">{form.name || tr('Majmua nomi')}</p>
              <p className="acf-preview__meta">
                <FiMapPin aria-hidden="true" />
                {regionLabel}
                {form.address && `, ${form.address}`}
              </p>
              <p className="acf-preview__meta">
                <FiClock aria-hidden="true" />
                {form.opens} – {form.closes}
              </p>
              {isValidPhone(form.phone) && (
                <p className="acf-preview__meta">
                  <FiPhone aria-hidden="true" />
                  {formatPhone(form.phone)}
                </p>
              )}
            </div>

          </aside>
        </form>
      </div>
    </div>
  )
}

function Section({ id, index, title, text, children }) {
  return (
    <section id={`acf-${id}`} className="acf-card acf-section" aria-labelledby={`acf-${id}-title`}>
      <header className="acf-section__head">
        <span className="acf-section__num" aria-hidden="true">
          {index}
        </span>
        <div>
          <h2 id={`acf-${id}-title`}>{title}</h2>
          {text && <p>{text}</p>}
        </div>
      </header>
      <div className="acf-section__body">{children}</div>
    </section>
  )
}

function Control({ label, required, error, hint, children }) {
  const id = `acf-${label.replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()}`
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={`acf-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="acf-label">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children({ id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, 'aria-required': required || undefined })}
      {error ? (
        <p id={`${id}-error`} className="acf-error" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="acf-hint">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
