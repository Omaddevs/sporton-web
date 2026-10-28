import { tr } from '../i18n/index.js'
// Sport turi sahifasidagi murabbiylar
const avatar = (id) =>
  `https://images.unsplash.com/photo-${id}?w=200&h=200&fit=crop&crop=faces`

const COACH_TITLES = {
  futbol: tr('Futbol murabbiyi'),
  basketbol: tr('Basketbol murabbiyi'),
  tennis: tr('Tennis murabbiyi'),
  suzish: tr('Suzish murabbiyi'),
  fitnes: tr('Fitnes murabbiyi'),
  boks: tr('Boks murabbiyi'),
  kurash: tr('Kurash murabbiyi'),
  voleybol: tr('Voleybol murabbiyi'),
  yoga: tr('Yoga instruktori'),
  'stol-tennisi': tr('Stol tennisi murabbiyi'),
  padel: tr('Padel murabbiyi'),
  'yengil-atletika': tr('Yengil atletika murabbiyi'),
  velosport: tr('Velosport murabbiyi'),
  shaxmat: tr('Shaxmat ustozi'),
  boshqa: tr('Sport murabbiyi'),
}

const COACH_SKILLS = {
  futbol: [tr('Texnika'), tr('Taktika'), tr('Darvozabonlik'), tr('Bolalar guruhi')],
  basketbol: [tr('Dribling'), tr('Otish texnikasi'), tr('Jamoaviy o‘yin')],
  tennis: [tr('Forhend / bekhend'), tr('Serve'), tr('Yakka darslar')],
  suzish: [tr('Krol'), tr('Brass'), tr('Suvdan qo‘rqishni yengish')],
  fitnes: [tr('Kuch mashqlari'), tr('Ozish dasturi'), tr('Ovqatlanish rejasi')],
  boks: [tr('Zarba texnikasi'), tr('Sparring'), tr('Chidamlilik')],
  kurash: [tr('Uloqtirish'), tr('Musobaqaga tayyorlov'), tr('Bolalar guruhi')],
  voleybol: [tr('Uzatma'), tr('Hujum zarbasi'), tr('Jamoaviy o‘yin')],
  yoga: [tr('Hatha'), tr('Pilates'), tr('Nafas mashqlari')],
  shaxmat: [tr('Debyut'), tr('Endshpil'), tr('Musobaqaga tayyorlov')],
}

const DEFAULT_SKILLS = [tr('Shaxsiy mashg‘ulot'), tr('Guruh darslari'), tr('Jismoniy tayyorgarlik')]

const TRAINERS = [
  {
    id: 'aziz-rahimov',
    regionId: 'toshkent-shahar',
    trainingTypes: ['full', 'part'],
    specialties: ['competition', 'beginner'],
    addedAt: '2026-09-20',
    name: 'Aziz Rahimov',
    location: tr('Toshkent'),
    district: tr('Yunusobod tumani'),
    experience: tr('8 yil tajriba'),
    salary: tr('150 000 soʻm / dars'),
    premium: true,
    online: true,
    avatar: avatar('1507003211169-0a1dd7228f2d'),
    school: tr('O‘zbekiston Davlat Jismoniy tarbiya va sport universiteti'),
    degree: tr('Bakalavr — Sport murabbiyligi'),
    years: '2010–2014',
    club: tr('Olimpiya Sport Majmuasi'),
    clubYears: tr('2018 — hozirgacha'),
  },
  {
    id: 'madina-rasulova',
    regionId: 'toshkent-shahar',
    trainingTypes: ['full', 'remote'],
    specialties: ['weight', 'beginner'],
    addedAt: '2026-10-02',
    name: 'Madina Rasulova',
    location: tr('Toshkent'),
    district: tr('Chilonzor tumani'),
    experience: tr('5 yil tajriba'),
    salary: tr('120 000 soʻm / dars'),
    premium: false,
    online: true,
    avatar: avatar('1544005313-94ddf0286df2'),
    school: tr('O‘zbekiston Davlat Jismoniy tarbiya va sport universiteti'),
    degree: tr('Magistr — Sport pedagogikasi'),
    years: '2015–2019',
    club: tr('FitLife Club'),
    clubYears: tr('2020 — hozirgacha'),
  },
  {
    id: 'jasur-karimov',
    regionId: 'toshkent-shahar',
    trainingTypes: ['part', 'intern'],
    specialties: ['competition', 'kids'],
    addedAt: '2026-08-11',
    name: 'Jasur Karimov',
    location: tr('Toshkent'),
    district: tr('Mirzo Ulug‘bek tumani'),
    experience: tr('12 yil tajriba'),
    salary: tr('200 000 soʻm / dars'),
    premium: true,
    online: false,
    avatar: avatar('1500648767791-00dcc994a43e'),
    school: tr('Respublika Olimpiya zaxiralari kolleji'),
    degree: tr('Sport ustasi, xalqaro toifadagi hakam'),
    years: '2006–2010',
    club: tr('Champion Arena'),
    clubYears: tr('2016 — hozirgacha'),
  },
  {
    id: 'nilufar-tosheva',
    regionId: 'toshkent-shahar',
    trainingTypes: ['full', 'remote', 'intern'],
    specialties: ['rehab', 'weight', 'kids'],
    addedAt: '2026-09-28',
    name: 'Nilufar Tosheva',
    location: tr('Toshkent'),
    district: tr('Yakkasaroy tumani'),
    experience: tr('4 yil tajriba'),
    salary: tr('100 000 soʻm / dars'),
    premium: false,
    online: true,
    avatar: avatar('1438761681033-6461ffad8d80'),
    school: tr('O‘zbekiston Davlat Jismoniy tarbiya va sport universiteti'),
    degree: tr('Bakalavr — Jismoniy madaniyat'),
    years: '2016–2020',
    club: tr('Yoga Space'),
    clubYears: tr('2021 — hozirgacha'),
  },
  {
    id: 'sardor-aliyev',
    regionId: 'samarqand',
    trainingTypes: ['part', 'intern'],
    specialties: ['beginner', 'kids'],
    addedAt: '2026-07-15',
    name: 'Sardor Aliyev',
    location: tr('Samarqand'),
    district: tr('Samarqand shahri'),
    experience: tr('6 yil tajriba'),
    salary: tr('90 000 soʻm / dars'),
    premium: false,
    online: false,
    avatar: avatar('1472099645785-5658abf4ff4e'),
    school: tr('Samarqand Davlat Universiteti'),
    degree: tr('Bakalavr — Jismoniy tarbiya'),
    years: '2012–2016',
    club: tr('Atlet Sport Markazi'),
    clubYears: tr('2019 — hozirgacha'),
  },
]

function buildTrainer(base, categoryId) {
  const title = COACH_TITLES[categoryId] ?? COACH_TITLES.boshqa
  const skills = COACH_SKILLS[categoryId] ?? DEFAULT_SKILLS
  return {
    id: base.id,
    name: base.name,
    title,
    location: base.location,
    regionId: base.regionId,
    district: base.district,
    experience: base.experience,
    salary: base.salary,
    // Filtr va saralash uchun raqamli qiymatlar (matnli maydonlardan olinadi)
    price: Number(base.salary.replace(/\D/g, '')),
    experienceYears: Number.parseInt(base.experience, 10) || 0,
    trainingTypes: base.trainingTypes,
    specialties: base.specialties,
    addedAt: base.addedAt,
    skills,
    premium: base.premium,
    online: base.online,
    avatar: base.avatar,
    about: tr('{years} yillik tajribaga ega {title}. Yangi boshlovchilar bilan ham, musobaqaga tayyorlanayotgan sportchilar bilan ham ishlayman. Har bir shogird uchun individual reja tuzaman va natijani muntazam kuzatib boraman.', { years: Number.parseInt(base.experience, 10) || 0, title: title.toLowerCase() }),
    education: [{ school: base.school, degree: base.degree, years: base.years }],
    work: [
      {
        role: title,
        company: base.club,
        years: base.clubYears,
        points: [
          tr('Yakka va guruh mashg‘ulotlarini olib borish'),
          tr('Shogirdlarni shahar va respublika musobaqalariga tayyorlash'),
          tr('Jismoniy tayyorgarlik va tiklanish dasturlarini tuzish'),
        ],
      },
    ],
  }
}

export function getCandidatesForCategory(categoryId) {
  return TRAINERS.map((trainer) => buildTrainer(trainer, categoryId))
}

