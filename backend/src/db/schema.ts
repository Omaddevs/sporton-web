import { sql } from 'drizzle-orm'
import {
  boolean,
  date,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

export const USER_ROLES = ['user', 'moderator', 'admin'] as const
export const USER_STATUSES = ['active', 'blocked'] as const
export const PUBLISH_STATUSES = ['published', 'hidden'] as const
/** Majmua va xizmat e’lonlari: draft — hali to‘ldirilmoqda, hidden — vaqtincha olib qo‘yilgan */
export const LISTING_STATUSES = ['draft', 'published', 'hidden'] as const
/**
 * Xizmatni qanday band qilish mumkin:
 * slot — sana va soat tanlanadi (maydon, kort ijarasi); request — vaqtsiz ariza, majmua qo‘ng‘iroq
 * qiladi (sektsiya, guruh darsi); call — onlayn bron yo‘q, faqat telefon/Telegram (oylik abonement).
 */
export const BOOKING_MODES = ['slot', 'request', 'call'] as const
export const SERVICE_TYPES = ['full', 'part', 'remote', 'intern'] as const
export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'] as const
export const SUBMISSION_STATUSES = ['pending', 'approved', 'rejected'] as const
export const NEWS_STATUSES = ['draft', 'published'] as const
export const TICKET_STATUSES = ['open', 'closed'] as const
export const NOTIFICATION_TYPES = ['booking', 'promo', 'news', 'system', 'submission', 'support'] as const
export const BROADCAST_STATUSES = ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

/** Foydalanuvchi bildirishnoma sozlamalari (bron va tizim xabarlari ilovada doim keladi) */
export type NotifyPrefs = {
  bookingReminders: boolean
  promotions: boolean
  news: boolean
  telegram: boolean
  push: boolean
}

export const DEFAULT_NOTIFY_PREFS: NotifyPrefs = {
  bookingReminders: true,
  promotions: true,
  news: true,
  telegram: true,
  push: true,
}

export type UserRole = (typeof USER_ROLES)[number]

/**
 * Galereya elementi. provider: file — o‘zimizga yuklangan; link — tashqi rasm/video fayl;
 * youtube / instagram — embed qilinadigan video.
 */
export type MediaItem = {
  type: 'image' | 'video'
  url: string
  provider: 'file' | 'link' | 'youtube' | 'instagram'
}
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

// ── Foydalanuvchilar ───────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull().default(''),
    /** Mahalliy 9 xonali format: 901234567 */
    phone: text('phone'),
    email: text('email'),
    passwordHash: text('password_hash'),
    provider: text('provider', { enum: ['phone', 'google', 'telegram'] }).notNull().default('phone'),
    providerId: text('provider_id'),
    role: text('role', { enum: USER_ROLES }).notNull().default('user'),
    status: text('status', { enum: USER_STATUSES }).notNull().default('active'),
    /** Oshirilganda barcha eski sessiyalar bekor bo‘ladi (parol o‘zgarishi, bloklash) */
    tokenVersion: integer('token_version').notNull().default(0),
    telegramChatId: text('telegram_chat_id'),
    avatar: text('avatar'),
    bio: text('bio'),
    city: text('city'),
    /** Qiziqadigan sport turlari (sports.id) */
    sports: jsonb('sports').$type<string[]>().notNull().default([]),
    /** Raqam Telegram bot orqali tasdiqlangan vaqt (eski hisoblarda bo‘sh) */
    phoneVerifiedAt: timestamp('phone_verified_at', { withTimezone: true }),
    notifyPrefs: jsonb('notify_prefs').$type<Partial<NotifyPrefs>>().notNull().default({}),
    consentAt: timestamp('consent_at', { withTimezone: true }),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('users_phone_uq').on(t.phone),
    uniqueIndex('users_email_uq').on(t.email),
    uniqueIndex('users_provider_uq').on(t.provider, t.providerId),
  ],
)

/**
 * Ro‘yxatdan o‘tishda telefonni tasdiqlash: kodni Telegram bot beradi, foydalanuvchi botga aynan shu
 * raqamni kontakt sifatida yuborgan bo‘ladi. chatId — hisob yaratilgach bildirishnomalar uchun ulanadi.
 */
export const phoneVerifications = pgTable(
  'phone_verifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    phone: text('phone').notNull(),
    chatId: text('chat_id'),
    codeHash: text('code_hash').notNull(),
    attempts: integer('attempts').notNull().default(0),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('phone_verifications_phone_idx').on(t.phone)],
)

export const resetCodes = pgTable(
  'reset_codes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    codeHash: text('code_hash').notNull(),
    attempts: integer('attempts').notNull().default(0),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    consumedAt: timestamp('consumed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('reset_codes_user_idx').on(t.userId)],
)

// ── Katalog ────────────────────────────────────────────────────────

export const sports = pgTable('sports', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  accent: text('accent'),
  image: text('image'),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
})

/** Bosh sahifadagi «Hamkorlar» bo‘limi: admin kiritadi, bo‘sh bo‘lsa bo‘lim ko‘rinmaydi */
export const partners = pgTable('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  logo: text('logo').notNull(),
  link: text('link'),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
})

/**
 * Saytdagi reklama joylari (slot: 'home' — bosh sahifadagi asosiy banner).
 * Rasm va havola kiritilmaguncha banner ko‘rinmaydi.
 */
export const ads = pgTable('ads', {
  slot: text('slot').primaryKey(),
  image: text('image'),
  mobileImage: text('mobile_image'),
  link: text('link'),
  ctaLabel: text('cta_label'),
  alt: text('alt'),
  active: boolean('active').notNull().default(true),
  ...timestamps,
})

/** Bosh sahifadagi promo karusel slaydlari. Faol slayd bo‘lmasa karusel ko‘rinmaydi. */
export const promoSlides = pgTable('promo_slides', {
  id: uuid('id').primaryKey().defaultRandom(),
  image: text('image').notNull(),
  mobileImage: text('mobile_image'),
  link: text('link'),
  alt: text('alt'),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
})

export const EVENT_STATUSES = ['published', 'draft'] as const

export type EventScheduleItem = { time: string; label: string; note?: string }
export type EventFaqItem = { q: string; a: string }

/** Sport tadbirlari: turnirlar, marafonlar, ochiq mashg‘ulotlar (bosh sahifa va /tadbir/:id) */
export const events = pgTable(
  'events',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    image: text('image'),
    location: text('location').notNull(),
    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
    excerpt: text('excerpt').notNull().default(''),
    about: jsonb('about').$type<string[]>().notNull().default([]),
    includes: jsonb('includes').$type<string[]>().notNull().default([]),
    rules: jsonb('rules').$type<string[]>().notNull().default([]),
    schedule: jsonb('schedule').$type<EventScheduleItem[]>().notNull().default([]),
    faq: jsonb('faq').$type<EventFaqItem[]>().notNull().default([]),
    organizerName: text('organizer_name').notNull().default('SportON'),
    organizerRole: text('organizer_role').notNull().default('Tashkilotchi'),
    venueName: text('venue_name'),
    venueAddress: text('venue_address'),
    fee: text('fee').notNull().default('Bepul'),
    prize: text('prize'),
    level: text('level').notNull().default('Barcha darajalar'),
    age: text('age').notNull().default('Cheklovsiz'),
    capacity: integer('capacity').notNull().default(0),
    registered: integer('registered').notNull().default(0),
    views: integer('views').notNull().default(0),
    status: text('status', { enum: EVENT_STATUSES }).notNull().default('published'),
    ...timestamps,
  },
  (t) => [index('events_status_starts_idx').on(t.status, t.startsAt)],
)

/** Tadbirga saytdan ro‘yxatdan o‘tganlar (tashkilotchi admin panelda ro‘yxatni ko‘radi) */
export const eventRegistrations = pgTable(
  'event_registrations',
  {
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.userId] })],
)

export const complexes = pgTable(
  'complexes',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    color: text('color').notNull().default('#1e6ff5'),
    verified: boolean('verified').notNull().default(false),
    /** Haqiqiy e’lon — ro‘yxatlarda birinchi chiqadi */
    listed: boolean('listed').notNull().default(false),
    /** Namuna (demo) ma’lumot — launchdan oldin yashirish mumkin */
    isDemo: boolean('is_demo').notNull().default(false),
    status: text('status', { enum: LISTING_STATUSES }).notNull().default('published'),
    tagline: text('tagline'),
    location: text('location'),
    city: text('city'),
    region: text('region'),
    address: text('address'),
    landmark: text('landmark'),
    website: text('website'),
    industry: text('industry'),
    years: text('years'),
    employees: text('employees'),
    phone: text('phone'),
    telegram: text('telegram'),
    hours: text('hours'),
    priceNote: text('price_note'),
    logo: text('logo'),
    bannerImage: text('banner_image'),
    bannerSlogan: text('banner_slogan'),
    about: text('about'),
    similarIds: jsonb('similar_ids').$type<string[]>().notNull().default([]),
    amenities: jsonb('amenities').$type<string[]>().notNull().default([]),
    images: jsonb('images').$type<string[]>().notNull().default([]),
    /** Rasm va videolar (tartib bilan). images — shundagi rasmlar nusxasi (kartochkalar uchun) */
    media: jsonb('media').$type<MediaItem[]>().notNull().default([]),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
    views: integer('views').notNull().default(0),
    sortOrder: integer('sort_order').notNull().default(0),
    ...timestamps,
  },
  (t) => [index('complexes_status_idx').on(t.status)],
)

export type ServiceDetailList = string[]

export const services = pgTable(
  'services',
  {
    id: serial('id').primaryKey(),
    complexId: text('complex_id')
      .notNull()
      .references(() => complexes.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    title: text('title').notNull(),
    sportId: text('sport_id').notNull(),
    category: text('category').notNull(),
    type: text('type', { enum: SERVICE_TYPES }).notNull().default('full'),
    location: text('location').notNull().default('Toshkent'),
    lat: doublePrecision('lat'),
    lng: doublePrecision('lng'),
    /** Ko‘rinadigan narx: «250 000 so‘m / soat», «Narxi kelishiladi» */
    price: text('price').notNull(),
    /** So‘mdagi qiymat (saralash/filtr uchun), aniq bo‘lmasa null */
    priceValue: integer('price_value'),
    hours: text('hours'),
    workMode: text('work_mode'),
    experience: text('experience'),
    level: text('level'),
    description: text('description'),
    tasks: jsonb('tasks').$type<ServiceDetailList>().notNull().default([]),
    requirements: jsonb('requirements').$type<ServiceDetailList>().notNull().default([]),
    offers: jsonb('offers').$type<ServiceDetailList>().notNull().default([]),
    views: integer('views').notNull().default(0),
    bookingMode: text('booking_mode', { enum: BOOKING_MODES }).notNull().default('slot'),
    status: text('status', { enum: LISTING_STATUSES }).notNull().default('published'),
    ...timestamps,
  },
  (t) => [index('services_complex_idx').on(t.complexId), index('services_sport_idx').on(t.sportId)],
)

// ── Kontent ────────────────────────────────────────────────────────

export type NewsBody = {
  lead: string
  paragraphs: string[]
  quote?: { text: string; author: string } | null
}

export const news = pgTable(
  'news',
  {
    id: text('id').primaryKey(),
    category: text('category').notNull(),
    title: text('title').notNull(),
    excerpt: text('excerpt').notNull().default(''),
    image: text('image'),
    imageCaption: text('image_caption'),
    body: jsonb('body').$type<NewsBody>(),
    /** Maqola ichidagi qo‘shimcha rasm/videolar */
    gallery: jsonb('gallery').$type<MediaItem[]>().notNull().default([]),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    featured: boolean('featured').notNull().default(false),
    status: text('status', { enum: NEWS_STATUSES }).notNull().default('published'),
    authorName: text('author_name').notNull().default('SportON tahririyati'),
    views: integer('views').notNull().default(0),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (t) => [index('news_published_idx').on(t.status, t.publishedAt)],
)

export const newsComments = pgTable(
  'news_comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    newsId: text('news_id')
      .notNull()
      .references(() => news.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    authorName: text('author_name').notNull(),
    text: text('text').notNull(),
    status: text('status', { enum: PUBLISH_STATUSES }).notNull().default('published'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('news_comments_news_idx').on(t.newsId)],
)

export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    complexId: text('complex_id')
      .notNull()
      .references(() => complexes.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    authorName: text('author_name').notNull(),
    rating: integer('rating').notNull(),
    text: text('text').notNull(),
    status: text('status', { enum: PUBLISH_STATUSES }).notNull().default('published'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('reviews_complex_idx').on(t.complexId, t.status),
    uniqueIndex('reviews_user_complex_uq').on(t.complexId, t.userId).where(sql`user_id is not null`),
  ],
)

// ── Bronlar va arizalar ────────────────────────────────────────────

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Mijozga ko‘rsatiladigan qisqa kod: SP-7K3Q9X */
    code: text('code').notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    serviceId: integer('service_id')
      .notNull()
      .references(() => services.id, { onDelete: 'cascade' }),
    complexId: text('complex_id')
      .notNull()
      .references(() => complexes.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    customerName: text('customer_name').notNull(),
    customerPhone: text('customer_phone').notNull(),
    date: date('date', { mode: 'string' }),
    /** Boshlanish soati (0–23). Onlayn / vaqtsiz xizmatlarda null */
    hour: integer('hour'),
    priceLabel: text('price_label'),
    priceValue: integer('price_value'),
    status: text('status', { enum: BOOKING_STATUSES }).notNull().default('pending'),
    note: text('note'),
    adminNote: text('admin_note'),
    /** Eslatma yuborilgan vaqt (takror yubormaslik uchun) */
    remindedAt: timestamp('reminded_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('bookings_code_uq').on(t.code),
    // Bitta vaqt uchun faqat bitta faol bron
    uniqueIndex('bookings_slot_uq')
      .on(t.serviceId, t.date, t.hour)
      .where(sql`status in ('pending', 'confirmed') and hour is not null`),
    index('bookings_user_idx').on(t.userId),
    index('bookings_status_idx').on(t.status, t.createdAt),
  ],
)

export type SubmissionPayload = {
  name: string
  sports: string[]
  description: string
  region: string
  address: string
  landmark?: string
  price: number
  opens: string
  closes: string
  amenities: string[]
  phone: string
  telegram?: string
  /** Eski arizalar (faqat rasm) */
  photos?: string[]
  media?: MediaItem[]
}

export const submissions = pgTable(
  'complex_submissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    payload: jsonb('payload').$type<SubmissionPayload>().notNull(),
    status: text('status', { enum: SUBMISSION_STATUSES }).notNull().default('pending'),
    adminNote: text('admin_note'),
    complexId: text('complex_id').references(() => complexes.id, { onDelete: 'set null' }),
    reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index('submissions_status_idx').on(t.status, t.createdAt)],
)

export const subscribers = pgTable(
  'subscribers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    status: text('status', { enum: ['active', 'unsubscribed'] }).notNull().default('active'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('subscribers_email_uq').on(t.email)],
)

export const supportTickets = pgTable(
  'support_tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    contact: text('contact').notNull(),
    topic: text('topic').notNull(),
    message: text('message').notNull(),
    status: text('status', { enum: TICKET_STATUSES }).notNull().default('open'),
    adminNote: text('admin_note'),
    ...timestamps,
  },
  (t) => [index('tickets_status_idx').on(t.status, t.createdAt)],
)

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id'),
    meta: jsonb('meta').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('audit_created_idx').on(t.createdAt)],
)

// ── Bildirishnomalar ───────────────────────────────────────────────

export type BroadcastAudience =
  | { kind: 'all' }
  | { kind: 'bookers' }
  | { kind: 'active30' }
  | { kind: 'users'; userIds: string[] }

export type BroadcastChannels = { telegram: boolean; push: boolean }

export const broadcasts = pgTable(
  'broadcasts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type', { enum: NOTIFICATION_TYPES }).notNull().default('system'),
    title: text('title').notNull(),
    body: text('body').notNull(),
    link: text('link'),
    audience: jsonb('audience').$type<BroadcastAudience>().notNull(),
    channels: jsonb('channels').$type<BroadcastChannels>().notNull().default({ telegram: false, push: true }),
    status: text('status', { enum: BROADCAST_STATUSES }).notNull().default('draft'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    recipients: integer('recipients').notNull().default(0),
    telegramSent: integer('telegram_sent').notNull().default(0),
    pushSent: integer('push_sent').notNull().default(0),
    error: text('error'),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [index('broadcasts_status_idx').on(t.status, t.scheduledAt)],
)

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type', { enum: NOTIFICATION_TYPES }).notNull().default('system'),
    title: text('title').notNull(),
    body: text('body').notNull(),
    link: text('link'),
    broadcastId: uuid('broadcast_id').references(() => broadcasts.id, { onDelete: 'set null' }),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('notifications_user_idx').on(t.userId, t.createdAt),
    index('notifications_broadcast_idx').on(t.broadcastId),
  ],
)

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    endpoint: text('endpoint').notNull(),
    p256dh: text('p256dh').notNull(),
    auth: text('auth').notNull(),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('push_endpoint_uq').on(t.endpoint), index('push_user_idx').on(t.userId)],
)

export type User = typeof users.$inferSelect
export type Complex = typeof complexes.$inferSelect
export type Service = typeof services.$inferSelect
export type BookingMode = (typeof BOOKING_MODES)[number]
export type ListingStatus = (typeof LISTING_STATUSES)[number]
export type News = typeof news.$inferSelect
export type SportEvent = typeof events.$inferSelect
export type Booking = typeof bookings.$inferSelect
export type Submission = typeof submissions.$inferSelect
export type Notification = typeof notifications.$inferSelect
export type Broadcast = typeof broadcasts.$inferSelect

// ── Sevimlilar va layklar (serverda — qurilmalar orasida saqlanadi) ─────

export const FAVORITE_KINDS = ['complex', 'service', 'course'] as const
export const LIKE_KINDS = ['complex', 'news'] as const
export type FavoriteKind = (typeof FAVORITE_KINDS)[number]
export type LikeKind = (typeof LIKE_KINDS)[number]

export const favorites = pgTable(
  'favorites',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: FAVORITE_KINDS }).notNull(),
    itemId: text('item_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.kind, t.itemId] }), index('favorites_item_idx').on(t.kind, t.itemId)],
)

export const likes = pgTable(
  'likes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    kind: text('kind', { enum: LIKE_KINDS }).notNull(),
    itemId: text('item_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.kind, t.itemId] }), index('likes_item_idx').on(t.kind, t.itemId)],
)

// ── Reels (bosh sahifa va «Reels» bo‘limi) — admin paneldan boshqariladi ─

export const REEL_TONES = ['blue', 'orange', 'purple', 'pink', 'teal', 'green'] as const

export const reels = pgTable('reels', {
  /** Instagram reel kodi: instagram.com/reel/<code>/ */
  code: text('code').primaryKey(),
  title: text('title').notNull(),
  tag: text('tag').notNull().default('SportON'),
  tagTone: text('tag_tone', { enum: REEL_TONES }).notNull().default('blue'),
  cover: text('cover').notNull(),
  /** Saytda o‘ynatiladigan mp4 (bo‘lmasa Instagram embed) */
  video: text('video'),
  publishedOn: date('published_on', { mode: 'string' }),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  ...timestamps,
})

// ── Texnik: so‘rovlar cheklovi va xatolar jurnali ───────────────────────

/** Bir nechta server jarayonida ham ishlaydigan cheklovchi (src/lib/rate-limit.ts) */
export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  resetAt: timestamp('reset_at', { withTimezone: true }).notNull(),
})

export const errorEvents = pgTable(
  'error_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    source: text('source', { enum: ['api', 'client'] }).notNull(),
    message: text('message').notNull(),
    stack: text('stack'),
    url: text('url'),
    userAgent: text('user_agent'),
    userId: uuid('user_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('error_events_created_idx').on(t.createdAt)],
)

export type Reel = typeof reels.$inferSelect
export type ErrorEvent = typeof errorEvents.$inferSelect
