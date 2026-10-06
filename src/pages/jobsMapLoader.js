// Xarita sahifasi (Leaflet bilan) alohida chunk'da. Navbar'dagi havolaga kursor
// borganda oldindan yuklab qo'yiladi — bosilganda sahifa deyarli darhol ochiladi.
let pending = null

export function loadJobsMapPage() {
  pending ??= import('./JobsMapPage.jsx')
  return pending
}
