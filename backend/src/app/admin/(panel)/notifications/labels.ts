export const TYPE_LABEL: Record<string, string> = {
  system: 'Tizim',
  promo: 'Aksiya',
  news: 'Yangilik',
  booking: 'Bron',
  submission: 'Majmua',
  support: 'Yordam',
}

export const AUDIENCE_LABEL: Record<string, string> = {
  all: 'Barcha foydalanuvchilar',
  bookers: 'Bron qilganlar',
  active30: '30 kunda faollar',
  users: 'Tanlanganlar',
}

export const BROADCAST_STATUS: Record<string, { label: string; tone: string }> = {
  draft: { label: 'Qoralama', tone: 'neutral' },
  scheduled: { label: 'Rejalashtirilgan', tone: 'info' },
  sending: { label: 'Yuborilmoqda', tone: 'warning' },
  sent: { label: 'Yuborildi', tone: 'success' },
  failed: { label: 'Xatolik', tone: 'danger' },
  cancelled: { label: 'Bekor qilingan', tone: 'neutral' },
}
