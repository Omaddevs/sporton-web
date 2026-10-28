import { tr } from '../i18n/index.js'
export const REGIONS = [
  { id: 'all', label: tr('Barcha hududlar') },
  { id: 'toshkent-shahar', label: tr('Toshkent shahri') },
  { id: 'toshkent', label: tr('Toshkent viloyati') },
  { id: 'andijon', label: tr('Andijon') },
  { id: 'buxoro', label: tr('Buxoro') },
  { id: 'fargona', label: tr('Farg\'ona') },
  { id: 'jizzax', label: tr('Jizzax') },
  { id: 'namangan', label: tr('Namangan') },
  { id: 'navoiy', label: tr('Navoiy') },
  { id: 'qashqadaryo', label: tr('Qashqadaryo') },
  { id: 'qoraqalpogiston', label: tr('Qoraqalpog\'iston') },
  { id: 'samarqand', label: tr('Samarqand') },
  { id: 'sirdaryo', label: tr('Sirdaryo') },
  { id: 'surxondaryo', label: tr('Surxondaryo') },
  { id: 'xorazm', label: tr('Xorazm') },
]

/** Hozircha xizmat faqat Toshkent shahrida — boshqa hududlar «tez orada» */
export const ACTIVE_REGION_IDS = ['toshkent-shahar']
export const DEFAULT_REGION_ID = 'toshkent-shahar'
export const isRegionActive = (id) => ACTIVE_REGION_IDS.includes(id)

/** Tepadagi hudud tanlovi: «Barcha hududlar» yo‘q, faol bo‘lmaganlari — o‘chirilgan */
export const REGION_PICKER = REGIONS.filter((r) => r.id !== 'all')
