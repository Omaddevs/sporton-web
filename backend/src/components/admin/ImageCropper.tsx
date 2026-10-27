'use client'

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Minus, Move, Plus, RotateCcw, X } from 'lucide-react'
import { uploadBlob } from './upload'

export const ASPECTS = [
  { id: '16:9', label: '16:9', value: 16 / 9 },
  { id: '21:9', label: '21:9', value: 21 / 9 },
  { id: '16:3', label: '16:3', value: 16 / 3 },
  { id: '24:5', label: '24:5', value: 24 / 5 },
  { id: '2:1', label: '2:1', value: 2 },
  { id: '4:3', label: '4:3', value: 4 / 3 },
  { id: '1:1', label: '1:1', value: 1 },
  { id: '3:4', label: '3:4', value: 3 / 4 },
  { id: '9:16', label: '9:16', value: 9 / 16 },
  { id: 'orig', label: 'Asl', value: 0 },
] as const

type AspectId = (typeof ASPECTS)[number]['id']

const MAX_ZOOM = 5
const MAX_OUTPUT = 2000

/**
 * Rasmni kesish: ramka ichida rasmni surish (sichqoncha/barmoq/strelkalar), zoom (slayder,
 * g‘ildirak, +/−), nisbat tanlash. Natija JPEG qilib yuklanadi va yangi URL qaytariladi.
 */
export default function ImageCropper({
  src,
  defaultAspect = '16:9',
  onCancel,
  onDone,
}: {
  src: string
  defaultAspect?: AspectId
  onCancel: () => void
  onDone: (url: string) => void
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [stageW, setStageW] = useState(0)
  const [aspectId, setAspectId] = useState<AspectId>(defaultAspect)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [status, setStatus] = useState<{ busy: boolean; progress: number; error: string }>({ busy: false, progress: 0, error: '' })

  // Rasmni yuklash. Boshqa domendagi rasm uchun CORS so‘raymiz (aks holda canvas «ifloslanadi»)
  useEffect(() => {
    const img = new Image()
    const absolute = /^https?:\/\//.test(src) && !src.startsWith(window.location.origin)
    if (absolute) img.crossOrigin = 'anonymous'
    img.onload = () => {
      imgRef.current = img
      setNatural({ w: img.naturalWidth, h: img.naturalHeight })
    }
    img.onerror = () => setStatus((s) => ({ ...s, error: 'Rasmni ochib bo‘lmadi. Uni kompyuterga saqlab, qayta yuklang' }))
    img.src = src
  }, [src])

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return undefined
    const observer = new ResizeObserver(([entry]) => setStageW(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const aspect = ASPECTS.find((a) => a.id === aspectId)!.value || (natural ? natural.w / natural.h : 16 / 9)
  const maxH = typeof window === 'undefined' ? 480 : Math.min(window.innerHeight * 0.55, 560)
  let frameW = stageW
  let frameH = frameW / aspect
  if (frameH > maxH) {
    frameH = maxH
    frameW = frameH * aspect
  }

  const baseScale = natural ? Math.max(frameW / natural.w, frameH / natural.h) : 1
  const scale = baseScale * zoom
  const dispW = natural ? natural.w * scale : 0
  const dispH = natural ? natural.h * scale : 0

  const clamp = useCallback(
    (x: number, y: number, w = dispW, h = dispH) => ({
      x: Math.min(0, Math.max(frameW - w, x)),
      y: Math.min(0, Math.max(frameH - h, y)),
    }),
    [frameW, frameH, dispW, dispH],
  )

  // Nisbat yoki o‘lcham o‘zgarsa — markazga qo‘yamiz
  useEffect(() => {
    if (!natural || !frameW) return
    setZoom(1)
    const s = Math.max(frameW / natural.w, frameH / natural.h)
    setOffset({ x: (frameW - natural.w * s) / 2, y: (frameH - natural.h * s) / 2 })
  }, [natural, aspectId, frameW, frameH])

  /** Zoom: ramka markazidagi nuqta joyida qoladi */
  function applyZoom(next: number) {
    if (!natural) return
    const z = Math.min(MAX_ZOOM, Math.max(1, next))
    const s1 = baseScale * zoom
    const s2 = baseScale * z
    const cx = (frameW / 2 - offset.x) / s1
    const cy = (frameH / 2 - offset.y) / s1
    const w = natural.w * s2
    const h = natural.h * s2
    setZoom(z)
    setOffset(clamp(frameW / 2 - cx * s2, frameH / 2 - cy * s2, w, h))
  }

  function reset() {
    if (!natural) return
    setZoom(1)
    setOffset({ x: (frameW - natural.w * baseScale) / 2, y: (frameH - natural.h * baseScale) / 2 })
  }

  function onPointerDown(e: React.PointerEvent) {
    ;(e.target as Element).setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return
    setOffset(clamp(drag.current.ox + e.clientX - drag.current.x, drag.current.oy + e.clientY - drag.current.y))
  }
  const onPointerUp = () => {
    drag.current = null
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const step = e.shiftKey ? 40 : 10
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    }
    if (moves[e.key]) {
      e.preventDefault()
      setOffset(clamp(offset.x + moves[e.key][0], offset.y + moves[e.key][1]))
    } else if (e.key === '+' || e.key === '=') applyZoom(zoom + 0.2)
    else if (e.key === '-') applyZoom(zoom - 0.2)
    else if (e.key === 'Escape') onCancel()
  }

  async function save() {
    const img = imgRef.current
    if (!img || !natural) return
    const sx = -offset.x / scale
    const sy = -offset.y / scale
    const sw = frameW / scale
    const sh = frameH / scale
    const outW = Math.round(Math.min(MAX_OUTPUT, sw))
    const outH = Math.round(outW / (frameW / frameH))
    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, outW, outH)
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)

    setStatus({ busy: true, progress: 0, error: '' })
    try {
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Rasmni tayyorlab bo‘lmadi'))), 'image/jpeg', 0.9),
      )
      const { url } = await uploadBlob(blob, (progress) => setStatus((s) => ({ ...s, progress })))
      onDone(url)
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'SecurityError'
          ? 'Bu tashqi rasmni kesib bo‘lmaydi (sayt ruxsat bermaydi). Rasmni saqlab, fayl sifatida yuklang'
          : (error as Error).message
      setStatus({ busy: false, progress: 0, error: message })
    }
  }

  const outputW = natural ? Math.round(Math.min(MAX_OUTPUT, frameW / scale)) : 0
  const outputH = natural ? Math.round(outputW / (frameW / frameH)) : 0

  return (
    <div className="crop-modal" role="dialog" aria-modal="true" aria-label="Rasmni kesish">
      <div className="crop-modal__panel">
        <header className="crop-modal__head">
          <h2>Rasmni kesish</h2>
          <button type="button" className="btn btn--sm btn--ghost" onClick={onCancel} aria-label="Yopish">
            <X />
          </button>
        </header>

        <div className="crop-aspects" role="radiogroup" aria-label="Nisbat">
          {ASPECTS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={aspectId === a.id}
              className={aspectId === a.id ? 'is-active' : ''}
              onClick={() => setAspectId(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="crop-stage" ref={stageRef}>
          <div
            className="crop-frame"
            style={{ width: frameW, height: frameH }}
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={(e) => applyZoom(zoom - e.deltaY * 0.0015)}
            onKeyDown={onKeyDown}
            aria-label="Kesish maydoni: surish uchun torting yoki strelkalarni bosing"
          >
            {natural ? (
              <img
                src={src}
                alt=""
                draggable={false}
                crossOrigin={/^https?:\/\//.test(src) ? 'anonymous' : undefined}
                style={{ width: dispW, height: dispH, transform: `translate(${offset.x}px, ${offset.y}px)` }}
              />
            ) : (
              <span className="crop-frame__loading">{status.error || 'Yuklanmoqda…'}</span>
            )}
            <span className="crop-frame__grid" aria-hidden="true" />
          </div>
        </div>

        <div className="crop-controls">
          <button type="button" className="btn btn--sm" onClick={() => applyZoom(zoom - 0.2)} aria-label="Kichiklashtirish">
            <Minus />
          </button>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => applyZoom(Number(e.target.value))}
            aria-label="Zoom"
          />
          <button type="button" className="btn btn--sm" onClick={() => applyZoom(zoom + 0.2)} aria-label="Kattalashtirish">
            <Plus />
          </button>
          <button type="button" className="btn btn--sm" onClick={reset} aria-label="Qayta tiklash">
            <RotateCcw />
          </button>
        </div>
        <p className="crop-hint">
          <Move size={14} aria-hidden="true" /> Rasmni torting · g‘ildirak — zoom
          {natural && (
            <span>
              {' '}
              · Natija: {outputW}×{outputH}px
            </span>
          )}
        </p>
        {natural && outputW < 800 && (
          <p className="crop-warn">Natija o‘lchami kichik — rasm saytda xira ko‘rinishi mumkin. Zoomni kamaytiring.</p>
        )}
        {status.error && natural && <p className="media-error">{status.error}</p>}

        <footer className="crop-modal__foot">
          <button type="button" className="btn" onClick={onCancel} disabled={status.busy}>
            Bekor qilish
          </button>
          <button type="button" className="btn btn--primary" onClick={save} disabled={!natural || status.busy}>
            {status.busy ? `Yuklanmoqda… ${status.progress}%` : 'Kesish va saqlash'}
          </button>
        </footer>
      </div>
    </div>
  )
}
