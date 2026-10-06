import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import {
  FiArrowRight,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiMessageCircle,
  FiPause,
  FiPlay,
  FiVideo,
  FiVolume2,
  FiVolumeX,
  FiX,
} from 'react-icons/fi'
import { reelEmbedUrl, reels, reelVideoUrl } from '../../data/reels.js'
import './Reels.css'

// Lokal video fayli topilmagan reel’lar (har sahifa yuklanishida bir marta aniqlanadi)
const missingVideos = new Set()

/** Sayt ichidagi to‘liq ekranli player: video, ovoz, progress, oldingi/keyingi */
function ReelPlayer({ index, onChange, onClose }) {
  const reel = reels[index]
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(true)
  const [muted, setMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState(() => missingVideos.has(reel.code))

  const step = useCallback((dir) => onChange((index + dir + reels.length) % reels.length), [index, onChange])

  const toggle = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === ' ' && !failed) {
        e.preventDefault()
        toggle()
      } else if (e.key === 'm') setMuted((m) => !m)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, step, toggle, failed])

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [])

  // Brauzer ovozli autoplay’ni bloklasa — ovozsiz davom etamiz
  const onCanPlay = () => {
    const v = videoRef.current
    if (!v || !v.paused) return
    v.play().catch(() => {
      setMuted(true)
      v.muted = true
      v.play().catch(() => setPlaying(false))
    })
  }

  const seek = (e) => {
    const v = videoRef.current
    if (!v || !v.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration
  }

  return createPortal(
    <div className="reels-player" role="dialog" aria-modal="true" aria-label={reel.title} onClick={onClose}>
      <button type="button" className="reels-player__close" aria-label="Yopish" onClick={onClose}>
        <FiX />
      </button>

      <button
        type="button"
        className="reels-player__arrow reels-player__arrow--prev"
        aria-label="Oldingi video"
        onClick={(e) => {
          e.stopPropagation()
          step(-1)
        }}
      >
        <FiChevronLeft />
      </button>

      <div className="reels-player__stage" onClick={(e) => e.stopPropagation()}>
        {failed ? (
          <iframe
            key={reel.code}
            className="reels-player__embed"
            src={reelEmbedUrl(reel.code)}
            title={reel.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            scrolling="no"
          />
        ) : (
          <>
            <video
              key={reel.code}
              ref={videoRef}
              className="reels-player__video"
              src={reelVideoUrl(reel.code)}
              poster={reel.image}
              autoPlay
              playsInline
              loop
              muted={muted}
              onClick={toggle}
              onCanPlay={onCanPlay}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => {
                const v = e.currentTarget
                setProgress(v.duration ? v.currentTime / v.duration : 0)
              }}
              onError={() => {
                missingVideos.add(reel.code)
                setFailed(true)
              }}
            />

            {!playing && (
              <span className="reels-player__big-play" aria-hidden="true">
                <FiPlay />
              </span>
            )}

            <div className="reels-player__overlay">
              <span className={`reels-card__tag reels-card__tag--${reel.tagTone}`}>{reel.tag}</span>
              <h3>{reel.title}</h3>
              <div className="reels-player__meta">
                <span className="reels-card__company">
                  <img className="reels-card__logo" src="/images/logo-192.png" alt="" />
                  sporton.uz
                </span>
                <span className="reels-card__stats">
                  <span><FiHeart />{reel.likes}</span>
                  <span><FiMessageCircle />{reel.comments}</span>
                </span>
              </div>
              <div className="reels-player__controls">
                <button type="button" onClick={toggle} aria-label={playing ? 'Pauza' : 'Davom ettirish'}>
                  {playing ? <FiPause /> : <FiPlay />}
                </button>
                <div
                  className="reels-player__progress"
                  role="slider"
                  aria-label="Video vaqti"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress * 100)}
                  onClick={seek}
                >
                  <span style={{ transform: `scaleX(${progress})` }} />
                </div>
                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? 'Ovozni yoqish' : 'Ovozni o‘chirish'}
                >
                  {muted ? <FiVolumeX /> : <FiVolume2 />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        className="reels-player__arrow reels-player__arrow--next"
        aria-label="Keyingi video"
        onClick={(e) => {
          e.stopPropagation()
          step(1)
        }}
      >
        <FiChevronRight />
      </button>
    </div>,
    document.body,
  )
}

/** Karusel kartasi: hover’da ovozsiz video avtomatik o‘ynaydi (video faqat shunda yuklanadi) */
function ReelCard({ reel, isClone, onOpen }) {
  const [hovered, setHovered] = useState(false)
  const [ready, setReady] = useState(false)
  const canPreview = !missingVideos.has(reel.code)

  const stop = () => {
    setHovered(false)
    setReady(false)
  }

  return (
    <div
      role="button"
      tabIndex={isClone ? -1 : 0}
      aria-hidden={isClone || undefined}
      aria-label={`${reel.title} — videoni ochish`}
      className={`reels-card${ready ? ' is-playing' : ''}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={stop}
    >
      <img className="reels-card__image" src={reel.image} alt="" draggable={false} loading="lazy" />
      {hovered && canPreview && (
        <video
          className="reels-card__video"
          src={reelVideoUrl(reel.code)}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          onPlaying={() => setReady(true)}
          onError={() => {
            missingVideos.add(reel.code)
            stop()
          }}
        />
      )}
      <span className="reels-card__shade" aria-hidden="true" />

      <span className={`reels-card__tag reels-card__tag--${reel.tagTone}`}>{reel.tag}</span>

      <span className="reels-card__play" aria-hidden="true">
        <FiPlay />
      </span>

      <div className="reels-card__content">
        <h3 className="reels-card__title">{reel.title}</h3>
        <div className="reels-card__meta">
          <span className="reels-card__company">
            <img className="reels-card__logo" src="/images/logo-192.png" alt="" draggable={false} />
            sporton.uz
          </span>
          <span className="reels-card__stats">
            <span>
              <FiHeart />
              {reel.likes}
            </span>
            <span>
              <FiMessageCircle />
              {reel.comments}
            </span>
          </span>
        </div>
      </div>
    </div>
  )
}

const COUNT = reels.length
// Cheksiz aylanish uchun ro'yxat bir necha marta chiziladi, ko'rinadigan qism doim o'rtadagi nusxada turadi
const COPIES = 5
const MID = Math.floor(COPIES / 2)
const SLIDES = Array.from({ length: COPIES }, (_, copy) => reels.map((reel) => ({ reel, copy }))).flat()
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const DURATION = 650
const AUTOPLAY_MS = 4500
const DRAG_THRESHOLD = 6

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Reels() {
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const indexRef = useRef(COUNT * MID)
  const stepRef = useRef(0)
  const dragRef = useRef(null)
  const suppressClickRef = useRef(false)
  const [active, setActive] = useState(0)
  const [openIndex, setOpenIndex] = useState(null)
  const [paused, setPaused] = useState(false)

  const setX = useCallback((x, animate) => {
    const track = trackRef.current
    if (!track) return
    const duration = prefersReducedMotion() ? 0 : DURATION
    track.style.transition = animate && duration ? `transform ${duration}ms ${EASE}` : 'none'
    track.style.transform = `translate3d(${x}px, 0, 0)`
  }, [])

  const currentX = useCallback(() => {
    const track = trackRef.current
    if (!track) return 0
    return new DOMMatrixReadOnly(getComputedStyle(track).transform).m41
  }, [])

  // Indeks o'rtadagi nusxadan chiqib ketgan bo'lsa, ko'rinishni o'zgartirmasdan bir nusxaga suradi
  const recenter = useCallback(() => {
    const i = indexRef.current
    const lo = COUNT * MID
    if (i >= lo && i < lo + COUNT) return
    const shift = lo + ((((i - lo) % COUNT) + COUNT) % COUNT) - i
    const x = currentX() - shift * stepRef.current
    indexRef.current = i + shift
    setX(x, false)
    void trackRef.current?.offsetWidth
  }, [currentX, setX])

  const goTo = useCallback(
    (target) => {
      indexRef.current = target
      setActive(((target % COUNT) + COUNT) % COUNT)
      setX(-target * stepRef.current, true)
    },
    [setX],
  )

  const move = useCallback(
    (direction) => {
      recenter()
      goTo(indexRef.current + direction)
    },
    [goTo, recenter],
  )

  const goToDot = (dot) => {
    recenter()
    const base = indexRef.current - (((indexRef.current % COUNT) + COUNT) % COUNT)
    goTo(base + dot)
  }

  // Kartochka o'lchamini kuzatish
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => {
      const first = track.firstElementChild
      if (!first) return
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0
      stepRef.current = first.getBoundingClientRect().width + gap
      setX(-indexRef.current * stepRef.current, false)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [setX])

  // Animatsiya tugagach, sezdirmasdan o'rtadagi nusxaga qaytish
  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onEnd = (e) => {
      if (e.target === track && e.propertyName === 'transform' && !dragRef.current) recenter()
    }
    track.addEventListener('transitionend', onEnd)
    return () => track.removeEventListener('transitionend', onEnd)
  }, [recenter])

  // Avtomatik aylanish
  useEffect(() => {
    if (paused || openIndex !== null || prefersReducedMotion()) return
    const id = setInterval(() => {
      if (!document.hidden && !dragRef.current) move(1)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, openIndex, move])

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    recenter()
    const x = currentX()
    setX(x, false)
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      baseX: x,
      lastX: e.clientX,
      lastT: performance.now(),
      velocity: 0,
      moved: false,
    }
    suppressClickRef.current = false
  }

  const onPointerMove = (e) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId) return
    const dx = e.clientX - drag.startX
    if (!drag.moved) {
      const dy = e.clientY - drag.startY
      if (Math.abs(dx) < DRAG_THRESHOLD) return
      // Vertikal skrolda carouselni ushlamaymiz
      if (Math.abs(dy) > Math.abs(dx)) {
        dragRef.current = null
        goTo(indexRef.current)
        return
      }
      drag.moved = true
      suppressClickRef.current = true
      viewportRef.current?.setPointerCapture(e.pointerId)
      viewportRef.current?.classList.add('is-dragging')
    }
    const now = performance.now()
    const dt = now - drag.lastT
    if (dt > 0) drag.velocity = (e.clientX - drag.lastX) / dt
    drag.lastX = e.clientX
    drag.lastT = now
    setX(drag.baseX + dx, false)
  }

  const endDrag = (e) => {
    const drag = dragRef.current
    if (!drag || drag.id !== e.pointerId) return
    dragRef.current = null
    viewportRef.current?.classList.remove('is-dragging')
    if (!drag.moved) return
    const step = stepRef.current || 1
    const dx = e.clientX - drag.startX
    // Tez silkitishda inersiya bilan bir nechta kartochka o'tadi
    const projected = drag.baseX + dx + drag.velocity * 180
    let target = Math.round(-projected / step)
    const startIndex = Math.round(-drag.baseX / step)
    if (target === startIndex && Math.abs(dx) > step * 0.15) target += dx < 0 ? 1 : -1
    // Bir silkitishda ko'pi bilan bitta to'liq aylana
    target = Math.max(startIndex - (COUNT - 1), Math.min(startIndex + (COUNT - 1), target))
    goTo(target)
  }

  const onClickCapture = (e) => {
    if (suppressClickRef.current) {
      e.preventDefault()
      e.stopPropagation()
      suppressClickRef.current = false
    }
  }

  const closePlayer = useCallback(() => setOpenIndex(null), [])

  return (
    <section className="reels container" id="reels">
      <div className="reels__panel">
        <div className="reels__decor" aria-hidden="true">
          <img
            className="reels__watermark reels__watermark--left"
            src="/images/logo-icon.svg"
            alt=""
          />
          <img
            className="reels__watermark reels__watermark--right"
            src="/images/logo-icon.svg"
            alt=""
          />
        </div>

        <div className="reels__top">
          <div className="reels__intro">
            <span className="reels__badge">
              <FiVideo />
              Reels
            </span>
            <h2 className="reels__title">Qisqa videolar bilan mashg&apos;ulotni boshlang</h2>
            <p className="reels__subtitle">
              Mashq texnikasi, murabbiylardan maslahatlar va sport hayotidan lavhalar – barchasi bir
              joyda!
            </p>
          </div>

          <div className="reels__actions">
            <Link to="/bolim/reels" className="reels__all">
              Barcha Reels
              <FiArrowRight />
            </Link>
            <div className="reels__nav">
              <button
                type="button"
                className="reels__nav-btn"
                aria-label="Oldingi"
                onClick={() => move(-1)}
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                className="reels__nav-btn"
                aria-label="Keyingi"
                onClick={() => move(1)}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>

        <div
          className="reels__carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            className="reels__viewport"
            ref={viewportRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onClickCapture={onClickCapture}
          >
            <div className="reels__track" ref={trackRef}>
              {SLIDES.map(({ reel, copy }, i) => (
                <ReelCard
                  key={`${copy}-${reel.code}`}
                  reel={reel}
                  isClone={copy !== MID}
                  onOpen={() => setOpenIndex(i % COUNT)}
                />
              ))}
            </div>
          </div>

          <div className="reels__dots" role="tablist" aria-label="Reels">
            {reels.map((reel, i) => (
              <button
                type="button"
                key={reel.code}
                role="tab"
                aria-selected={active === i}
                aria-label={`${i + 1}-video`}
                className={`reels__dot${active === i ? ' is-active' : ''}`}
                onClick={() => goToDot(i)}
              />
            ))}
          </div>
        </div>
      </div>

      {openIndex !== null && (
        <ReelPlayer key={openIndex} index={openIndex} onChange={setOpenIndex} onClose={closePlayer} />
      )}
    </section>
  )
}
