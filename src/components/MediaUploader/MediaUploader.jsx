import { useEffect, useRef, useState } from 'react'
import {
  FiChevronLeft,
  FiChevronRight,
  FiImage,
  FiInstagram,
  FiLink,
  FiPlay,
  FiRefreshCw,
  FiTrash2,
  FiUploadCloud,
} from 'react-icons/fi'
import { uploadMedia } from '../../services/uploads.js'
import { MediaLinkError, mediaThumb, parseMediaLink } from '../../utils/media.js'
import './MediaUploader.css'
import { tr } from '../../i18n/index.js'

const PROVIDER_LABEL = { youtube: 'YouTube', instagram: 'Instagram', link: tr('Havola') }

let seq = 0
const newKey = () => `m${Date.now().toString(36)}${(seq += 1)}`

/**
 * Rasm/video yuklash va havola qo‘shish. Son cheklanmagan, har bir fayl alohida yuklanadi
 * (progress bilan), birinchi rasm — muqova, tartibni o‘zgartirish mumkin.
 */
export default function MediaUploader({ value, onChange, invalid = false, describedBy }) {
  const [link, setLink] = useState('')
  const [linkError, setLinkError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef(null)
  const jobs = useRef(new Map())

  // Sahifadan chiqqanda: davom etayotgan yuklashlar to‘xtatiladi, preview URL’lar bo‘shatiladi
  useEffect(() => {
    const running = jobs.current
    return () => {
      running.forEach((job) => {
        job.abort?.()
        URL.revokeObjectURL(job.preview)
      })
      running.clear()
    }
  }, [])

  const patch = (key, next) => onChange((items) => items.map((i) => (i.key === key ? { ...i, ...next } : i)))

  function start(key, file) {
    const job = jobs.current.get(key) ?? { file, preview: URL.createObjectURL(file) }
    const { promise, abort } = uploadMedia(file, (progress) => patch(key, { progress }))
    jobs.current.set(key, { ...job, abort })
    promise
      .then((res) => {
        const current = jobs.current.get(key)
        if (current) URL.revokeObjectURL(current.preview)
        jobs.current.delete(key)
        patch(key, { url: res.url, type: res.type, progress: undefined, preview: undefined, error: undefined })
      })
      .catch((err) => {
        // Qayta urinish faqat tarmoq yoki server xatosida ma’noli (turi/hajmi xato bo‘lsa — yo‘q)
        if (jobs.current.has(key)) patch(key, { error: err.message, retryable: !err.status || err.status >= 500 })
      })
    return job.preview
  }

  function addFiles(fileList) {
    const files = [...fileList].filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
    if (!files.length) return
    const added = files.map((file) => {
      const key = newKey()
      const preview = start(key, file)
      return {
        key,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        provider: 'file',
        url: '',
        preview,
        name: file.name,
        progress: 0,
      }
    })
    onChange((items) => [...items, ...added])
  }

  function retry(key) {
    const job = jobs.current.get(key)
    if (!job) return
    patch(key, { error: undefined, retryable: false, progress: 0 })
    start(key, job.file)
  }

  function remove(key) {
    const job = jobs.current.get(key)
    if (job) {
      jobs.current.delete(key)
      job.abort?.()
      URL.revokeObjectURL(job.preview)
    }
    onChange((items) => items.filter((i) => i.key !== key))
  }

  function move(index, dir) {
    onChange((items) => {
      const target = index + dir
      if (target < 0 || target >= items.length) return items
      const next = [...items]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  function addLink() {
    setLinkError('')
    try {
      const item = parseMediaLink(link)
      if (value.some((i) => i.url === item.url)) {
        setLinkError('Bu havola allaqachon qo‘shilgan')
        return
      }
      onChange((items) => [...items, { ...item, key: newKey() }])
      setLink('')
    } catch (error) {
      setLinkError(error instanceof MediaLinkError ? error.message : tr('Havola noto‘g‘ri'))
    }
  }

  const coverKey = value.find((i) => i.type === 'image' && !i.error)?.key
  const uploadingCount = value.filter((i) => i.progress != null && !i.error).length

  return (
    <div className="mu" aria-describedby={describedBy}>
      <div
        className={`mu-drop ${dragging ? 'is-over' : ''} ${invalid ? 'has-error' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          addFiles(e.dataTransfer.files)
        }}
      >
        <FiUploadCloud className="mu-drop__icon" aria-hidden="true" />
        <div className="mu-drop__text">
          <strong>{tr('Rasm yoki video yuklang')}</strong>
          <span>{tr('Tortib tashlang yoki tanlang · JPG, PNG, WEBP, MP4, MOV · istalgancha')}</span>
        </div>
        <button type="button" className="mu-btn mu-btn--primary" onClick={() => fileRef.current?.click()}>
          {tr('Fayl tanlash')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      <div className="mu-link">
        <FiLink aria-hidden="true" />
        <input
          type="url"
          inputMode="url"
          value={link}
          onChange={(e) => {
            setLink(e.target.value)
            if (linkError) setLinkError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addLink()
            }
          }}
          placeholder={tr('Yoki havola: YouTube, Instagram reels, rasm/video manzili')}
          aria-label={tr('Rasm yoki video havolasi')}
          aria-invalid={Boolean(linkError)}
        />
        <button type="button" className="mu-btn" onClick={addLink} disabled={!link.trim()}>
          {tr('Qo‘shish')}
        </button>
      </div>
      {linkError && (
        <p className="mu-error" role="alert">
          {linkError}
        </p>
      )}

      {value.length > 0 && (
        <>
          <p className="mu-summary">
            {value.filter((i) => i.type === 'image').length} {tr('rasm ·')} {value.filter((i) => i.type === 'video').length} {tr('video')}
            {uploadingCount > 0 && <span> · {uploadingCount} {tr('ta yuklanmoqda…')}</span>}
          </p>
          <ul className="mu-grid">
            {value.map((item, index) => {
              const thumb = item.preview && item.type === 'image' ? item.preview : mediaThumb(item)
              return (
                <li key={item.key} className={`mu-tile ${item.error ? 'is-error' : ''}`}>
                  <div className="mu-tile__media">
                    {thumb ? (
                      <img src={thumb} alt="" loading="lazy" />
                    ) : item.type === 'video' && item.provider !== 'instagram' ? (
                      <video src={item.preview ?? item.url} muted playsInline preload="metadata" />
                    ) : (
                      <span className="mu-tile__ph">
                        {item.provider === 'instagram' ? <FiInstagram /> : <FiImage />}
                      </span>
                    )}
                    {item.type === 'video' && (
                      <span className="mu-tile__play" aria-hidden="true">
                        <FiPlay />
                      </span>
                    )}
                    {item.key === coverKey && <span className="mu-tile__cover">{tr('Muqova')}</span>}
                    {item.progress != null && !item.error && (
                      <span className="mu-tile__progress" aria-label={tr('Yuklanmoqda {n}%', { n: item.progress })}>
                        <span style={{ width: `${item.progress}%` }} />
                        <em>{item.progress}%</em>
                      </span>
                    )}
                    {item.error && (
                      <span className="mu-tile__error">
                        {item.error}
                        {item.retryable && (
                          <button type="button" onClick={() => retry(item.key)}>
                            <FiRefreshCw aria-hidden="true" /> {tr('Qayta')}
                          </button>
                        )}
                      </span>
                    )}
                  </div>
                  <div className="mu-tile__bar">
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={tr('Oldinga surish')}>
                      <FiChevronLeft />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === value.length - 1}
                      aria-label={tr('Orqaga surish')}
                    >
                      <FiChevronRight />
                    </button>
                    <span>{PROVIDER_LABEL[item.provider] ?? (item.type === 'video' ? tr('Video') : tr('Rasm'))}</span>
                    <button type="button" className="is-danger" onClick={() => remove(item.key)} aria-label={tr('O‘chirish')}>
                      <FiTrash2 />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
