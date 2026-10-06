import 'server-only'
import { dispatchDueBroadcasts, sendBookingReminders } from './notify'

const TICK_MS = 30_000
const store = globalThis as unknown as { __sportonScheduler?: NodeJS.Timeout; __sportonTickBusy?: boolean }

async function tick() {
  if (store.__sportonTickBusy) return
  store.__sportonTickBusy = true
  try {
    await dispatchDueBroadcasts()
    await sendBookingReminders()
  } catch (error) {
    console.error('[scheduler]', error)
  } finally {
    store.__sportonTickBusy = false
  }
}

/**
 * Fon vazifalari: rejalashtirilgan jo‘natmalar va bron eslatmalari (har 30 soniyada).
 * Bir nechta instansiyada ishga tushsa ham xavfsiz — har bir vazifa bazada atomik «egallanadi».
 */
export function startScheduler() {
  if (store.__sportonScheduler || process.env.DISABLE_SCHEDULER) return
  store.__sportonScheduler = setInterval(tick, TICK_MS)
  setTimeout(tick, 5_000)
}

/** Admin «Hozir yuborish» bosganda — 30 soniya kutmasdan */
export function kickScheduler() {
  setTimeout(tick, 0)
}
