import { test } from 'node:test'
import assert from 'node:assert/strict'
import { previewToken, verifyPreviewToken } from '../src/lib/preview'
import { metaHtml } from '../src/lib/seo'
import { inferBookingMode } from '../src/lib/booking-mode'

test('qoralama havolasi: faqat o‘sha majmua uchun va soxtalashtirib bo‘lmaydi', () => {
  const token = previewToken('olimpiya')
  assert.equal(verifyPreviewToken('olimpiya', token), true)
  assert.equal(verifyPreviewToken('boshqa-majmua', token), false)
  const [exp] = token.split('.')
  assert.equal(verifyPreviewToken('olimpiya', `${Number(exp) + 1000}.${token.split('.')[1]}`), false)
  assert.equal(verifyPreviewToken('olimpiya', null), false)
  assert.equal(verifyPreviewToken('olimpiya', 'abc'), false)
})

test('qoralama havolasi: muddati o‘tgan token rad etiladi', () => {
  const realNow = Date.now
  const token = previewToken('olimpiya')
  Date.now = () => realNow() + 3 * 60 * 60_000
  try {
    assert.equal(verifyPreviewToken('olimpiya', token), false)
  } finally {
    Date.now = realNow
  }
})

test('SEO sahifasi: foydalanuvchi matni HTML ga xavfsiz qo‘yiladi (XSS yo‘q)', () => {
  const html = metaHtml({
    title: '"><script>alert(1)</script>',
    description: 'a < b & "c"',
    image: 'https://x/i.jpg',
    url: 'https://sporton.uz/x',
    type: 'place',
    jsonLd: { name: '</script><script>alert(2)</script>' },
  })
  assert.ok(!html.includes('<script>alert(1)</script>'))
  assert.ok(!html.includes('</script><script>alert(2)'))
  assert.ok(html.includes('&quot;&gt;') || html.includes('&quot;&lt;') || html.includes('&quot;>'))
})

test('bron rejimi: noma’lum narx formatida xavfsiz «ariza» (vaqt band qilinmaydi)', () => {
  assert.equal(inferBookingMode({ type: 'full', price: '120 000 so‘m', hours: '08:00 - 22:00' }), 'request')
})
