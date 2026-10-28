'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Crop, ImagePlus, Link2, Play, Trash2, X } from 'lucide-react'
import { MediaError, parseMediaLink, type MediaItem } from '@/lib/media'
import ImageCropper from './ImageCropper'
import { uploadBlob } from './upload'

type Tile = MediaItem & { key: string; progress?: number; error?: string }

let seq = 0
const keyOf = () => `m${Date.now()}${seq++}`

/** Yuklanib bo‘lgan, xatosiz elementlar — saqlanadigan ro‘yxat */
const readyOf = (list: Tile[]): MediaItem[] =>
  list.filter((t) => t.progress == null && !t.error).map(({ type, url, provider }) => ({ type, url, provider }))

export function thumbOf(item: MediaItem) {
  if (item.provider === 'youtube') return `https://img.youtube.com/vi/${item.url.split('/embed/')[1]}/hqdefault.jpg`
  return item.type === 'image' ? item.url : null
}

/** Majmua galereyasi: rasm/video yuklash, havola qo‘shish, tartib va muqova. Natija — hidden input «media» (JSON) */
export default function MediaManager({
  initial,
  name = 'media',
  emptyText = 'Hali rasm yoki video yo‘q.',
  onRemove,
}: {
  initial: MediaItem[]
  name?: string
  emptyText?: string
  /** Berilsa — o‘chirilgan zahoti qolgan ro‘yxat serverga saqlanadi */
  onRemove?: (media: MediaItem[]) => Promise<{ error?: string }>
}) {
  const [removeStatus, setRemoveStatus] = useState<{ kind: 'ok' | 'error' | 'busy'; text: string } | null>(null)
  const [tiles, setTiles] = useState<Tile[]>(() => initial.map((m) => ({ ...m, key: keyOf() })))
  const [link, setLink] = useState('')
  const [linkError, setLinkError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [cropKey, setCropKey] = useState<string | null>(null)
  const cropTile = tiles.find((t) => t.key === cropKey)
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const uploading = tiles.some((t) => t.progress != null && !t.error)

  // Yuklash tugamaguncha formani yuborishga yo‘l qo‘ymaymiz
  useEffect(() => {
    const form = rootRef.current?.closest('form')
    if (!form) return undefined
    const guard = (e: Event) => {
      if (uploading) {
        e.preventDefault()
        e.stopImmediatePropagation()
        window.alert('Fayllar yuklanmoqda — tugashini kuting')
      }
    }
    form.addEventListener('submit', guard, true)
    return () => form.removeEventListener('submit', guard, true)
  }, [uploading])

  const patch = (key: string, next: Partial<Tile>) => setTiles((list) => list.map((t) => (t.key === key ? { ...t, ...next } : t)))

  function addFiles(files: FileList | File[]) {
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) continue
      const key = keyOf()
      const preview = URL.createObjectURL(file)
      const type = file.type.startsWith('video/') ? 'video' : 'image'
      setTiles((list) => [...list, { key, type, provider: 'file', url: preview, progress: 0 }])
      uploadBlob(file, (p) => patch(key, { progress: p }))
        .then((res) => {
          URL.revokeObjectURL(preview)
          patch(key, { url: res.url, type: res.type, progress: undefined })
        })
        .catch((err: Error) => patch(key, { error: err.message }))
    }
  }

  function addLink() {
    setLinkError('')
    try {
      const item = parseMediaLink(link)
      if (tiles.some((t) => t.url === item.url)) {
        setLinkError('Bu havola allaqachon qo‘shilgan')
        return
      }
      setTiles((list) => [...list, { ...item, key: keyOf() }])
      setLink('')
    } catch (error) {
      setLinkError(error instanceof MediaError ? error.message : 'Havola noto‘g‘ri')
    }
  }

  const move = (index: number, dir: -1 | 1) =>
    setTiles((list) => {
      const next = [...list]
      const target = index + dir
      if (target < 0 || target >= next.length) return list
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  async function commit(next: Tile[]) {
    const before = tiles
    setTiles(next)
    if (!onRemove) return
    setRemoveStatus({ kind: 'busy', text: 'O‘chirilmoqda…' })
    try {
      const res = await onRemove(readyOf(next))
      if (res?.error) throw new Error(res.error)
      setRemoveStatus({ kind: 'ok', text: 'O‘chirildi va saqlandi' })
    } catch (error) {
      setTiles(before)
      setRemoveStatus({ kind: 'error', text: error instanceof Error ? error.message : 'O‘chirib bo‘lmadi' })
    }
  }

  const remove = (key: string) => commit(tiles.filter((x) => x.key !== key))

  function removeAll() {
    if (window.confirm(`Barcha ${tiles.length} ta rasm/videoni o‘chirasizmi?`)) commit([])
  }

  const ready = readyOf(tiles)
  const firstImage = tiles.find((t) => t.type === 'image' && t.progress == null && !t.error)?.key

  return (
    <div className="media" ref={rootRef}>
      <input type="hidden" name={name} value={JSON.stringify(ready)} />

      <div
        className={`media-drop ${dragging ? 'is-over' : ''}`}
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
        <ImagePlus aria-hidden="true" />
        <div>
          <b>Rasm yoki video yuklang</b>
          <span>Sudrab tashlang yoki tanlang · JPG, PNG, WEBP, GIF, MP4, MOV, WEBM · son cheklanmagan</span>
        </div>
        <button type="button" className="btn btn--sm" onClick={() => inputRef.current?.click()}>
          Fayl tanlash
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      <div className="media-link">
        <Link2 aria-hidden="true" />
        <input
          className="input"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addLink()
            }
          }}
          placeholder="Havola: YouTube, Instagram reels yoki rasm/video manzili (https://…)"
        />
        <button type="button" className="btn btn--sm" onClick={addLink} disabled={!link.trim()}>
          Qo‘shish
        </button>
      </div>
      {linkError && <p className="media-error">{linkError}</p>}

      {tiles.length > 1 && (
        <div className="media-toolbar">
          <span className="muted">{tiles.length} ta fayl</span>
          <button type="button" className="btn btn--sm btn--danger" onClick={removeAll}>
            <Trash2 size={14} /> Hammasini o‘chirish
          </button>
        </div>
      )}

      {tiles.length > 0 ? (
        <ul className="media-grid">
          {tiles.map((t, i) => {
            const thumb = thumbOf(t)
            return (
              <li key={t.key} className={`media-tile ${t.error ? 'is-error' : ''}`}>
                <div className="media-tile__preview">
                  {thumb ? (
                    <img src={thumb} alt="" loading="lazy" />
                  ) : t.type === 'video' && t.provider !== 'instagram' ? (
                    <video src={t.url} muted preload="metadata" />
                  ) : (
                    <span className="media-tile__label">Instagram</span>
                  )}
                  {t.type === 'video' && (
                    <span className="media-tile__play" aria-hidden="true">
                      <Play size={14} />
                    </span>
                  )}
                  {t.key === firstImage && <span className="media-tile__cover">Muqova</span>}
                  {t.progress != null && !t.error && (
                    <span className="media-tile__progress">
                      <span style={{ width: `${t.progress}%` }} />
                      <em>{t.progress}%</em>
                    </span>
                  )}
                  {t.error && <span className="media-tile__err">{t.error}</span>}
                  <button type="button" className="media-tile__remove" onClick={() => remove(t.key)} aria-label="O‘chirish" title="O‘chirish">
                    <X size={15} strokeWidth={2.6} />
                  </button>
                </div>
                <div className="media-tile__bar">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Chapga">
                    <ArrowLeft size={14} />
                  </button>
                  <span>{t.provider === 'file' ? (t.type === 'video' ? 'Video' : 'Rasm') : t.provider === 'link' ? 'Havola' : t.provider}</span>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === tiles.length - 1} aria-label="O‘ngga">
                    <ArrowRight size={14} />
                  </button>
                  {t.type === 'image' && t.progress == null && !t.error && (
                    <button type="button" onClick={() => setCropKey(t.key)} aria-label="Kesish" title="Kesish">
                      <Crop size={14} />
                    </button>
                  )}
                  <button type="button" onClick={() => remove(t.key)} aria-label="O‘chirish" className="is-danger">
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="muted" style={{ margin: 0 }}>{emptyText}</p>
      )}
      <small className="muted">
        Birinchi rasm — muqova (kartochkalarda ko‘rinadi). Tartibni strelkalar bilan o‘zgartiring. O‘chirish — rasm
        burchagidagi ✕{onRemove ? ' (darhol saqlanadi)' : ''}.
        {uploading && ' · Yuklanmoqda…'}
      </small>
      {removeStatus && (
        <p className={removeStatus.kind === 'error' ? 'media-error' : 'muted'} style={{ margin: 0 }} role="status">
          {removeStatus.text}
        </p>
      )}

      {cropTile && (
        <ImageCropper
          src={cropTile.url}
          defaultAspect="orig"
          onCancel={() => setCropKey(null)}
          onDone={(url) => {
            patch(cropTile.key, { url, provider: 'file', type: 'image' })
            setCropKey(null)
          }}
        />
      )}
    </div>
  )
}
