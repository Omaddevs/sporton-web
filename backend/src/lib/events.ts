import 'server-only'
import { EventEmitter } from 'node:events'

/**
 * Jarayon ichidagi hodisalar shinasi: yangi bildirishnoma ochiq SSE ulanishlarga darhol yetadi.
 * Bir nechta server instansiyasida — Redis pub/sub ga almashtiriladi (interfeys o‘zgarmaydi).
 */
const store = globalThis as unknown as { __sportonBus?: EventEmitter }
const bus = (store.__sportonBus ??= new EventEmitter().setMaxListeners(0))

export type UserEvent =
  | { kind: 'notification'; notification: unknown; unread: number }
  | { kind: 'unread'; unread: number }

export function publish(userId: string, event: UserEvent) {
  bus.emit(`user:${userId}`, event)
}

export function subscribe(userId: string, listener: (event: UserEvent) => void) {
  bus.on(`user:${userId}`, listener)
  return () => {
    bus.off(`user:${userId}`, listener)
  }
}
