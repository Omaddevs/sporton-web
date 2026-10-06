// Sport tadbirlari: turnirlar, marafonlar, ochiq mashg‘ulotlar
// dates/year/time — bosh sahifadagi kartochka uchun; startsAt/endsAt — ortga sanoq va kalendar uchun
const img = (name) => `/images/sport/cat/${name}.jpg`

export const sportEvents = [
  {
    id: 'toshkent-marafoni',
    title: 'Toshkent xalqaro marafoni — 2026',
    category: 'Yengil atletika',
    image: img('yengil-atletika'),
    location: 'Toshkent, Amir Temur xiyoboni',
    dates: ['20 Okt'],
    year: 2026,
    time: '07:00',
    startsAt: '2026-10-20T07:00:00+05:00',
    endsAt: '2026-10-20T14:00:00+05:00',
    excerpt:
      'Shahar markazidagi yangi marshrut bo‘ylab 42, 21 va 10 km masofalar. Har bir finishchi medal va elektron sertifikat oladi.',
    organizer: { name: 'Toshkent shahar sport boshqarmasi', role: 'Rasmiy tashkilotchi' },
    fee: '120 000 so‘m',
    prize: '150 000 000 so‘m',
    level: 'Barcha darajalar',
    age: '14+ (42 km — 18+)',
    capacity: 6000,
    registered: 4820,
    views: 12840,
    about: [
      'Toshkent xalqaro marafoni — mamlakatdagi eng yirik ommaviy yugurish tadbiri. Bu yil marshrut Amir Temur xiyobonidan boshlanib, shaharning tarixiy ko‘chalari va yangi bog‘lari orqali o‘tadi.',
      'Professional sportchilar bilan bir qatorda havaskorlar ham o‘z kuchini sinab ko‘rishi mumkin: 10 km masofa ilk marta yugurayotganlar uchun ayni muddao. Marshrut bo‘ylab har 2,5 km da suv va tibbiy yordam punktlari joylashgan.',
      'Tadbir oilaviy bayramga aylanadi: finish hududida musiqa, bolalar zonasi va homiylar stendlari bo‘ladi.',
    ],
    includes: ['Start raqami va chip', 'Finishchi medali', 'Brendlangan futbolka', 'Elektron sertifikat', 'Suv va izotonik', 'Tibbiy sug‘urta'],
    schedule: [
      { time: '05:30', label: 'Start hududi ochiladi', note: 'Kiyim saqlash xonasi ishlay boshlaydi' },
      { time: '06:30', label: 'Umumiy razminka', note: 'Murabbiylar boshchiligida' },
      { time: '07:00', label: '42 km start' },
      { time: '07:30', label: '21 km va 10 km start' },
      { time: '13:00', label: 'Taqdirlash marosimi', note: 'Mutlaq va yosh toifalari g‘oliblari' },
    ],
    rules: [
      'Tibbiy ma’lumotnoma (so‘nggi 6 oy ichida) talab qilinadi',
      'Ro‘yxatdan o‘tish 15-oktabr kuni yopiladi',
      'Start paketi 18–19-oktabr kunlari beriladi',
      'Marshrutda velosiped va samokat taqiqlanadi',
    ],
    venue: { name: 'Amir Temur xiyoboni', address: 'Toshkent sh., Yunusobod tumani, Amir Temur xiyoboni' },
    faq: [
      { q: 'Ro‘yxatdan o‘tgandan keyin masofani o‘zgartirsa bo‘ladimi?', a: 'Ha, 15-oktabrgacha shaxsiy kabinet orqali bepul o‘zgartirish mumkin.' },
      { q: 'To‘lov qaytariladimi?', a: 'Tadbirdan 7 kun oldingacha bekor qilinsa, to‘lovning 50% qaytariladi.' },
      { q: 'Natijalar qayerda e’lon qilinadi?', a: 'Chip natijalari finishdan keyin 2 soat ichida SportON sahifasida chiqadi.' },
    ],
  },
  {
    id: 'mini-futbol-kubogi',
    title: 'Havaskorlar o‘rtasida mini-futbol kubogi',
    category: 'Futbol',
    image: img('futbol'),
    location: 'Goal Arena, Toshkent',
    dates: ['1 Noy', '22 Noy'],
    year: 2026,
    time: '18:00',
    startsAt: '2026-11-01T18:00:00+05:00',
    endsAt: '2026-11-22T22:00:00+05:00',
    excerpt:
      '32 ta havaskor jamoa, 5x5 format va uch hafta davom etadigan kurash. Final o‘yini jonli efirda ko‘rsatiladi.',
    organizer: { name: 'SportON', role: 'Tashkilotchi' },
    fee: '600 000 so‘m / jamoa',
    prize: '30 000 000 so‘m',
    level: 'Havaskor',
    age: '16+',
    capacity: 32,
    registered: 27,
    views: 6420,
    about: [
      'Mini-futbol kubogi Toshkentdagi havaskor jamoalar uchun eng nufuzli turnirlardan biri. O‘yinlar yopiq Goal Arena majmuasida, sun’iy qoplamali maydonlarda o‘tkaziladi.',
      'Turnir guruh bosqichi va pley-off tizimida o‘tadi. Har bir o‘yinni litsenziyali hakamlar boshqaradi, natijalar va statistika SportON ilovasida real vaqtda yangilanadi.',
    ],
    includes: ['Kamida 4 ta kafolatlangan o‘yin', 'Litsenziyali hakamlar', 'Video-sharhlar', 'Kiyinish xonasi va dush', 'Eng yaxshi o‘yinchi sovrinlari'],
    schedule: [
      { time: '1-noyabr', label: 'Guruh bosqichi boshlanadi', note: '8 guruh, har birida 4 jamoa' },
      { time: '8-noyabr', label: 'Guruh bosqichi yakuni' },
      { time: '15-noyabr', label: '1/8 va chorak finallar' },
      { time: '22-noyabr', label: 'Yarim final va final', note: 'Final 20:30 da' },
    ],
    rules: ['Jamoada 7–10 o‘yinchi', 'Professional klub o‘yinchilari qatnasha olmaydi', 'Bir xil rangdagi forma majburiy', 'Oyoq himoyachilari tavsiya etiladi'],
    venue: { name: 'Goal Arena', address: 'Toshkent sh., Chilonzor tumani, Bunyodkor ko‘chasi' },
    faq: [
      { q: 'Jamoa tarkibini o‘zgartirsa bo‘ladimi?', a: 'Guruh bosqichi tugaguniga qadar 2 tagacha o‘yinchini almashtirish mumkin.' },
      { q: 'O‘yin qoldirilsa nima bo‘ladi?', a: 'Sababsiz kelmagan jamoaga 0:3 hisobida texnik mag‘lubiyat beriladi.' },
    ],
  },
  {
    id: 'ochiq-yoga',
    title: 'Ochiq havoda bepul yoga mashg‘uloti',
    category: 'Yoga',
    image: img('yoga'),
    location: 'Yapon bog‘i, Toshkent',
    dates: ['11 Okt'],
    year: 2026,
    time: '08:00',
    startsAt: '2026-10-11T08:00:00+05:00',
    endsAt: '2026-10-11T09:30:00+05:00',
    excerpt:
      'Yapon bog‘ida tonggi yoga: nafas texnikasi, yengil asanalar va meditatsiya. Barcha darajalar uchun, mutlaqo bepul.',
    organizer: { name: 'Nilufar Saidova', role: 'Yoga instruktori' },
    fee: 'Bepul',
    prize: null,
    level: 'Boshlovchilar ham',
    age: '12+',
    capacity: 120,
    registered: 96,
    views: 3180,
    about: [
      'Har oyning ikkinchi yakshanbasida o‘tkaziladigan ochiq yoga mashg‘uloti tabiat qo‘ynida kunni sokin boshlash imkonini beradi.',
      'Mashg‘ulot 90 daqiqa davom etadi va oldin yoga bilan shug‘ullanmaganlar uchun ham moslashtirilgan. Instruktor har bir asanani soddalashtirilgan variantda ham ko‘rsatadi.',
    ],
    includes: ['90 daqiqalik mashg‘ulot', 'Choy va suv', 'Ijaraga gilamcha (cheklangan)', 'Uyda mashq qilish uchun reja'],
    schedule: [
      { time: '07:40', label: 'Yig‘ilish va joylashish' },
      { time: '08:00', label: 'Nafas texnikasi' },
      { time: '08:20', label: 'Asanalar ketma-ketligi' },
      { time: '09:10', label: 'Meditatsiya va yakun' },
    ],
    rules: ['Gilamchani o‘zingiz bilan olib keling', 'Mashg‘ulotdan 2 soat oldin og‘ir ovqat yemang', 'Qulay, harakatni cheklamaydigan kiyim'],
    venue: { name: 'Yapon bog‘i', address: 'Toshkent sh., Mirzo Ulug‘bek tumani, Yapon bog‘i' },
    faq: [
      { q: 'Yomg‘ir yog‘sa nima bo‘ladi?', a: 'Mashg‘ulot yaqin atrofdagi yopiq zalga ko‘chiriladi, ro‘yxatdan o‘tganlarga SMS yuboriladi.' },
      { q: 'Bolalar bilan kelsa bo‘ladimi?', a: '12 yoshdan katta bolalar ota-onasi bilan qatnasha oladi.' },
    ],
  },
  {
    id: 'tennis-turniri',
    title: 'Kuzgi havaskorlar tennis turniri',
    category: 'Tennis',
    image: img('tennis'),
    location: 'Tennis Park, Samarqand',
    dates: ['25 Okt', '27 Okt'],
    year: 2026,
    time: '10:00',
    startsAt: '2026-10-25T10:00:00+05:00',
    endsAt: '2026-10-27T19:00:00+05:00',
    excerpt:
      'Yakkalik va juftlik razryadlarida uch kunlik turnir. Reyting ochkolari va sovrinlar havaskor darajadagi o‘yinchilar uchun.',
    organizer: { name: 'Samarqand tennis federatsiyasi', role: 'Tashkilotchi' },
    fee: '250 000 so‘m',
    prize: '12 000 000 so‘m',
    level: 'Havaskor (NTRP 2.5–4.0)',
    age: '18+',
    capacity: 64,
    registered: 58,
    views: 2760,
    about: [
      'Kuzgi turnir Samarqanddagi Tennis Park’ning 8 ta grunt kortida o‘tkaziladi. Ishtirokchilar daraja bo‘yicha guruhlarga ajratiladi, shuning uchun har bir o‘yin teng kuchlilar bellashuviga aylanadi.',
      'G‘oliblar SportON havaskorlar reytingida ochko oladi va bahorgi Respublika turniriga taklifnoma qo‘lga kiritadi.',
    ],
    includes: ['Yangi to‘plar har o‘yinda', 'Hakamlik', 'Sport ichimliklari', 'Fotosessiya', 'Reyting ochkolari'],
    schedule: [
      { time: '25-oktabr', label: 'Saralash va guruh o‘yinlari' },
      { time: '26-oktabr', label: 'Asosiy setka', note: 'Yakkalik va juftlik' },
      { time: '27-oktabr', label: 'Finallar va taqdirlash', note: 'Finallar 15:00 dan' },
    ],
    rules: ['Havaskor daraja (professional reytingi yo‘q)', 'O‘z raketkangiz bilan', 'Grunt kort uchun poyabzal majburiy'],
    venue: { name: 'Tennis Park', address: 'Samarqand sh., Universitet xiyoboni' },
    faq: [
      { q: 'Juftlikka sherigim yo‘q, nima qilay?', a: 'Ro‘yxatdan o‘tishda “sherik kerak” belgisini qo‘ying — tashkilotchilar daraja bo‘yicha juftlik tuzib beradi.' },
      { q: 'Turar joy bilan yordam berasizmi?', a: 'Hamkor mehmonxonalarda ishtirokchilar uchun 15% chegirma mavjud.' },
    ],
  },
]

export const getSportEvent = (id) => sportEvents.find((e) => e.id === id)

// Sport yangiliklari
export const sportNews = [
  {
    id: 'terma-jamoa',
    tag: 'Futbol',
    tone: 'mint',
    title: 'O‘zbekiston terma jamoasi navbatdagi saralash o‘yiniga tayyorlanmoqda',
    description:
      "Bosh murabbiy o‘yin oldidan jamoa tarkibini e’lon qildi. Yosh futbolchilar ham chaqiruv oldi.",
    organizer: 'SportON yangiliklar',
    deadline: '2 soat oldin',
    cta: "O'qish",
  },
  {
    id: 'yangi-majmua',
    tag: 'Infratuzilma',
    tone: 'pink',
    title: 'Toshkentda yangi ko‘p tarmoqli sport majmuasi ochildi',
    description:
      "Majmuada suzish havzasi, 2 ta mini-futbol maydoni va zamonaviy trenajyor zali bor. Bronlar SportON orqali qabul qilinmoqda.",
    organizer: 'SportON yangiliklar',
    deadline: 'Bugun',
    cta: "O'qish",
  },
  {
    id: 'kurash-oltin',
    tag: 'Kurash',
    tone: 'yellow',
    title: 'Kurashchilarimiz Osiyo chempionatida 3 ta oltin medal qo‘lga kiritdi',
    description:
      "Terma jamoa umumjamoa hisobida birinchi o‘rinni egalladi. G‘oliblar bilan qisqa suhbat.",
    organizer: 'SportON yangiliklar',
    deadline: 'Kecha',
    cta: "O'qish",
  },
  {
    id: 'sogliq-maslahat',
    tag: 'Sog‘lom turmush',
    tone: 'lavender',
    title: 'Haftasiga necha marta mashq qilish kerak? Mutaxassis javob beradi',
    description:
      "Boshlang‘ich daraja uchun optimal rejim, tiklanish va uyqu haqida amaliy tavsiyalar.",
    organizer: 'SportON yangiliklar',
    deadline: '3 kun oldin',
    cta: "O'qish",
  },
]

const SHORT_MONTHS = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
// Sanalar Toshkent vaqtida (UTC+5)
const tashkent = (iso) => new Date(new Date(iso).getTime() + 5 * 3600 * 1000)
const shortDay = (d) => `${d.getUTCDate()} ${SHORT_MONTHS[d.getUTCMonth()]}`

/** Backenddagi (admin paneldan kiritilgan) tadbirlar bilan ro‘yxatni almashtiradi */
export function hydrateEvents(list) {
  const items = list.map((e) => {
    const start = tashkent(e.startsAt)
    const end = tashkent(e.endsAt)
    const startDay = shortDay(start)
    const endDay = shortDay(end)
    return {
      id: e.id,
      title: e.title,
      category: e.category,
      image: e.image || img('boshqa'),
      location: e.location,
      dates: startDay === endDay ? [startDay] : [startDay, endDay],
      year: start.getUTCFullYear(),
      time: start.toISOString().slice(11, 16),
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      excerpt: e.excerpt,
      organizer: { name: e.organizerName, role: e.organizerRole },
      fee: e.fee,
      prize: e.prize,
      level: e.level,
      age: e.age,
      capacity: e.capacity,
      registered: e.registered,
      views: e.views,
      about: e.about ?? [],
      includes: e.includes ?? [],
      schedule: e.schedule ?? [],
      rules: e.rules ?? [],
      venue: { name: e.venueName || e.location, address: e.venueAddress || e.location },
      faq: e.faq ?? [],
    }
  })
  sportEvents.splice(0, sportEvents.length, ...items)
}
