/**
 * Sahifani ulashish: telefonlarda tizim oynasi (navigator.share), aks holda havola nusxalanadi.
 * Natija: 'shared' | 'copied' | 'cancelled' | 'failed'.
 */
export async function sharePage({ title, url = window.location.href }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, url })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }
  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}
