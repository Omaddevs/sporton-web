/** Profil sahifasi: bo‘limlar, bron holatlari va yordam — barcha ma’lumotlar serverdan, bu yerda faqat matnlar */
import { tr } from '../i18n/index.js'

export const BOOKING_STATUSES = {
  pending: { label: tr('Tasdiqlanmoqda'), tone: 'pending' },
  confirmed: { label: tr('Tasdiqlangan'), tone: 'success' },
  completed: { label: tr('Yakunlandi'), tone: 'info' },
  cancelled: { label: tr('Bekor qilingan'), tone: 'cancelled' },
}

export const PROFILE_SECTIONS = {
  profil: tr('Mening profilim'),
  bronlar: tr('Mening bronlarim'),
  bildirishnomalar: tr('Bildirishnomalar'),
  sozlamalar: tr('Sozlamalar'),
  xavfsizlik: tr('Hisob xavfsizligi'),
  yordam: tr('Yordam'),
}

export const profileNavItems = [
  { id: 'profil', label: tr('Mening profilim'), icon: 'user' },
  { id: 'bronlar', label: tr('Mening bronlarim'), icon: 'send' },
  { id: 'saved', label: tr('Saqlanganlar'), icon: 'heart', to: '/saqlanganlar' },
  { id: 'bildirishnomalar', label: tr('Bildirishnomalar'), icon: 'bell', badge: 'notifications' },
  { id: 'sozlamalar', label: tr('Sozlamalar'), icon: 'settings' },
  { id: 'xavfsizlik', label: tr('Hisob xavfsizligi'), icon: 'shield' },
  { id: 'yordam', label: tr('Yordam'), icon: 'help' },
  { id: 'logout', label: tr('Chiqish'), icon: 'logout', danger: true },
]

export const helpFaq = [
  {
    q: tr('Bronni qanday bekor qilaman?'),
    a: tr('«Mening bronlarim» bo‘limida kerakli bronni toping va «Bekor qilish» tugmasini bosing. Soatlik bronni mashg‘ulot boshlanishiga kamida 3 soat qolganda bekor qilish mumkin.'),
  },
  {
    q: tr('Bron qachon tasdiqlanadi?'),
    a: tr('Majmua bronni ko‘rib chiqib tasdiqlaydi — natija saytdagi bildirishnomalarda va Telegram botda keladi. Ariza turidagi xizmatlarda majmua o‘zi siz bilan bog‘lanadi.'),
  },
  {
    q: tr('Raqamimni qanday tasdiqlayman?'),
    a: tr('«Mening profilim» dagi «Tasdiqlash» tugmasini bosing va Telegram botga «Raqamni yuborish» tugmasi orqali o‘z raqamingizni yuboring. Tasdiqlangan raqam bilan sharh va izoh yozish mumkin.'),
  },
  {
    q: tr('Ma’lumotlarimni kim ko‘radi?'),
    a: tr('Profilingiz ommaga ko‘rinmaydi. Bron qilganingizda ismingiz va telefon raqamingiz faqat shu majmuaga ko‘rsatiladi. Sharh va izohlarda faqat ismingiz chiqadi.'),
  },
  {
    q: tr('Majmua egasiman — bronlarni qanday boshqaraman?'),
    a: tr('«Majmua qo‘shish» orqali ariza yuboring. Admin tasdiqlagach, telefon raqamingiz va parolingiz bilan «Majmua kabineti» ga kirib bronlarni tasdiqlaysiz va ma’lumotlarni tahrirlaysiz.'),
  },
  {
    q: tr('Parolimni unutdim, nima qilay?'),
    a: tr('Kirish sahifasidagi «Parolni unutdingizmi?» havolasini bosing — Telegram bot orqali tasdiqlash kodi olib, yangi parol o‘rnatasiz.'),
  },
]

export const SUPPORT_TOPICS = [
  { id: 'booking', label: tr('Bron bo‘yicha') },
  { id: 'account', label: tr('Hisob va profil') },
  { id: 'complex', label: tr('Majmua haqida shikoyat') },
  { id: 'owner', label: tr('Majmua egasi uchun') },
  { id: 'other', label: tr('Boshqa') },
]
