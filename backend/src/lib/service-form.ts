import 'server-only'
import { eq } from 'drizzle-orm'
import { getDb } from '@/db'
import { BOOKING_MODES, LISTING_STATUSES, SERVICE_TYPES, sports, type BookingMode, type ListingStatus } from '@/db/schema'
import { field, lines } from './admin'
import { parseHours } from './booking'
import { parsePriceValue } from './catalog'

/** Xizmat formasini o‘qish va tekshirish (admin va majmua egasi kabineti uchun umumiy) */
export async function readService(form: FormData) {
  const title = field(form, 'title')
  if (!title || title.length < 3) throw new Error('Xizmat nomini kiriting')
  const sportId = field(form, 'sportId')
  const db = await getDb()
  const [sport] = sportId ? await db.select().from(sports).where(eq(sports.id, sportId)).limit(1) : []
  if (!sport) throw new Error('Sport turini tanlang')
  const type = String(form.get('type'))
  if (!(SERVICE_TYPES as readonly string[]).includes(type)) throw new Error('Xizmat turini tanlang')
  const price = field(form, 'price')
  if (!price) throw new Error('Narxni kiriting (masalan: 250 000 so‘m / soat yoki Narxi kelishiladi)')
  const lat = field(form, 'lat')
  const lng = field(form, 'lng')
  const bookingMode = String(form.get('bookingMode'))
  if (!(BOOKING_MODES as readonly string[]).includes(bookingMode)) throw new Error('Bron usulini tanlang')
  const hours = field(form, 'hours')
  if (bookingMode === 'slot' && !parseHours(hours)) {
    throw new Error('Soatlik bron uchun ish vaqtini «07:00 - 23:00» yoki «24/7» formatida kiriting')
  }
  const status = String(form.get('status'))
  return {
    title,
    sportId: sport.id,
    category: field(form, 'category') ?? sport.title,
    type: type as 'full',
    location: type === 'remote' ? 'Onlayn' : (field(form, 'location') ?? 'Toshkent'),
    lat: type === 'remote' || !lat ? null : Number(lat),
    lng: type === 'remote' || !lng ? null : Number(lng),
    price,
    priceValue: parsePriceValue(price),
    hours,
    workMode: field(form, 'workMode'),
    experience: field(form, 'experience'),
    level: field(form, 'level'),
    description: field(form, 'description'),
    tasks: lines(form, 'tasks'),
    requirements: lines(form, 'requirements'),
    offers: lines(form, 'offers'),
    bookingMode: bookingMode as BookingMode,
    status: ((LISTING_STATUSES as readonly string[]).includes(status) ? status : 'draft') as ListingStatus,
  }
}

