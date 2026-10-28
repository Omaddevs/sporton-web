import { tr } from '../i18n/index.js'
// Sport tadbirlari: turnirlar, marafonlar, ochiq mashg‘ulotlar
// dates/year/time — bosh sahifadagi kartochka uchun; startsAt/endsAt — ortga sanoq va kalendar uchun
const img = (name) => `/images/sport/cat/${name}.webp`

export const sportEvents = [
  {
    id: 'toshkent-marafoni',
    title: tr('Toshkent xalqaro marafoni — 2026'),
    category: tr('Yengil atletika'),
    image: img('yengil-atletika'),
    location: tr('Toshkent, Amir Temur xiyoboni'),
    dates: [tr('20 Okt')],
    year: 2026,
    time: '07:00',
    startsAt: '2026-10-20T07:00:00+05:00',
    endsAt: '2026-10-20T14:00:00+05:00',
    excerpt:
      tr('Shahar markazidagi yangi marshrut bo‘ylab 42, 21 va 10 km masofalar. Har bir finishchi medal va elektron sertifikat oladi.'),
    organizer: { name: 'Toshkent shahar sport boshqarmasi', role: tr('Rasmiy tashkilotchi') },
    fee: tr('120 000 so‘m'),
    prize: tr('150 000 000 so‘m'),
    level: tr('Barcha darajalar'),
    age: tr('14+ (42 km — 18+)'),
    capacity: 6000,
    registered: 4820,
    views: 12840,
    about: [
      tr('Toshkent xalqaro marafoni — mamlakatdagi eng yirik ommaviy yugurish tadbiri. Bu yil marshrut Amir Temur xiyobonidan boshlanib, shaharning tarixiy ko‘chalari va yangi bog‘lari orqali o‘tadi.'),
      tr('Professional sportchilar bilan bir qatorda havaskorlar ham o‘z kuchini sinab ko‘rishi mumkin: 10 km masofa ilk marta yugurayotganlar uchun ayni muddao. Marshrut bo‘ylab har 2,5 km da suv va tibbiy yordam punktlari joylashgan.'),
      tr('Tadbir oilaviy bayramga aylanadi: finish hududida musiqa, bolalar zonasi va homiylar stendlari bo‘ladi.'),
    ],
    includes: [tr('Start raqami va chip'), tr('Finishchi medali'), tr('Brendlangan futbolka'), tr('Elektron sertifikat'), tr('Suv va izotonik'), tr('Tibbiy sug‘urta')],
    schedule: [
      { time: '05:30', label: tr('Start hududi ochiladi'), note: tr('Kiyim saqlash xonasi ishlay boshlaydi') },
      { time: '06:30', label: tr('Umumiy razminka'), note: tr('Murabbiylar boshchiligida') },
      { time: '07:00', label: tr('42 km start') },
      { time: '07:30', label: tr('21 km va 10 km start') },
      { time: '13:00', label: tr('Taqdirlash marosimi'), note: tr('Mutlaq va yosh toifalari g‘oliblari') },
    ],
    rules: [
      tr('Tibbiy ma’lumotnoma (so‘nggi 6 oy ichida) talab qilinadi'),
      tr('Ro‘yxatdan o‘tish 15-oktabr kuni yopiladi'),
      tr('Start paketi 18–19-oktabr kunlari beriladi'),
      tr('Marshrutda velosiped va samokat taqiqlanadi'),
    ],
    venue: { name: 'Amir Temur xiyoboni', address: tr('Toshkent sh., Yunusobod tumani, Amir Temur xiyoboni') },
    faq: [
      { q: tr('Ro‘yxatdan o‘tgandan keyin masofani o‘zgartirsa bo‘ladimi?'), a: tr('Ha, 15-oktabrgacha shaxsiy kabinet orqali bepul o‘zgartirish mumkin.') },
      { q: tr('To‘lov qaytariladimi?'), a: tr('Tadbirdan 7 kun oldingacha bekor qilinsa, to‘lovning 50% qaytariladi.') },
      { q: tr('Natijalar qayerda e’lon qilinadi?'), a: tr('Chip natijalari finishdan keyin 2 soat ichida SportON sahifasida chiqadi.') },
    ],
  },
  {
    id: 'mini-futbol-kubogi',
    title: tr('Havaskorlar o‘rtasida mini-futbol kubogi'),
    category: tr('Futbol'),
    image: img('futbol'),
    location: tr('Goal Arena, Toshkent'),
    dates: [tr('1 Noy'), tr('22 Noy')],
    year: 2026,
    time: '18:00',
    startsAt: '2026-11-01T18:00:00+05:00',
    endsAt: '2026-11-22T22:00:00+05:00',
    excerpt:
      tr('32 ta havaskor jamoa, 5x5 format va uch hafta davom etadigan kurash. Final o‘yini jonli efirda ko‘rsatiladi.'),
    organizer: { name: 'SportON', role: tr('Tashkilotchi') },
    fee: tr('600 000 so‘m / jamoa'),
    prize: tr('30 000 000 so‘m'),
    level: tr('Havaskor'),
    age: '16+',
    capacity: 32,
    registered: 27,
    views: 6420,
    about: [
      tr('Mini-futbol kubogi Toshkentdagi havaskor jamoalar uchun eng nufuzli turnirlardan biri. O‘yinlar yopiq Goal Arena majmuasida, sun’iy qoplamali maydonlarda o‘tkaziladi.'),
      tr('Turnir guruh bosqichi va pley-off tizimida o‘tadi. Har bir o‘yinni litsenziyali hakamlar boshqaradi, natijalar va statistika SportON ilovasida real vaqtda yangilanadi.'),
    ],
    includes: [tr('Kamida 4 ta kafolatlangan o‘yin'), tr('Litsenziyali hakamlar'), tr('Video-sharhlar'), tr('Kiyinish xonasi va dush'), tr('Eng yaxshi o‘yinchi sovrinlari')],
    schedule: [
      { time: '1-noyabr', label: tr('Guruh bosqichi boshlanadi'), note: tr('8 guruh, har birida 4 jamoa') },
      { time: '8-noyabr', label: tr('Guruh bosqichi yakuni') },
      { time: '15-noyabr', label: tr('1/8 va chorak finallar') },
      { time: '22-noyabr', label: tr('Yarim final va final'), note: tr('Final 20:30 da') },
    ],
    rules: [tr('Jamoada 7–10 o‘yinchi'), tr('Professional klub o‘yinchilari qatnasha olmaydi'), tr('Bir xil rangdagi forma majburiy'), tr('Oyoq himoyachilari tavsiya etiladi')],
    venue: { name: 'Goal Arena', address: tr('Toshkent sh., Chilonzor tumani, Bunyodkor ko‘chasi') },
    faq: [
      { q: tr('Jamoa tarkibini o‘zgartirsa bo‘ladimi?'), a: tr('Guruh bosqichi tugaguniga qadar 2 tagacha o‘yinchini almashtirish mumkin.') },
      { q: tr('O‘yin qoldirilsa nima bo‘ladi?'), a: tr('Sababsiz kelmagan jamoaga 0:3 hisobida texnik mag‘lubiyat beriladi.') },
    ],
  },
  {
    id: 'ochiq-yoga',
    title: tr('Ochiq havoda bepul yoga mashg‘uloti'),
    category: tr('Yoga'),
    image: img('yoga'),
    location: tr('Yapon bog‘i, Toshkent'),
    dates: [tr('11 Okt')],
    year: 2026,
    time: '08:00',
    startsAt: '2026-10-11T08:00:00+05:00',
    endsAt: '2026-10-11T09:30:00+05:00',
    excerpt:
      tr('Yapon bog‘ida tonggi yoga: nafas texnikasi, yengil asanalar va meditatsiya. Barcha darajalar uchun, mutlaqo bepul.'),
    organizer: { name: 'Nilufar Saidova', role: tr('Yoga instruktori') },
    fee: tr('Bepul'),
    prize: null,
    level: tr('Boshlovchilar ham'),
    age: '12+',
    capacity: 120,
    registered: 96,
    views: 3180,
    about: [
      tr('Har oyning ikkinchi yakshanbasida o‘tkaziladigan ochiq yoga mashg‘uloti tabiat qo‘ynida kunni sokin boshlash imkonini beradi.'),
      tr('Mashg‘ulot 90 daqiqa davom etadi va oldin yoga bilan shug‘ullanmaganlar uchun ham moslashtirilgan. Instruktor har bir asanani soddalashtirilgan variantda ham ko‘rsatadi.'),
    ],
    includes: [tr('90 daqiqalik mashg‘ulot'), tr('Choy va suv'), tr('Ijaraga gilamcha (cheklangan)'), tr('Uyda mashq qilish uchun reja')],
    schedule: [
      { time: '07:40', label: tr('Yig‘ilish va joylashish') },
      { time: '08:00', label: tr('Nafas texnikasi') },
      { time: '08:20', label: tr('Asanalar ketma-ketligi') },
      { time: '09:10', label: tr('Meditatsiya va yakun') },
    ],
    rules: [tr('Gilamchani o‘zingiz bilan olib keling'), tr('Mashg‘ulotdan 2 soat oldin og‘ir ovqat yemang'), tr('Qulay, harakatni cheklamaydigan kiyim')],
    venue: { name: 'Yapon bog‘i', address: tr('Toshkent sh., Mirzo Ulug‘bek tumani, Yapon bog‘i') },
    faq: [
      { q: tr('Yomg‘ir yog‘sa nima bo‘ladi?'), a: tr('Mashg‘ulot yaqin atrofdagi yopiq zalga ko‘chiriladi, ro‘yxatdan o‘tganlarga SMS yuboriladi.') },
      { q: tr('Bolalar bilan kelsa bo‘ladimi?'), a: tr('12 yoshdan katta bolalar ota-onasi bilan qatnasha oladi.') },
    ],
  },
  {
    id: 'tennis-turniri',
    title: tr('Kuzgi havaskorlar tennis turniri'),
    category: tr('Tennis'),
    image: img('tennis'),
    location: tr('Tennis Park, Samarqand'),
    dates: [tr('25 Okt'), tr('27 Okt')],
    year: 2026,
    time: '10:00',
    startsAt: '2026-10-25T10:00:00+05:00',
    endsAt: '2026-10-27T19:00:00+05:00',
    excerpt:
      tr('Yakkalik va juftlik razryadlarida uch kunlik turnir. Reyting ochkolari va sovrinlar havaskor darajadagi o‘yinchilar uchun.'),
    organizer: { name: 'Samarqand tennis federatsiyasi', role: tr('Tashkilotchi') },
    fee: tr('250 000 so‘m'),
    prize: tr('12 000 000 so‘m'),
    level: tr('Havaskor (NTRP 2.5–4.0)'),
    age: '18+',
    capacity: 64,
    registered: 58,
    views: 2760,
    about: [
      tr('Kuzgi turnir Samarqanddagi Tennis Park’ning 8 ta grunt kortida o‘tkaziladi. Ishtirokchilar daraja bo‘yicha guruhlarga ajratiladi, shuning uchun har bir o‘yin teng kuchlilar bellashuviga aylanadi.'),
      tr('G‘oliblar SportON havaskorlar reytingida ochko oladi va bahorgi Respublika turniriga taklifnoma qo‘lga kiritadi.'),
    ],
    includes: [tr('Yangi to‘plar har o‘yinda'), tr('Hakamlik'), tr('Sport ichimliklari'), tr('Fotosessiya'), tr('Reyting ochkolari')],
    schedule: [
      { time: '25-oktabr', label: tr('Saralash va guruh o‘yinlari') },
      { time: '26-oktabr', label: tr('Asosiy setka'), note: tr('Yakkalik va juftlik') },
      { time: '27-oktabr', label: tr('Finallar va taqdirlash'), note: tr('Finallar 15:00 dan') },
    ],
    rules: [tr('Havaskor daraja (professional reytingi yo‘q)'), tr('O‘z raketkangiz bilan'), tr('Grunt kort uchun poyabzal majburiy')],
    venue: { name: 'Tennis Park', address: tr('Samarqand sh., Universitet xiyoboni') },
    faq: [
      { q: tr('Juftlikka sherigim yo‘q, nima qilay?'), a: tr('Ro‘yxatdan o‘tishda “sherik kerak” belgisini qo‘ying — tashkilotchilar daraja bo‘yicha juftlik tuzib beradi.') },
      { q: tr('Turar joy bilan yordam berasizmi?'), a: tr('Hamkor mehmonxonalarda ishtirokchilar uchun 15% chegirma mavjud.') },
    ],
  },
]

export const getSportEvent = (id) => sportEvents.find((e) => e.id === id)

// Sport yangiliklari
export const sportNews = [
  {
    id: 'terma-jamoa',
    tag: tr('Futbol'),
    tone: 'mint',
    title: tr('O‘zbekiston terma jamoasi navbatdagi saralash o‘yiniga tayyorlanmoqda'),
    description:
      tr("Bosh murabbiy o‘yin oldidan jamoa tarkibini e’lon qildi. Yosh futbolchilar ham chaqiruv oldi."),
    organizer: tr('SportON yangiliklar'),
    deadline: tr('2 soat oldin'),
    cta: tr("O'qish"),
  },
  {
    id: 'yangi-majmua',
    tag: tr('Infratuzilma'),
    tone: 'pink',
    title: tr('Toshkentda yangi ko‘p tarmoqli sport majmuasi ochildi'),
    description:
      tr("Majmuada suzish havzasi, 2 ta mini-futbol maydoni va zamonaviy trenajyor zali bor. Bronlar SportON orqali qabul qilinmoqda."),
    organizer: tr('SportON yangiliklar'),
    deadline: tr('Bugun'),
    cta: tr("O'qish"),
  },
  {
    id: 'kurash-oltin',
    tag: tr('Kurash'),
    tone: 'yellow',
    title: tr('Kurashchilarimiz Osiyo chempionatida 3 ta oltin medal qo‘lga kiritdi'),
    description:
      tr("Terma jamoa umumjamoa hisobida birinchi o‘rinni egalladi. G‘oliblar bilan qisqa suhbat."),
    organizer: tr('SportON yangiliklar'),
    deadline: tr('Kecha'),
    cta: tr("O'qish"),
  },
  {
    id: 'sogliq-maslahat',
    tag: tr('Sog‘lom turmush'),
    tone: 'lavender',
    title: tr('Haftasiga necha marta mashq qilish kerak? Mutaxassis javob beradi'),
    description:
      tr("Boshlang‘ich daraja uchun optimal rejim, tiklanish va uyqu haqida amaliy tavsiyalar."),
    organizer: tr('SportON yangiliklar'),
    deadline: tr('3 kun oldin'),
    cta: tr("O'qish"),
  },
]

const SHORT_MONTHS = [tr('Yan'), tr('Fev'), tr('Mar'), tr('Apr'), tr('May'), tr('Iyn'), tr('Iyl'), tr('Avg'), tr('Sen'), tr('Okt'), tr('Noy'), tr('Dek')]
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
