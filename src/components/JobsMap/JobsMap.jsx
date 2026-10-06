import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ATTRIBUTION, currentTheme, TILES } from '../../utils/mapTiles.js'
import './JobsMap.css'

const UZBEKISTAN_VIEW = { center: [41.2, 64.6], zoom: 6 }

const ANIMATION = { animate: true, duration: 0.45 }

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)
}

function jobIcon(job) {
  const logo = job.logo
    ? `<img src="${escapeHtml(job.logo)}?v=2" alt="" loading="lazy" decoding="async" />`
    : `<span style="background:${escapeHtml(job.companyColor)}">${escapeHtml(job.company.charAt(0))}</span>`

  return L.divIcon({
    className: 'jm-pin-wrap',
    html: `<div class="jm-pin"><div class="jm-pin__badge">${logo}</div></div>`,
    iconSize: [44, 52],
    iconAnchor: [22, 52],
  })
}

const userIcon = L.divIcon({
  className: '',
  html: '<div class="jm-user"><span class="jm-user__pulse"></span><span class="jm-user__dot"></span></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

function initialView(origin, radiusKm) {
  if (!origin) return UZBEKISTAN_VIEW
  // Radiusga mos taxminiy zoom — birinchi kadrdanoq kerakli hudud yuklanadi
  const zoom = radiusKm ? Math.round(14 - Math.log2(radiusKm / 1.5)) : 11
  return { center: [origin.lat, origin.lng], zoom: Math.min(15, Math.max(6, zoom)) }
}

export default function JobsMap({ origin, jobs, radiusKm, selectedId, hoveredId, onSelect, interactive = true }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(new Map())
  const userLayerRef = useRef(null)
  const onSelectRef = useRef(onSelect)
  const framedRef = useRef(false)

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // Xaritani bir marta yaratish
  useEffect(() => {
    const view = initialView(origin, radiusKm)
    const map = L.map(containerRef.current, {
      zoomControl: false,
      center: view.center,
      zoom: view.zoom,
      minZoom: 5,
      maxZoom: 18,
      wheelPxPerZoomLevel: 90,
    })
    L.control.zoom({ position: 'bottomright', zoomInTitle: 'Yaqinlashtirish', zoomOutTitle: 'Uzoqlashtirish' }).addTo(map)
    map.attributionControl.setPrefix(false)
    mapRef.current = map

    const tileOptions = {
      maxNativeZoom: 16,
      maxZoom: 18,
      keepBuffer: 4,
      updateWhenZooming: false,
    }
    const createTiles = (name) => {
      const [base, labels] = TILES[name]
      return L.layerGroup([
        L.tileLayer(base, { ...tileOptions, attribution: ATTRIBUTION }),
        L.tileLayer(labels, tileOptions),
      ])
    }
    let theme = currentTheme()
    let tiles = createTiles(theme).addTo(map)
    const tilesLoading = () => containerRef.current?.classList.add('is-loading')
    const tilesLoaded = () => containerRef.current?.classList.remove('is-loading')
    // Fon qatlami holati bo'yicha progress chizig'i
    const baseOf = (group) => group.getLayers()[0]
    const bindTiles = (group) => {
      baseOf(group).on('loading', tilesLoading).on('load', tilesLoaded)
      return group
    }
    bindTiles(tiles)

    // Mavzu almashganda mos tile to'plamiga o'tish
    const themeObserver = new MutationObserver(() => {
      const next = currentTheme()
      if (next === theme) return
      theme = next
      const old = tiles
      tiles = bindTiles(createTiles(theme)).addTo(map)
      baseOf(tiles).once('load', () => old.remove())
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // Konteyner o'lchami o'zgarganda (masalan, mobil ↔ desktop) xaritani qayta chizish
    let frame = 0
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => map.invalidateSize({ pan: false }))
    })
    resizeObserver.observe(containerRef.current)

    const markers = markersRef.current
    return () => {
      cancelAnimationFrame(frame)
      themeObserver.disconnect()
      resizeObserver.disconnect()
      markers.clear()
      map.remove()
      mapRef.current = null
    }
    // Boshlang'ich ko'rinish faqat yaratishda kerak, keyingi o'zgarishlarni pastdagi effektlar boshqaradi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handlers = ['dragging', 'scrollWheelZoom', 'doubleClickZoom', 'touchZoom', 'boxZoom', 'keyboard']
    handlers.forEach((name) => (interactive ? map[name]?.enable() : map[name]?.disable()))
  }, [interactive])

  // Majmua markerlari: faqat qo'shilgan/olib tashlanganlari yangilanadi
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const markers = markersRef.current
    const nextIds = new Set(jobs.map((job) => job.id))

    markers.forEach((marker, id) => {
      if (!nextIds.has(id)) {
        marker.remove()
        markers.delete(id)
      }
    })

    jobs.forEach((job) => {
      if (markers.has(job.id)) return
      const marker = L.marker([job.coords.lat, job.coords.lng], {
        icon: jobIcon(job),
        title: `${job.title} — ${job.company}`,
        alt: `${job.title} — ${job.company}`,
        riseOnHover: true,
        keyboard: true,
      })
      marker.on('click', () => onSelectRef.current?.(job.id))
      marker.addTo(map)
      markers.set(job.id, marker)
    })
  }, [jobs])

  // Tanlangan va ro'yxatda kursor turgan markerni ajratish — ikonani qayta yaratmasdan, faqat klass bilan
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const el = marker.getElement()
      if (!el) return
      const active = id === selectedId
      el.classList.toggle('is-active', active)
      el.classList.toggle('is-hover', id === hoveredId && !active)
      marker.setZIndexOffset(active ? 1000 : id === hoveredId ? 500 : 0)
    })
  }, [selectedId, hoveredId, jobs])

  // Tanlangan ishga silliq o'tish
  useEffect(() => {
    const map = mapRef.current
    const selected = markersRef.current.get(selectedId)
    if (!map || !selected) return
    const latLng = selected.getLatLng()
    const zoom = Math.max(map.getZoom(), 13)
    if (zoom === map.getZoom()) map.panTo(latLng, ANIMATION)
    else map.setView(latLng, zoom, ANIMATION)
  }, [selectedId])

  // Foydalanuvchi joylashuvi, radius doirasi va ko'rinish chegarasi
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    userLayerRef.current?.remove()
    userLayerRef.current = null
    if (!origin) {
      framedRef.current = false
      map.setView(UZBEKISTAN_VIEW.center, UZBEKISTAN_VIEW.zoom, { animate: false })
      return
    }

    const layer = L.layerGroup().addTo(map)
    const center = [origin.lat, origin.lng]
    L.marker(center, { icon: userIcon, interactive: false, keyboard: false, zIndexOffset: 2000 }).addTo(layer)

    let bounds
    if (radiusKm) {
      const circle = L.circle(center, {
        radius: radiusKm * 1000,
        className: 'jm-radius',
        interactive: false,
      }).addTo(layer)
      bounds = circle.getBounds()
    } else {
      bounds = L.latLngBounds([center, ...jobs.map((job) => [job.coords.lat, job.coords.lng])])
    }

    // Birinchi marta animatsiyasiz joylashtiriladi (oraliq zoom tile'lari yuklanmaydi),
    // keyingi radius o'zgarishlarida — qisqa zoom animatsiyasi
    map.fitBounds(bounds, {
      padding: [32, 32],
      maxZoom: radiusKm ? 16 : 13,
      ...(framedRef.current ? ANIMATION : { animate: false }),
    })
    framedRef.current = true
    userLayerRef.current = layer
    // jobs faqat "Barchasi" holatida chegarani hisoblash uchun kerak
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin?.lat, origin?.lng, radiusKm])

  function recenter() {
    if (origin) mapRef.current?.setView([origin.lat, origin.lng], 14, ANIMATION)
  }

  return (
    <div className="jobs-map">
      <div ref={containerRef} className="jobs-map__canvas is-loading" />
      <div className="jobs-map__progress" aria-hidden="true" />
      {origin && interactive && (
        <button type="button" className="jobs-map__locate" onClick={recenter} aria-label="Mening joylashuvim" title="Mening joylashuvim">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3.5" fill="currentColor" />
            <circle cx="12" cy="12" r="8" />
            <path d="M12 1v3M12 20v3M1 12h3M20 12h3" />
          </svg>
        </button>
      )}
    </div>
  )
}
