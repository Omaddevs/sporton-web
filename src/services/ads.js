import { api } from './apiClient.js'

/** Admin paneldan kiritilgan reklama (rasm + havola). Yo‘q bo‘lsa — null */
export async function fetchAd(slot, { signal } = {}) {
  const { ads } = await api('/ads', { signal })
  return ads?.[slot] ?? null
}
