import { getCurrentUser } from '@/lib/auth'
import { subscribe, type UserEvent } from '@/lib/events'
import { unreadCount } from '@/lib/notify'

export const dynamic = 'force-dynamic'

/**
 * Server-Sent Events: yangi bildirishnoma va o‘qilmaganlar soni real vaqtda.
 * 25 soniyada bir «ping» — proksilar ulanishni uzib qo‘ymasligi uchun.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const encoder = new TextEncoder()
  let cleanup = () => {}

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch {
          cleanup()
        }
      }
      controller.enqueue(encoder.encode('retry: 5000\n\n'))
      send('unread', { unread: await unreadCount(user.id) })

      const unsubscribe = subscribe(user.id, (event: UserEvent) => send(event.kind, event))
      const ping = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          cleanup()
        }
      }, 25_000)

      cleanup = () => {
        clearInterval(ping)
        unsubscribe()
        try {
          controller.close()
        } catch {
          /* allaqachon yopilgan */
        }
      }
      request.signal.addEventListener('abort', () => cleanup())
    },
    cancel() {
      cleanup()
    },
  })

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    },
  })
}
