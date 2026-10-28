import { api } from './apiClient.js'
import { tr } from '../i18n/index.js'

/** Brauzer push: qo‘llab-quvvatlanishi, yoqish va o‘chirish */
export const pushSupported = () =>
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

function keyToBytes(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'))
  return Uint8Array.from(raw, (c) => c.charCodeAt(0))
}

async function registration() {
  return navigator.serviceWorker.register('/sw.js')
}

/** 'unsupported' | 'denied' | 'on' | 'off' */
export async function pushStatus() {
  if (!pushSupported()) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  const sub = await reg?.pushManager.getSubscription()
  return sub && Notification.permission === 'granted' ? 'on' : 'off'
}

export async function enablePush(publicKey) {
  if (!pushSupported()) throw new Error(tr('Bu brauzer push bildirishnomalarni qo‘llab-quvvatlamaydi'))
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error(tr('Ruxsat berilmadi. Brauzer sozlamalarida sayt uchun bildirishnomalarni yoqing'))
  }
  const reg = await registration()
  await navigator.serviceWorker.ready
  let sub = await reg.pushManager.getSubscription()
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(publicKey) })
  await api('/push/subscribe', { method: 'POST', body: sub.toJSON() })
  return 'on'
}

export async function disablePush() {
  if (!pushSupported()) return 'unsupported'
  const reg = await navigator.serviceWorker.getRegistration('/sw.js')
  const sub = await reg?.pushManager.getSubscription()
  if (sub) {
    await api('/push/subscribe', { method: 'DELETE', body: { endpoint: sub.endpoint } }).catch(() => null)
    await sub.unsubscribe().catch(() => null)
  }
  return 'off'
}
