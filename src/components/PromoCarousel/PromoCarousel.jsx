import { tr } from '../../i18n/index.js'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SOCIAL_LINKS } from '../../data/social.js'
import { fetchPromoSlides } from '../../services/promo.js'
import './PromoCarousel.css'

// Backend javob bermasa ko'rsatiladigan standart slaydlar (admin panelda boshqariladi)
const FALLBACK_SLIDES = [
  {
    id: 'telegram',
    link: SOCIAL_LINKS.telegram.href,
    image: '/images/promo/sporton-telegram-wide.webp',
    mobileImage: '/images/promo/sporton-telegram-mobile.webp',
    alt: tr('SportON Telegram kanali'),
  },
  {
    id: 'instagram',
    link: SOCIAL_LINKS.instagram.href,
    image: '/images/promo/sporton-instagram-wide.webp',
    mobileImage: '/images/promo/sporton-instagram-mobile.webp',
    alt: tr('SportON — Instagramda ham kuzatib boring'),
  },
]

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'
const DURATION = 750
const AUTOPLAY_MS = 4500
const DRAG_THRESHOLD = 6

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isExternal = (url) => /^https?:\/\//.test(url)

export default function PromoCarousel() {
  // null — yuklanmoqda; [] — admin hamma slaydni o'chirgan, karusel ko'rinmaydi
  const [slides, setSlides] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchPromoSlides({ signal: controller.signal })
      .then(setSlides)
      .catch((error) => {
        if (error?.name !== 'AbortError') setSlides(FALLBACK_SLIDES)
      })
    return () => controller.abort()
  }, [])

  if (!slides?.length) return null
  return <Carousel slides={slides} />
}

function Carousel({ slides }) {
  const COUNT = slides.length
  // Cheksiz aylanish: boshiga oxirgi slayd, oxiriga birinchi slayd nusxasi qo'shiladi
  const TRACK = useMemo(() => [slides[COUNT - 1], ...slides, slides[0]], [slides, COUNT])
  const realIndex = useCallback((pos) => (((pos - 1) % COUNT) + COUNT) % COUNT, [COUNT])
  const viewportRef = useRef(null)
  const trackRef = useRef(null)
  const posRef = useRef(1)
  const widthRef = useRef(0)
  const dragRef = useRef(null)
  const suppressClickRef = useRef(false)
  const [active, setActive] = useState(0)
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

  // Nusxa slaydda turgan bo'lsa, ko'rinishni o'zgartirmasdan asl slaydga o'tkazadi
  const normalize = useCallback(() => {
    const pos = posRef.current
    if (pos >= 1 && pos <= COUNT) return
    const shift = pos < 1 ? COUNT : -COUNT
    posRef.current = pos + shift
    setX(currentX() - shift * widthRef.current, false)
    void trackRef.current?.offsetWidth
  }, [COUNT, currentX, setX])

  const goTo = useCallback(
    (pos) => {
      posRef.current = Math.max(0, Math.min(COUNT + 1, pos))
      setActive(realIndex(posRef.current))
      setX(-posRef.current * widthRef.current, true)
    },
    [COUNT, realIndex, setX],
  )

  const move = useCallback(
    (direction) => {
      normalize()
      goTo(posRef.current + direction)
    },
    [goTo, normalize],
  )

  const goToDot = (i) => {
    normalize()
    goTo(i + 1)
  }

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const measure = () => {
      widthRef.current = viewport.clientWidth
      setX(-posRef.current * widthRef.current, false)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [setX])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const onEnd = (e) => {
      if (e.target === track && e.propertyName === 'transform' && !dragRef.current) normalize()
    }
    track.addEventListener('transitionend', onEnd)
    return () => track.removeEventListener('transitionend', onEnd)
  }, [normalize])

  useEffect(() => {
    if (paused || COUNT < 2 || prefersReducedMotion()) return
    const id = setInterval(() => {
      if (!document.hidden && !dragRef.current) move(1)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [paused, move, COUNT])

  const onPointerDown = (e) => {
    if (COUNT < 2) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    normalize()
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
      if (Math.abs(dx) < DRAG_THRESHOLD) return
      // Vertikal skrolda carouselni ushlamaymiz
      if (Math.abs(e.clientY - drag.startY) > Math.abs(dx)) {
        dragRef.current = null
        goTo(posRef.current)
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
    const dx = e.clientX - drag.startX
    const width = widthRef.current || 1
    const startPos = posRef.current
    const flick = Math.abs(drag.velocity) > 0.4
    if (Math.abs(dx) > width * 0.18 || flick) {
      goTo(startPos + ((flick ? -drag.velocity : -dx) > 0 ? 1 : -1))
    } else {
      goTo(startPos)
    }
  }

  const onClickCapture = (e) => {
    if (suppressClickRef.current) {
      e.preventDefault()
      e.stopPropagation()
      suppressClickRef.current = false
    }
  }

  return (
    <section className="container promo-carousel-wrap">
      <div
        className="promo-carousel"
        role="region"
        aria-roledescription="carousel"
        aria-label={tr('SportON ijtimoiy tarmoqlari')}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          className="promo-carousel__viewport"
          ref={viewportRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={onClickCapture}
        >
          <div className="promo-carousel__track" ref={trackRef}>
            {TRACK.map((slide, pos) => {
              const isClone = pos === 0 || pos === COUNT + 1
              const isActive = !isClone && realIndex(pos) === active
              // Kompyuter rasmi 24:5, telefon rasmi 2:1 — ikkalasi ham bannerni to'liq egallaydi
              const image = (
                <picture>
                  {slide.mobileImage && <source media="(max-width: 639px)" srcSet={slide.mobileImage} />}
                  <img
                    className="promo-carousel__image"
                    src={slide.image}
                    alt={slide.alt ?? ''}
                    width={1920}
                    height={400}
                    draggable={false}
                    loading={isActive ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </picture>
              )
              return (
                <div
                  key={`${pos}-${slide.id}`}
                  className="promo-carousel__slide"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${realIndex(pos) + 1} / ${COUNT}`}
                  aria-hidden={!isActive}
                >
                  {slide.link ? (
                    <a
                      href={slide.link}
                      className="promo-carousel__link"
                      {...(isExternal(slide.link) && { target: '_blank', rel: 'noopener noreferrer' })}
                      draggable={false}
                      tabIndex={isActive ? undefined : -1}
                    >
                      {image}
                    </a>
                  ) : (
                    <div className="promo-carousel__link">{image}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {COUNT > 1 && (
          <div className="promo-carousel__dots">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={`promo-carousel__dot${i === active ? ' promo-carousel__dot--active' : ''}`}
                aria-label={tr('{n}-slayd', { n: i + 1 })}
                aria-current={i === active}
                onClick={() => goToDot(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
