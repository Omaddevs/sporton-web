import { initialConversations, unreadTotal } from './messages.js'

export const PROFILE_STATUSES = [
  'Faol sportchi',
  'Yangi boshlovchi',
  'Havaskor sportchi',
  'Professional sportchi',
  'Murabbiy',
]

export const SPORT_LEVELS = ['Boshlang‘ich', 'O‘rta', 'Yuqori', 'Professional']

export const LANGUAGE_LEVELS = ['Ona tili', 'Erkin', 'O‘rta', 'Boshlang‘ich']

export const LANGUAGE_FLAGS = {
  'O‘zbek tili': '🇺🇿',
  'Rus tili': '🇷🇺',
  'Ingliz tili': '🇬🇧',
  'Turk tili': '🇹🇷',
  'Koreys tili': '🇰🇷',
  'Nemis tili': '🇩🇪',
  'Fransuz tili': '🇫🇷',
  'Arab tili': '🇸🇦',
  'Xitoy tili': '🇨🇳',
  'Qozoq tili': '🇰🇿',
  'Tojik tili': '🇹🇯',
}

export const SPORT_SUGGESTIONS = [
  'Futbol',
  'Mini-futbol',
  'Basketbol',
  'Voleybol',
  'Tennis',
  'Stol tennisi',
  'Padel',
  'Suzish',
  'Fitnes',
  'Yoga',
  'Pilates',
  'Yugurish',
  'Velosport',
  'Boks',
  'Kurash',
  'Shaxmat',
  'Stretching',
  'Krossfit',
]

export const INTEREST_SUGGESTIONS = [
  'Marafonlar',
  'Sog‘lom ovqatlanish',
  'Sayohat',
  'Tog‘ yurishi',
  'Meditatsiya',
  'Sport musobaqalari',
  'Velosayr',
  'Jamoaviy o‘yinlar',
  'Raqs',
]

export const BOOKING_STATUSES = {
  pending: { label: 'Tasdiqlanmoqda', tone: 'pending' },
  confirmed: { label: 'Tasdiqlangan', tone: 'success' },
  completed: { label: 'Yakunlandi', tone: 'info' },
  cancelled: { label: 'Bekor qilingan', tone: 'cancelled' },
}

/** Demo profil — localStorage’da saqlangan nusxa bo‘lmasa shu ma’lumot ishlatiladi */
export const defaultProfile = {
  name: 'Dilshoda Karimova',
  title: 'Havaskor sportchi · Fitnes va suzish',
  verified: true,
  status: 'Faol sportchi',
  location: 'Toshkent, Yunusobod',
  email: 'dilshoda.k@email.com',
  phone: '901234567',
  birthDate: '1998-03-15',
  address: 'Toshkent, Yunusobod tumani',
  level: 'O‘rta',
  emergencyPhone: '',
  avatar:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
  bio: 'Haftasiga 4 marta mashq qilaman: fitnes, suzish va yoga. Yil oxirigacha yarim marafonga tayyorlanyapman. Sport — mening energiya manbaim!',
  about:
    '3 yildan beri muntazam sport bilan shug‘ullanaman. Asosiy yo‘nalishlarim — kuch mashqlari va suzish, dam olish kunlari do‘stlar bilan mini-futbol o‘ynaymiz. Maqsadim — yil oxirigacha yarim marafonni yugurib chiqish.',
  skills: ['Fitnes', 'Suzish', 'Yoga', 'Yugurish', 'Mini-futbol', 'Pilates', 'Velosport', 'Stretching'],
  languages: [
    { id: 'uz', name: 'O‘zbek tili', level: 'Ona tili' },
    { id: 'ru', name: 'Rus tili', level: 'Erkin' },
    { id: 'en', name: 'Ingliz tili', level: 'O‘rta' },
  ],
  interests: ['Marafonlar', 'Sog‘lom ovqatlanish', 'Sayohat', 'Tog‘ yurishi', 'Meditatsiya', 'Sport musobaqalari'],
  experience: [
    {
      id: 'exp-gym',
      role: 'Fitnes — kuch mashqlari',
      company: 'Power Gym',
      years: '2023 — hozirgacha',
      points: [
        'Haftasiga 3 marta shaxsiy trener bilan mashg‘ulot',
        'Yil davomida 12 kg ortiqcha vazndan xalos bo‘lindi',
        'Funksional trening guruhida qatnashish',
      ],
    },
    {
      id: 'exp-swim',
      role: 'Suzish',
      company: 'Aqua Life',
      years: '2022 — hozirgacha',
      points: [
        'Krol va brass uslublarini o‘zlashtirish',
        '1 km masofani 25 daqiqada suzish',
        'Kattalar guruhida haftalik mashg‘ulotlar',
      ],
    },
  ],
  education: [
    { id: 'edu-run', degree: '10 km — finisher medali', school: 'Toshkent yarim marafoni', years: '2025' },
    { id: 'edu-fit', degree: 'Sertifikat — «30 kunlik fitnes» dasturi', school: 'FitLife Club', years: '2024' },
  ],
  bookings: [
    {
      id: 'b-1',
      title: 'Mini-futbol maydoni 5×5',
      companyId: 'champion-arena',
      place: 'Champion Arena',
      date: '2026-10-05',
      time: '18:00–19:00',
      price: '250 000 so‘m',
      status: 'pending',
    },
    {
      id: 'b-2',
      title: 'Tennis korti',
      companyId: 'tennis-park',
      place: 'Tennis Park',
      date: '2026-10-08',
      time: '09:00–10:00',
      price: '180 000 so‘m',
      status: 'confirmed',
    },
    {
      id: 'b-3',
      title: 'Suzish havzasi — seans',
      companyId: 'aqua-life',
      place: 'Aqua Life',
      date: '2026-10-01',
      time: '07:30–08:30',
      price: '90 000 so‘m',
      status: 'completed',
    },
    {
      id: 'b-4',
      title: 'Hatha yoga — sinov darsi',
      companyId: 'yoga-space',
      place: 'Yoga Space',
      date: '2026-09-27',
      time: '10:00–11:00',
      price: 'Bepul',
      status: 'completed',
    },
    {
      id: 'b-5',
      title: 'Funksional trening',
      companyId: 'power-gym',
      place: 'Power Gym',
      date: '2026-09-24',
      time: '19:00–20:00',
      price: '120 000 so‘m',
      status: 'cancelled',
    },
  ],
  savedCount: 8,
  trainingHours: 96,
  bonusPoints: 1250,
  premium: false,
  settings: {
    bookingReminders: true,
    newMessages: true,
    promotions: false,
    emailNotifications: true,
    smsNotifications: false,
    publicProfile: true,
    showPhone: false,
  },
  security: {
    twoFactor: false,
    sessions: [
      { id: 'current', device: 'Joriy qurilma', detail: 'Brauzer', location: 'Toshkent', last: 'Hozir faol', current: true },
      { id: 's-iphone', device: 'iPhone 14', detail: 'SportOn ilovasi', location: 'Toshkent', last: '2 kun oldin' },
      { id: 's-mac', device: 'MacBook Air', detail: 'Safari', location: 'Samarqand', last: '9 kun oldin' },
    ],
  },
  supportRequests: [],
}

export const premiumBenefits = [
  'Barcha bronlarda 10% chegirma',
  'Mashhur vaqtlarga ustuvor bron',
  'Bepul bekor qilish — istalgan vaqtda',
  'Premium holat belgisi',
]

export const premiumPlans = [
  { id: 'month', label: 'Oylik', price: '49 000 so‘m', note: 'har oy' },
  { id: 'year', label: 'Yillik', price: '399 000 so‘m', note: '2 oy bepul' },
]

export const PROFILE_SECTIONS = {
  profil: 'Mening profilim',
  bronlar: 'Mening bronlarim',
  bildirishnomalar: 'Bildirishnomalar',
  sozlamalar: 'Sozlamalar',
  xavfsizlik: 'Hisob xavfsizligi',
  yordam: 'Yordam',
}

export const profileNavItems = [
  { id: 'profil', label: 'Mening profilim', icon: 'user' },
  { id: 'bronlar', label: 'Mening bronlarim', icon: 'send' },
  { id: 'saved', label: 'Saqlanganlar', icon: 'heart', to: '/saqlanganlar' },
  { id: 'bildirishnomalar', label: 'Bildirishnomalar', icon: 'bell', badge: 'notifications' },
  {
    id: 'messages',
    label: 'Xabarlar',
    icon: 'message',
    badgeValue: unreadTotal(initialConversations),
    to: '/xabarlar',
  },
  { id: 'sozlamalar', label: 'Sozlamalar', icon: 'settings' },
  { id: 'xavfsizlik', label: 'Hisob xavfsizligi', icon: 'shield' },
  { id: 'yordam', label: 'Yordam', icon: 'help' },
  { id: 'logout', label: 'Chiqish', icon: 'logout', danger: true },
]

export const profileTabs = [
  { id: 'basic', label: 'Asosiy ma’lumot' },
  { id: 'experience', label: 'Sport tajribasi' },
  { id: 'education', label: 'Yutuqlar' },
  { id: 'skills', label: 'Sport turlari' },
  { id: 'activity', label: 'Bronlar' },
]

export const helpFaq = [
  {
    q: 'Bronni qanday bekor qilaman?',
    a: '«Mening bronlarim» bo‘limida kerakli bronni toping va «Bekor qilish» tugmasini bosing. Mashg‘ulot boshlanishiga 2 soatdan ko‘proq vaqt qolgan bo‘lsa, to‘lov to‘liq qaytariladi.',
  },
  {
    q: 'To‘lov qanday amalga oshiriladi?',
    a: 'Bron qilishda Payme, Click yoki Uzcard/Humo kartasi orqali to‘lash mumkin. Ba’zi majmualar joyida naqd to‘lovni ham qabul qiladi.',
  },
  {
    q: 'Bonus ballar nima uchun beriladi?',
    a: 'Har bir yakunlangan bron uchun 5% bonus ball beriladi. Ballarni keyingi bronlarda chegirma sifatida ishlatishingiz mumkin.',
  },
  {
    q: 'Profil ma’lumotlarimni kim ko‘radi?',
    a: '«Sozlamalar → Maxfiylik» bo‘limida profilingiz ommaga ko‘rinishini va telefon raqamingiz majmualarga ko‘rsatilishini boshqarishingiz mumkin.',
  },
  {
    q: 'Parolimni unutdim, nima qilay?',
    a: 'Kirish sahifasidagi «Parolni unutdingizmi?» havolasini bosing — Telegram bot orqali tasdiqlash kodi olib, yangi parol o‘rnatasiz.',
  },
]

export const SUPPORT_TOPICS = [
  { id: 'booking', label: 'Bron bo‘yicha' },
  { id: 'payment', label: 'To‘lov bo‘yicha' },
  { id: 'account', label: 'Hisob va profil' },
  { id: 'complex', label: 'Majmua haqida shikoyat' },
  { id: 'other', label: 'Boshqa' },
]
