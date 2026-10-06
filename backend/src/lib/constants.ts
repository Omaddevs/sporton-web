export const AMENITIES = [
  { id: 'shower', label: 'Dush va kiyinish xonasi' },
  { id: 'parking', label: 'Bepul avtoturargoh' },
  { id: 'wifi', label: 'Bepul Wi-Fi' },
  { id: 'locker', label: 'Shaxsiy shkaflar' },
  { id: 'cafe', label: 'Kafe va dam olish zonasi' },
  { id: 'inventory', label: 'Inventar ijarasi' },
  { id: 'coach', label: 'Malakali murabbiylar' },
  { id: 'ac', label: 'Konditsioner' },
] as const

export const REGIONS = [
  { id: 'toshkent-shahar', label: 'Toshkent shahri', city: 'Toshkent' },
  { id: 'toshkent', label: 'Toshkent viloyati', city: 'Toshkent viloyati' },
  { id: 'andijon', label: 'Andijon', city: 'Andijon' },
  { id: 'buxoro', label: 'Buxoro', city: 'Buxoro' },
  { id: 'fargona', label: 'Farg‘ona', city: 'Farg‘ona' },
  { id: 'jizzax', label: 'Jizzax', city: 'Jizzax' },
  { id: 'namangan', label: 'Namangan', city: 'Namangan' },
  { id: 'navoiy', label: 'Navoiy', city: 'Navoiy' },
  { id: 'qashqadaryo', label: 'Qashqadaryo', city: 'Qarshi' },
  { id: 'qoraqalpogiston', label: 'Qoraqalpog‘iston', city: 'Nukus' },
  { id: 'samarqand', label: 'Samarqand', city: 'Samarqand' },
  { id: 'sirdaryo', label: 'Sirdaryo', city: 'Guliston' },
  { id: 'surxondaryo', label: 'Surxondaryo', city: 'Termiz' },
  { id: 'xorazm', label: 'Xorazm', city: 'Xorazm' },
] as const

export const SERVICE_TYPE_LABELS = {
  full: 'Yopiq zal',
  part: 'Ochiq maydon',
  remote: 'Onlayn mashg‘ulot',
  intern: 'Bepul sinov darsi',
} as const
