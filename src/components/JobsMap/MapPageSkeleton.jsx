import './MapPageSkeleton.css'

// Xarita chunk'i yuklanayotganda sahifa tuzilishini oldindan ko'rsatadi (bo'sh ekran o'rniga)
export default function MapPageSkeleton() {
  return (
    <div className="map-skeleton" aria-busy="true" aria-label="Xarita yuklanmoqda">
      <div className="map-skeleton__panel">
        <span className="map-skeleton__line map-skeleton__line--title" />
        <span className="map-skeleton__line map-skeleton__line--short" />
        <span className="map-skeleton__block map-skeleton__block--segmented" />
        <div className="map-skeleton__chips">
          <span />
          <span />
          <span />
        </div>
        {[0, 1, 2].map((i) => (
          <span key={i} className="map-skeleton__block map-skeleton__block--card" />
        ))}
      </div>
      <div className="map-skeleton__map" />
    </div>
  )
}
