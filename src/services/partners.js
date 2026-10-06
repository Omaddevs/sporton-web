import { api } from './apiClient.js'

/** Admin paneldan kiritilgan faol hamkorlar (bo‘sh ro‘yxat — bo‘lim ko‘rinmaydi) */
export async function fetchPartners({ signal } = {}) {
  const { partners } = await api('/partners', { signal })
  return partners ?? []
}
