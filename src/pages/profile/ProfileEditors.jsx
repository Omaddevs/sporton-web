import { useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import Button from '../../components/ui/Button.jsx'
import { newId } from '../../hooks/useProfile.js'
import { formatLocal, isValidPhone, PHONE_PREFIX, toLocalDigits } from '../../utils/phone.js'
import {
  INTEREST_SUGGESTIONS,
  LANGUAGE_FLAGS,
  LANGUAGE_LEVELS,
  PROFILE_STATUSES,
  SPORT_LEVELS,
  SPORT_SUGGESTIONS,
} from '../../data/profile.js'
import { Field, ProfileModal, SelectInput, TagEditor } from './ProfileModal.jsx'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function PhoneInput({ value, onChange, ...rest }) {
  return (
    <div className="pf-phone">
      <span>{PHONE_PREFIX}</span>
      <input
        className="pf-input"
        inputMode="tel"
        placeholder="90 123 45 67"
        value={formatLocal(value)}
        onChange={(e) => onChange(toLocalDigits(e.target.value))}
        {...rest}
      />
    </div>
  )
}

/** Har bir forma: local state → tekshiruv → profilga yozish */
function useForm(initial) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState({})
  const set = (key) => (value) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }
  const bind = (key) => ({ value: values[key], onChange: (e) => set(key)(e.target.value) })
  return { values, errors, setErrors, set, bind, setValues }
}

function HeroEditor({ profile, onSave, onClose }) {
  const { values, errors, setErrors, set, bind } = useForm({
    name: profile.name,
    title: profile.title,
    status: profile.status,
    location: profile.location,
    bio: profile.bio,
  })

  function submit() {
    const next = {}
    if (values.name.trim().length < 3) next.name = 'Ism va familiyani kiriting'
    if (Object.keys(next).length) return setErrors(next)
    onSave(
      {
        name: values.name.trim(),
        title: values.title.trim(),
        status: values.status,
        location: values.location.trim(),
        bio: values.bio.trim(),
      },
      'Profil yangilandi',
    )
  }

  return (
    <ProfileModal open title="Profilni tahrirlash" onClose={onClose} onSubmit={submit} wide>
      <div className="pf-grid">
        <Field label="To‘liq ism" error={errors.name}>
          <input className="pf-input" maxLength={60} autoFocus {...bind('name')} />
        </Field>
        <Field label="Holat">
          <SelectInput value={values.status} onChange={set('status')} options={PROFILE_STATUSES} />
        </Field>
        <Field label="Qisqa tavsif" hint="Masalan: Havaskor sportchi · Fitnes va suzish">
          <input className="pf-input" maxLength={80} {...bind('title')} />
        </Field>
        <Field label="Joylashuv">
          <input className="pf-input" maxLength={60} placeholder="Toshkent, Yunusobod" {...bind('location')} />
        </Field>
        <Field label="Bio" full hint={`${values.bio.length}/280`}>
          <textarea className="pf-input pf-textarea" rows={3} maxLength={280} {...bind('bio')} />
        </Field>
      </div>
    </ProfileModal>
  )
}

function PersonalEditor({ profile, onSave, onClose }) {
  const { values, errors, setErrors, set, bind } = useForm({
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
    birthDate: profile.birthDate,
    address: profile.address,
    level: profile.level || SPORT_LEVELS[0],
    emergencyPhone: profile.emergencyPhone,
  })

  function submit() {
    const next = {}
    if (values.name.trim().length < 3) next.name = 'Ism va familiyani kiriting'
    if (!isValidPhone(values.phone)) next.phone = 'Telefon raqamni to‘liq kiriting'
    if (values.email && !EMAIL_RE.test(values.email.trim())) next.email = 'Email noto‘g‘ri formatda'
    if (values.birthDate && new Date(values.birthDate) > new Date()) next.birthDate = 'Sana kelajakda bo‘lishi mumkin emas'
    if (values.emergencyPhone && !isValidPhone(values.emergencyPhone)) next.emergencyPhone = 'Raqamni to‘liq kiriting'
    if (values.emergencyPhone && values.emergencyPhone === values.phone)
      next.emergencyPhone = 'O‘zingizning raqamingizdan boshqa raqam kiriting'
    if (Object.keys(next).length) return setErrors(next)
    onSave(
      {
        name: values.name.trim(),
        phone: values.phone,
        email: values.email.trim(),
        birthDate: values.birthDate,
        address: values.address.trim(),
        level: values.level,
        emergencyPhone: values.emergencyPhone,
      },
      'Shaxsiy ma’lumot saqlandi',
    )
  }

  return (
    <ProfileModal open title="Shaxsiy ma’lumot" onClose={onClose} onSubmit={submit} wide>
      <div className="pf-grid">
        <Field label="To‘liq ism" error={errors.name}>
          <input className="pf-input" maxLength={60} autoComplete="name" {...bind('name')} />
        </Field>
        <Field label="Telefon" error={errors.phone}>
          <PhoneInput value={values.phone} onChange={set('phone')} autoComplete="tel" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="pf-input" type="email" autoComplete="email" placeholder="ism@email.com" {...bind('email')} />
        </Field>
        <Field label="Tug‘ilgan sana" error={errors.birthDate}>
          <input className="pf-input" type="date" max={new Date().toISOString().slice(0, 10)} {...bind('birthDate')} />
        </Field>
        <Field label="Manzil">
          <input className="pf-input" maxLength={80} placeholder="Shahar, tuman" {...bind('address')} />
        </Field>
        <Field label="Sport darajasi">
          <SelectInput value={values.level} onChange={set('level')} options={SPORT_LEVELS} />
        </Field>
        <Field
          label="Favqulodda aloqa raqami"
          error={errors.emergencyPhone}
          hint="Mashg‘ulot paytida kutilmagan holatda bog‘lanish uchun yaqin kishingiz raqami"
          full
        >
          <PhoneInput value={values.emergencyPhone} onChange={set('emergencyPhone')} />
        </Field>
      </div>
    </ProfileModal>
  )
}

function AboutEditor({ profile, onSave, onClose }) {
  const [about, setAbout] = useState(profile.about)
  return (
    <ProfileModal
      open
      title="Men haqimda"
      onClose={onClose}
      onSubmit={() => onSave({ about: about.trim() }, 'Ma’lumot saqlandi')}
    >
      <Field label="O‘zingiz haqingizda" hint={`${about.length}/600`} full>
        <textarea
          className="pf-input pf-textarea"
          rows={6}
          maxLength={600}
          autoFocus
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />
      </Field>
    </ProfileModal>
  )
}

function TagsEditor({ profile, field, title, suggestions, placeholder, onSave, onClose }) {
  const [tags, setTags] = useState(profile[field])
  return (
    <ProfileModal open title={title} onClose={onClose} onSubmit={() => onSave({ [field]: tags }, `${title} saqlandi`)}>
      <TagEditor value={tags} onChange={setTags} suggestions={suggestions} placeholder={placeholder} />
    </ProfileModal>
  )
}

function LanguagesEditor({ profile, onSave, onClose }) {
  const [rows, setRows] = useState(profile.languages)
  const [error, setError] = useState('')
  const known = Object.keys(LANGUAGE_FLAGS)

  function patch(id, data) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...data } : row)))
    setError('')
  }

  function submit() {
    const clean = rows.map((row) => ({ ...row, name: row.name.trim() })).filter((row) => row.name)
    const names = clean.map((row) => row.name.toLowerCase())
    if (new Set(names).size !== names.length) return setError('Bir xil til ikki marta qo‘shilgan')
    onSave({ languages: clean }, 'Tillar saqlandi')
  }

  return (
    <ProfileModal open title="Tillar" onClose={onClose} onSubmit={submit}>
      <datalist id="pf-lang-list">
        {known.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <div className="pf-rows">
        {rows.map((row) => (
          <div key={row.id} className="pf-row">
            <span className="profile-langs__flag" aria-hidden>
              {LANGUAGE_FLAGS[row.name.trim()] ?? '🌐'}
            </span>
            <input
              className="pf-input"
              list="pf-lang-list"
              placeholder="Til nomi"
              value={row.name}
              maxLength={30}
              onChange={(e) => patch(row.id, { name: e.target.value })}
            />
            <SelectInput
              value={row.level}
              onChange={(level) => patch(row.id, { level })}
              options={LANGUAGE_LEVELS}
              aria-label="Daraja"
            />
            <button
              type="button"
              className="pf-icon-btn is-danger"
              aria-label="Tilni o‘chirish"
              onClick={() => setRows((prev) => prev.filter((item) => item.id !== row.id))}
            >
              <FiTrash2 />
            </button>
          </div>
        ))}
        {!rows.length && <p className="pf-muted">Hali til qo‘shilmagan</p>}
      </div>
      {error && <p className="pf-field__error">{error}</p>}
      <Button
        type="button"
        variant="outline"
        icon={<FiPlus />}
        className="pf-add-row"
        onClick={() => setRows((prev) => [...prev, { id: newId('lang'), name: '', level: 'O‘rta' }])}
      >
        Til qo‘shish
      </Button>
    </ProfileModal>
  )
}

function ExperienceEditor({ profile, item, onSave, onClose }) {
  const { values, errors, setErrors, bind } = useForm({
    role: item?.role ?? '',
    company: item?.company ?? '',
    years: item?.years ?? '',
    points: item?.points.join('\n') ?? '',
  })

  function submit() {
    const next = {}
    if (!values.role.trim()) next.role = 'Yo‘nalishni kiriting'
    if (!values.company.trim()) next.company = 'Klub yoki majmua nomini kiriting'
    if (Object.keys(next).length) return setErrors(next)
    const entry = {
      id: item?.id ?? newId('exp'),
      role: values.role.trim(),
      company: values.company.trim(),
      years: values.years.trim(),
      points: values.points
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }
    const list = item
      ? profile.experience.map((row) => (row.id === item.id ? entry : row))
      : [entry, ...profile.experience]
    onSave({ experience: list }, item ? 'Tajriba yangilandi' : 'Tajriba qo‘shildi')
  }

  return (
    <ProfileModal open title={item ? 'Tajribani tahrirlash' : 'Tajriba qo‘shish'} onClose={onClose} onSubmit={submit} wide>
      <div className="pf-grid">
        <Field label="Yo‘nalish" error={errors.role}>
          <input className="pf-input" placeholder="Masalan: Suzish" maxLength={60} autoFocus {...bind('role')} />
        </Field>
        <Field label="Klub / majmua" error={errors.company}>
          <input className="pf-input" placeholder="Masalan: Aqua Life" maxLength={60} {...bind('company')} />
        </Field>
        <Field label="Davr" full>
          <input className="pf-input" placeholder="2022 — hozirgacha" maxLength={40} {...bind('years')} />
        </Field>
        <Field label="Natijalar" hint="Har bir natijani yangi qatordan yozing" full>
          <textarea className="pf-input pf-textarea" rows={4} {...bind('points')} />
        </Field>
      </div>
    </ProfileModal>
  )
}

function EducationEditor({ profile, item, onSave, onClose }) {
  const { values, errors, setErrors, bind } = useForm({
    degree: item?.degree ?? '',
    school: item?.school ?? '',
    years: item?.years ?? String(new Date().getFullYear()),
  })

  function submit() {
    const next = {}
    if (!values.degree.trim()) next.degree = 'Yutuq nomini kiriting'
    if (!values.school.trim()) next.school = 'Musobaqa yoki tashkilotni kiriting'
    if (Object.keys(next).length) return setErrors(next)
    const entry = {
      id: item?.id ?? newId('edu'),
      degree: values.degree.trim(),
      school: values.school.trim(),
      years: values.years.trim(),
    }
    const list = item
      ? profile.education.map((row) => (row.id === item.id ? entry : row))
      : [entry, ...profile.education]
    onSave({ education: list }, item ? 'Yutuq yangilandi' : 'Yutuq qo‘shildi')
  }

  return (
    <ProfileModal open title={item ? 'Yutuqni tahrirlash' : 'Yutuq qo‘shish'} onClose={onClose} onSubmit={submit}>
      <div className="pf-grid pf-grid--single">
        <Field label="Yutuq / sertifikat" error={errors.degree}>
          <input className="pf-input" placeholder="10 km — finisher medali" maxLength={80} autoFocus {...bind('degree')} />
        </Field>
        <Field label="Musobaqa / tashkilot" error={errors.school}>
          <input className="pf-input" placeholder="Toshkent yarim marafoni" maxLength={80} {...bind('school')} />
        </Field>
        <Field label="Yil">
          <input className="pf-input" inputMode="numeric" maxLength={20} {...bind('years')} />
        </Field>
      </div>
    </ProfileModal>
  )
}

/** editor: { type, item? } — qaysi forma ochiq ekanini bildiradi */
export default function ProfileEditor({ editor, profile, update, notify, onClose }) {
  if (!editor) return null

  const onSave = (patch, message) => {
    update(patch)
    notify(message)
    onClose()
  }
  const props = { profile, onSave, onClose, item: editor.item }

  switch (editor.type) {
    case 'hero':
      return <HeroEditor {...props} />
    case 'personal':
      return <PersonalEditor {...props} />
    case 'about':
      return <AboutEditor {...props} />
    case 'skills':
      return (
        <TagsEditor
          {...props}
          field="skills"
          title="Sport turlari"
          suggestions={SPORT_SUGGESTIONS}
          placeholder="Sport turini yozing va Enter bosing"
        />
      )
    case 'interests':
      return (
        <TagsEditor
          {...props}
          field="interests"
          title="Qiziqishlar"
          suggestions={INTEREST_SUGGESTIONS}
          placeholder="Qiziqishni yozing va Enter bosing"
        />
      )
    case 'languages':
      return <LanguagesEditor {...props} />
    case 'experience':
      return <ExperienceEditor {...props} />
    case 'education':
      return <EducationEditor {...props} />
    default:
      return null
  }
}
