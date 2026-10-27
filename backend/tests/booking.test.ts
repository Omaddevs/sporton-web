import { test } from 'node:test'
import assert from 'node:assert/strict'
import { inferBookingMode } from '../src/lib/booking-mode'
import { isTimedService, parseHours } from '../src/lib/booking'

test('parseHours: oddiy, tungi va 24/7', () => {
  assert.deepEqual(parseHours('07:00 - 23:00'), { open: 7, close: 23 })
  assert.deepEqual(parseHours('06:00 - 00:00'), { open: 6, close: 24 })
  assert.deepEqual(parseHours('24/7'), { open: 0, close: 24 })
  assert.equal(parseHours('Telefon orqali'), null)
  assert.equal(parseHours(null), null)
})

test('inferBookingMode: narx va ish vaqtiga qarab', () => {
  const s = (price: string, hours: string | null = '08:00 - 22:00', type = 'full') => inferBookingMode({ type, price, hours })
  assert.equal(s('250 000 so‘m / soat'), 'slot')
  assert.equal(s('70 000 so‘m / seans', '24/7'), 'slot')
  assert.equal(s('350 000 so‘m / oy'), 'call')
  assert.equal(s('Narxi kelishiladi'), 'call')
  assert.equal(s('250 000 so‘m / soat', 'Telefon orqali'), 'call')
  assert.equal(s('90 000 so‘m / dars'), 'request')
  assert.equal(s('Bepul'), 'request')
  assert.equal(s('250 000 so‘m / oy', 'Istalgan vaqtda', 'remote'), 'request')
})

test('isTimedService: faqat slot rejimi va aniq ish vaqti', () => {
  assert.equal(isTimedService({ bookingMode: 'slot', hours: '08:00 - 22:00' }), true)
  assert.equal(isTimedService({ bookingMode: 'slot', hours: 'Kelishiladi' }), false)
  assert.equal(isTimedService({ bookingMode: 'request', hours: '08:00 - 22:00' }), false)
  assert.equal(isTimedService({ bookingMode: 'call', hours: '24/7' }), false)
})
