'use client'

import { useEffect, useRef, useState } from 'react'
import { Crop, ImagePlus, Link2, Trash2, Upload } from 'lucide-react'
import ImageCropper, { ASPECTS } from './ImageCropper'

type AspectId = (typeof ASPECTS)[number]['id']

const isAllowedUrl = (url: string) => /^https:\/\//.test(url) || /^\/(images|api\/v1\/files)\//.test(url)

/**
 * Muqova rasmi: fayl tanlash/tortib tashlash → kesish oynasi → yuklash. Mavjud rasmni qayta
 * kesish yoki havola qo‘yish ham mumkin. Natija — hidden input (URL).
 */
export default function CoverImageField({
  name,
  initial,
  aspect = '16:9',
}: {
  name: string
  initial?: string | null
  aspect?: AspectId
}) {
  const [value, setValue] = useState(initial ?? '')
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [showLink, setShowLink] = useState(false)
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [over, setOver] = useState(false)
  // Ko‘rinish tanlangan nisbatda — banner kabi keng rasmlar kesilmay ko‘rinadi
  const ratio = ASPECTS.find((a) => a.id === aspect)?.value || undefined
  const fileRef = useRef<HTMLInputElement>(null)
  const objectUrl = useRef<string | null>(null)

  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
  }, [])

  function openFile(file: File | undefined) {
    setError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Faqat rasm fayli tanlang')
      return
    }
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current)
    objectUrl.current = URL.createObjectURL(file)
    setCropSrc(objectUrl.current)
  }

  function applyLink() {
    const url = link.trim()
    if (!isAllowedUrl(url)) {
      setError('Havola https:// bilan boshlanishi kerak')
      return
    }
    setValue(url)
    setLink('')
    setShowLink(false)
    setError('')
  }

  return (
    <div className="cover-field">
      <input type="hidden" name={name} value={value} />
      <div
        className={`cover-field__preview ${over ? 'is-over' : ''}`}
        style={{ aspectRatio: ratio }}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          openFile(e.dataTransfer.files[0])
        }}
      >
        {value ? (
          <img src={value} alt="Muqova" />
        ) : (
          <button type="button" className="cover-field__empty btn--ghost" style={{ border: 0, background: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }} onClick={() => fileRef.current?.click()}>
            <ImagePlus aria-hidden="true" />
            <b>Muqova rasmini yuklang</b>
            <span>Tortib tashlang yoki bosing — keyin kesasiz</span>
          </button>
        )}
      </div>

      <div className="cover-field__actions">
        <button type="button" className="btn btn--sm" onClick={() => fileRef.current?.click()}>
          <Upload /> {value ? 'Almashtirish' : 'Yuklash'}
        </button>
        {value && (
          <button type="button" className="btn btn--sm" onClick={() => setCropSrc(value)}>
            <Crop /> Kesish
          </button>
        )}
        <button type="button" className="btn btn--sm" onClick={() => setShowLink((v) => !v)} aria-expanded={showLink}>
          <Link2 /> Havola
        </button>
        {value && (
          <button type="button" className="btn btn--sm btn--danger" onClick={() => setValue('')}>
            <Trash2 /> O‘chirish
          </button>
        )}
      </div>

      {showLink && (
        <div className="cover-field__link">
          <input
            className="input"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applyLink()
              }
            }}
            placeholder="https://…/rasm.jpg"
          />
          <button type="button" className="btn" onClick={applyLink} disabled={!link.trim()}>
            Qo‘yish
          </button>
        </div>
      )}
      {error && <p className="media-error">{error}</p>}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          openFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          defaultAspect={aspect}
          onCancel={() => setCropSrc(null)}
          onDone={(url) => {
            setValue(url)
            setCropSrc(null)
          }}
        />
      )}
    </div>
  )
}
