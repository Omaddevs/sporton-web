/** Next.js server ishga tushganda bir marta chaqiriladi */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { startScheduler } = await import('./lib/scheduler')
  startScheduler()
  const { startTelegramPolling } = await import('./lib/telegram-polling')
  startTelegramPolling()
}
