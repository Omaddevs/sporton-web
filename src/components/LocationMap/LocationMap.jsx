import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ATTRIBUTION, currentTheme, TILES } from '../../utils/mapTiles.js'
import './LocationMap.css'
import { tr } from '../../i18n/index.js'

const pinIcon = L.divIcon({
  className: 'loc-map__pin-wrap',
  html: '<div class="loc-map__pin"><span></span></div>',
  iconSize: [36, 46],
  iconAnchor: [18, 46],
})

/** Bitta manzil uchun kichik xarita: belgilangan nuqta va zoom tugmalari */
export default function LocationMap({ coords, title, zoom = 16 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const center = [coords.lat, coords.lng]
    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      scrollWheelZoom: false,
      minZoom: 10,
      maxZoom: 18,
    })
    L.control.zoom({ position: 'bottomright', zoomInTitle: tr('Yaqinlashtirish'), zoomOutTitle: tr('Uzoqlashtirish') }).addTo(map)
    map.attributionControl.setPrefix(false)

    const tileOptions = { maxNativeZoom: 19, maxZoom: 18 }
    const createTiles = (name) => {
      const [base, ...overlays] = TILES[name]
      return L.layerGroup([
        L.tileLayer(base, { ...tileOptions, attribution: ATTRIBUTION }),
        ...overlays.map((url) => L.tileLayer(url, tileOptions)),
      ])
    }
    let theme = currentTheme()
    let tiles = createTiles(theme).addTo(map)

    const themeObserver = new MutationObserver(() => {
      const next = currentTheme()
      if (next === theme) return
      theme = next
      tiles.remove()
      tiles = createTiles(theme).addTo(map)
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    L.marker(center, { icon: pinIcon, title, alt: title, keyboard: false }).addTo(map)

    const resizeObserver = new ResizeObserver(() => map.invalidateSize({ pan: false }))
    resizeObserver.observe(containerRef.current)

    return () => {
      themeObserver.disconnect()
      resizeObserver.disconnect()
      map.remove()
    }
  }, [coords.lat, coords.lng, title, zoom])

  return <div ref={containerRef} className="loc-map" role="region" aria-label={`${title} — xaritada`} />
}
