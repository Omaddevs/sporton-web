import { api } from './apiClient.js'

/** Admin paneldan boshqariladigan promo karusel slaydlari (bo‘sh ro‘yxat — karusel ko‘rinmaydi) */
export async function fetchPromoSlides({ signal } = {}) {
  const { slides } = await api('/promo', { signal })
  return slides ?? []
}
