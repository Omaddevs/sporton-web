import { companies } from './companies.js'
import { jobs } from './jobs.js'

function companyById(id) {
  return companies.find((c) => c.id === id)
}

function jobsForCompany(companyName, limit = 3) {
  return jobs
    .filter((j) => j.company === companyName)
    .slice(0, limit)
    .map((j) => ({
      id: j.id,
      title: j.title,
      location: j.location,
      typeLabel: j.typeLabel,
      typeTone: j.typeTone,
    }))
}

const olimpiya = companyById('olimpiya')
const champion = companyById('champion-arena')
const aqua = companyById('aqua-life')
const tennis = companyById('tennis-park')
const fitlife = companyById('fitlife')

const firstJob = (companyId) => jobs.find((j) => j.companyId === companyId)

function jobContextOf(job) {
  return job
    ? {
        jobId: job.id,
        title: job.title,
        location: job.location,
        typeLabel: job.typeLabel,
        typeTone: job.typeTone,
      }
    : null
}

const gallery = (n) => `/images/sport/gallery/g${n}.jpg`

export const messageFilters = [
  { id: 'all', label: 'Barchasi' },
  { id: 'employer', label: 'Majmualar' },
  { id: 'candidate', label: 'Murabbiylar' },
]

/** Seed conversations for the chat UI */
export const initialConversations = [
  {
    id: 'c-olimpiya',
    peerType: 'employer',
    name: olimpiya?.name ?? 'Olimpiya Sport Majmuasi',
    verified: true,
    avatar: olimpiya?.logo,
    avatarColor: olimpiya?.color || '#1e6ff5',
    roleLabel: 'Sport majmuasi',
    lastSeen: 'Oxirgi marta 5 daqiqa oldin',
    preview: 'Bron tasdiqlandi, sizni kutamiz!',
    timeLabel: '14:32',
    unread: 2,
    online: true,
    companyId: 'olimpiya',
    about:
      "Olimpiya Sport Majmuasi — futbol va basketbol maydonlari, suzish havzasi va trenajyor zaliga ega zamonaviy majmua.",
    stats: [
      { id: 'years', label: 'Faoliyatda', value: '12 yil', icon: 'calendar' },
      { id: 'staff', label: 'Murabbiylar', value: '40+', icon: 'users' },
      { id: 'hq', label: 'Manzil', value: 'Toshkent', icon: 'map' },
    ],
    activeJobs: jobsForCompany(olimpiya?.name, 3),
    media: [gallery(1), gallery(2), gallery(3), gallery(5)],
    jobContext: jobContextOf(firstJob('olimpiya')),
    messages: [
      {
        id: 'm1',
        from: 'me',
        text: 'Assalomu alaykum! Shanba kuni 18:00–19:00 ga mini-futbol maydoni bo‘shmi?',
        time: '10:12',
        status: 'read',
      },
      {
        id: 'm2',
        from: 'them',
        text: "Va alaykum assalom! Ha, bo'sh. 10 kishilik jamoa uchunmi? Narxi soatiga 250 000 so'm.",
        time: '10:18',
        status: 'read',
      },
      {
        id: 'm3',
        from: 'me',
        text: 'Ha, 10 kishimiz. To‘p va manishkalar beriladimi?',
        time: '10:24',
        status: 'read',
      },
      {
        id: 'm4',
        from: 'them',
        text: "Albatta, to'p va manishkalar bepul. Kiyinish xonasi va dush ham bor.",
        time: '10:31',
        status: 'read',
      },
      {
        id: 'm5',
        from: 'them',
        time: '10:31',
        status: 'read',
        attachment: {
          name: 'Bron_tasdigi_SportON.pdf',
          size: '84 KB',
          ext: 'PDF',
        },
      },
      {
        id: 'm6',
        from: 'them',
        text: 'Bron tasdiqlandi, sizni kutamiz! Mashg‘ulotdan 10 daqiqa oldin yetib keling.',
        time: '14:32',
        status: 'delivered',
      },
    ],
  },
  {
    id: 'c-champion',
    peerType: 'employer',
    name: champion?.name ?? 'Champion Arena',
    verified: true,
    avatar: champion?.logo,
    avatarColor: champion?.color || '#16a34a',
    roleLabel: 'Sport majmuasi',
    lastSeen: 'Oxirgi marta 1 soat oldin',
    preview: 'Turnir jadvali tayyor, ko‘rib chiqasizmi?',
    timeLabel: 'Kecha',
    unread: 1,
    online: false,
    companyId: 'champion-arena',
    about: 'Champion Arena — yopiq futbol va basketbol arenasi, korporativ turnirlar uchun qulay maskan.',
    stats: [
      { id: 'years', label: 'Faoliyatda', value: '8 yil', icon: 'calendar' },
      { id: 'staff', label: 'Murabbiylar', value: '25+', icon: 'users' },
      { id: 'hq', label: 'Manzil', value: 'Toshkent', icon: 'map' },
    ],
    activeJobs: jobsForCompany(champion?.name, 3),
    media: [gallery(3), gallery(5)],
    jobContext: jobContextOf(firstJob('champion-arena')),
    messages: [
      {
        id: 't1',
        from: 'them',
        text: 'Assalomu alaykum! Korporativ turnir jadvali tayyor. Ko‘rib chiqib, vaqtni tasdiqlay olasizmi?',
        time: '16:40',
        status: 'delivered',
      },
    ],
  },
  {
    id: 'c-madina',
    peerType: 'candidate',
    name: 'Madina R.',
    verified: false,
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
    avatarColor: '#1e6ff5',
    roleLabel: 'Fitnes murabbiyi',
    lastSeen: 'Hozir onlayn',
    preview: 'Mashg‘ulot rejasini yubordim',
    timeLabel: '12:05',
    unread: 0,
    online: true,
    about:
      'Fitnes va funksional trening bo‘yicha 5 yillik tajriba. Ozish va forma saqlash dasturlariga ixtisoslashgan.',
    stats: [
      { id: 'exp', label: 'Tajriba', value: '5 yil', icon: 'calendar' },
      { id: 'role', label: 'Yo‘nalish', value: 'Fitnes', icon: 'users' },
      { id: 'city', label: 'Shahar', value: 'Toshkent', icon: 'map' },
    ],
    activeJobs: [],
    media: [],
    jobContext: null,
    messages: [
      {
        id: 'n1',
        from: 'them',
        text: 'Assalomu alaykum! Kelgusi 4 hafta uchun mashg‘ulot rejasini yubordim.',
        time: '12:05',
        status: 'read',
      },
      {
        id: 'n2',
        from: 'me',
        text: 'Rahmat, ko‘rib chiqaman. Seshanba kungi darsda ko‘rishamiz!',
        time: '12:20',
        status: 'read',
      },
    ],
  },
  {
    id: 'c-aqua',
    peerType: 'employer',
    name: aqua?.name ?? 'Aqua Life',
    verified: true,
    avatar: aqua?.logo,
    avatarColor: aqua?.color || '#0284c7',
    roleLabel: 'Suzish havzasi',
    lastSeen: 'Oxirgi marta 3 soat oldin',
    preview: 'Abonementingiz 3 kundan keyin tugaydi',
    timeLabel: 'Dush',
    unread: 0,
    online: false,
    companyId: 'aqua-life',
    about: 'Aqua Life — olimpiya o‘lchamidagi suzish havzasi, kattalar va bolalar uchun guruh darslari.',
    stats: [
      { id: 'years', label: 'Faoliyatda', value: '6 yil', icon: 'calendar' },
      { id: 'staff', label: 'Murabbiylar', value: '20+', icon: 'users' },
      { id: 'hq', label: 'Manzil', value: 'Toshkent', icon: 'map' },
    ],
    activeJobs: jobsForCompany(aqua?.name, 3),
    media: [],
    jobContext: jobContextOf(firstJob('aqua-life')),
    messages: [
      {
        id: 'a1',
        from: 'them',
        text: 'Hurmatli mijoz! Abonementingiz 3 kundan keyin tugaydi. Uzaytirsangiz, 10% chegirma beramiz.',
        time: '09:15',
        status: 'read',
      },
    ],
  },
  {
    id: 'c-tennis',
    peerType: 'employer',
    name: tennis?.name ?? 'Tennis Park',
    verified: true,
    avatar: tennis?.logo,
    avatarColor: tennis?.color || '#7a9a06',
    roleLabel: 'Tennis klubi',
    lastSeen: 'Oxirgi marta kecha',
    preview: 'Sizni kuzgi turnirga taklif qilamiz',
    timeLabel: 'Shan',
    unread: 0,
    online: false,
    companyId: 'tennis-park',
    about: 'Tennis Park — yopiq va ochiq kortlar, yakka darslar va havaskorlar turnirlari.',
    stats: [
      { id: 'years', label: 'Faoliyatda', value: '5 yil', icon: 'calendar' },
      { id: 'staff', label: 'Murabbiylar', value: '12', icon: 'users' },
      { id: 'hq', label: 'Manzil', value: 'Toshkent', icon: 'map' },
    ],
    activeJobs: jobsForCompany(tennis?.name, 3),
    media: [gallery(4)],
    jobContext: jobContextOf(firstJob('tennis-park')),
    messages: [
      {
        id: 'tp1',
        from: 'them',
        text: 'Salom! Kuzgi havaskorlar tennis turniriga taklif qilamiz. Ro‘yxatdan o‘tish 25-oktabrgacha.',
        time: '11:02',
        status: 'read',
      },
    ],
  },
  {
    id: 'c-fitlife',
    peerType: 'employer',
    name: fitlife?.name ?? 'FitLife Club',
    verified: true,
    avatar: fitlife?.logo,
    avatarColor: fitlife?.color || '#7c3aed',
    roleLabel: 'Fitnes klubi',
    lastSeen: 'Oxirgi marta 2 kun oldin',
    preview: 'Bepul sinov darsiga yozildingiz',
    timeLabel: 'Juma',
    unread: 0,
    online: false,
    companyId: 'fitlife',
    about: 'FitLife Club — trenajyor zali, guruh mashg‘ulotlari va shaxsiy trenerlar.',
    stats: [
      { id: 'years', label: 'Faoliyatda', value: '7 yil', icon: 'calendar' },
      { id: 'staff', label: 'Murabbiylar', value: '18', icon: 'users' },
      { id: 'hq', label: 'Manzil', value: 'Toshkent', icon: 'map' },
    ],
    activeJobs: jobsForCompany(fitlife?.name, 3),
    media: [gallery(2)],
    jobContext: jobContextOf(firstJob('fitlife')),
    messages: [
      {
        id: 'f1',
        from: 'them',
        text: 'Bepul sinov darsiga yozildingiz! Dushanba, 19:00. Sport kiyimi va suv olib keling.',
        time: '18:47',
        status: 'read',
      },
    ],
  },
]

export function buildCompanyConversation(company, job = null) {
  const activeJobs = jobsForCompany(company.name, 3)
  const jobContext = job
    ? {
        jobId: job.id,
        title: job.title,
        location: job.location,
        typeLabel: job.typeLabel,
        typeTone: job.typeTone,
      }
    : activeJobs[0]
      ? {
          jobId: activeJobs[0].id,
          title: activeJobs[0].title,
          location: activeJobs[0].location,
          typeLabel: activeJobs[0].typeLabel,
          typeTone: activeJobs[0].typeTone,
        }
      : null

  return {
    id: `c-new-${company.id}${job ? `-j${job.id}` : ''}`,
    peerType: 'employer',
    name: company.name,
    verified: Boolean(company.verified),
    avatar: company.logo || null,
    avatarColor: company.color || '#1e6ff5',
    roleLabel: 'Sport majmuasi',
    lastSeen: 'Hozir onlayn',
    preview: 'Yangi suhbat',
    timeLabel: 'Hozir',
    unread: 0,
    online: true,
    companyId: company.id,
    about: `${company.name} administratori bilan to‘g‘ridan-to‘g‘ri muloqot qiling. Bron va narxlar bo‘yicha savollaringizni yozing.`,
    stats: [
      { id: 'years', label: 'Faoliyatda', value: company.years ? `${company.years} yil` : '—', icon: 'calendar' },
      { id: 'ads', label: 'Xizmatlar', value: `${company.adsCount || 0}`, icon: 'users' },
      { id: 'hq', label: 'Manzil', value: company.city || 'O‘zbekiston', icon: 'map' },
    ],
    activeJobs,
    media: [],
    jobContext,
    messages: [
      {
        id: `sys-${company.id}`,
        from: 'them',
        text: job
          ? `Assalomu alaykum! «${job.title}» bo‘yicha bron va bo‘sh vaqtlar haqida yozishingiz mumkin.`
          : `Assalomu alaykum! ${company.name} administratori bilan bog‘landingiz. Xabaringizni yozing.`,
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
      },
    ],
  }
}

export function buildCandidateConversation(candidate) {
  return {
    id: `c-cand-${candidate.id}`,
    peerType: 'candidate',
    name: candidate.name,
    verified: Boolean(candidate.premium),
    avatar: candidate.avatar || null,
    avatarColor: '#1e6ff5',
    roleLabel: candidate.title || 'Murabbiy',
    lastSeen: candidate.online ? 'Hozir onlayn' : 'Oxirgi marta yaqinda',
    preview: 'Yangi suhbat',
    timeLabel: 'Hozir',
    unread: 0,
    online: Boolean(candidate.online),
    about: candidate.about || '',
    stats: [
      { id: 'exp', label: 'Tajriba', value: candidate.experience || '—', icon: 'calendar' },
      { id: 'role', label: 'Narx', value: candidate.salary || '—', icon: 'users' },
      { id: 'city', label: 'Shahar', value: candidate.location || '—', icon: 'map' },
    ],
    activeJobs: [],
    media: [],
    jobContext: null,
    messages: [
      {
        id: `sys-cand-${candidate.id}`,
        from: 'me',
        text: `Assalomu alaykum, ${candidate.name.split(' ')[0]}! Mashg‘ulotlaringizga yozilmoqchi edim. Bo‘sh vaqtlaringiz bormi?`,
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      },
    ],
  }
}

export function unreadTotal(conversations) {
  return conversations.reduce((sum, c) => sum + (c.unread || 0), 0)
}
