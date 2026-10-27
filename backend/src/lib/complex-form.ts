import 'server-only'
import { LISTING_STATUSES, type ListingStatus } from '@/db/schema'
import { field } from './admin'
import { REGIONS } from './constants'
import { imagesOf, normalizeMedia } from './media'

function num(form: FormData, name: string) {
  const raw = field(form, name)
  if (raw == null) return null
  const n = Number(raw.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/** Majmua formasini o‘qish va tekshirish (admin va majmua egasi kabineti uchun umumiy) */
export function readComplex(form: FormData) {
  const name = field(form, 'name')
  if (!name || name.length < 2) throw new Error('Majmua nomini kiriting')
  const status = String(form.get('status') ?? 'draft')
  const region = field(form, 'region')
  const lat = num(form, 'lat')
  const lng = num(form, 'lng')
  if ((lat == null) !== (lng == null)) throw new Error('Koordinata uchun lat va lng ikkalasini ham kiriting')
  if (lat != null && (lat < 37 || lat > 46 || lng! < 55 || lng! > 74)) throw new Error('Koordinata O‘zbekiston hududida emas')
  let rawMedia: unknown = []
  try {
    rawMedia = JSON.parse(String(form.get('media') ?? '[]'))
  } catch {
    throw new Error('Media ro‘yxati noto‘g‘ri')
  }
  const media = normalizeMedia(rawMedia)
  const phone = field(form, 'phone')
  const telegram = field(form, 'telegram')
  return {
    name,
    status: ((LISTING_STATUSES as readonly string[]).includes(status) ? status : 'draft') as ListingStatus,
    color: field(form, 'color') ?? '#1e6ff5',
    verified: form.get('verified') === 'on',
    listed: form.get('listed') === 'on',
    isDemo: form.get('isDemo') === 'on',
    tagline: field(form, 'tagline'),
    region,
    city: field(form, 'city') ?? REGIONS.find((r) => r.id === region)?.city ?? null,
    location: field(form, 'location'),
    address: field(form, 'address'),
    landmark: field(form, 'landmark'),
    website: field(form, 'website'),
    industry: field(form, 'industry'),
    years: field(form, 'years'),
    employees: field(form, 'employees'),
    phone,
    telegram: telegram ? (telegram.startsWith('@') ? telegram : `@${telegram.replace(/^https?:\/\/t\.me\//, '')}`) : null,
    hours: field(form, 'hours'),
    priceNote: field(form, 'priceNote'),
    logo: field(form, 'logo'),
    bannerImage: field(form, 'bannerImage'),
    bannerSlogan: field(form, 'bannerSlogan'),
    about: field(form, 'about'),
    amenities: form.getAll('amenities').map(String),
    media,
    images: imagesOf(media),
    similarIds: String(form.get('similarIds') ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    lat,
    lng,
  }
}


/** Majmua egasi o‘zgartira oladigan maydonlar: holat, tasdiq belgisi, tartib — faqat admin */
export function readOwnerComplex(form: FormData) {
  const { status: _status, verified: _verified, listed: _listed, isDemo: _isDemo, similarIds: _similar, ...rest } = readComplex(form)
  return rest
}
