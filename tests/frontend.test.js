import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bookingModeOf, isTimedService } from '../src/utils/booking.js'
import { formatPhone, isValidPhone, maskPhone, toLocalDigits } from '../src/utils/phone.js'
import { tr } from '../src/i18n/index.js'
import ru from '../src/i18n/ru.js'

test('bron rejimi: backend bergan qiymat ustun, bo‘lmasa narxdan taxmin', () => {
  assert.equal(bookingModeOf({ bookingMode: 'call', salary: '250 000 so‘m / soat', hours: '08:00 - 22:00' }), 'call')
  assert.equal(bookingModeOf({ salary: '250 000 so‘m / soat', hours: '08:00 - 22:00' }), 'slot')
  assert.equal(bookingModeOf({ salary: '350 000 so‘m / oy', hours: '08:00 - 22:00' }), 'call')
  assert.equal(bookingModeOf(undefined), 'call')
  assert.equal(isTimedService({ bookingMode: 'slot', hours: '24/7' }), true)
  assert.equal(isTimedService({ bookingMode: 'request', hours: '08:00 - 22:00' }), false)
})

test('telefon: format, yashirish va tekshiruv', () => {
  assert.equal(toLocalDigits('+998 90 123-45-67'), '901234567')
  assert.equal(formatPhone('901234567'), '+998 90 123 45 67')
  assert.equal(maskPhone('901234567'), '+998 90 *** ** 67')
  assert.equal(isValidPhone('90 123 45'), false)
  assert.equal(isValidPhone('998901234567'), true)
})

test('i18n: o‘zbek tilida asl matn, o‘zgaruvchilar qo‘yiladi', () => {
  assert.equal(tr('Saqlash'), 'Saqlash')
  assert.equal(tr('{n} ta joy qoldi', { n: 5 }), '5 ta joy qoldi')
})

test('rus lug‘ati: bo‘sh tarjima yo‘q va asosiy matnlar bor', () => {
  for (const [uz, translated] of Object.entries(ru)) {
    assert.ok(typeof translated === 'string' && translated.trim().length > 0 || translated === '.', `tarjima bo‘sh: ${uz}`)
  }
  for (const key of ['Bron qilish', 'Saqlanganlar', 'Kirish', 'Ro‘yxatdan o‘tish', 'Qo‘ng‘iroq qilish']) {
    assert.ok(ru[key], `tarjima yo‘q: ${key}`)
  }
})
