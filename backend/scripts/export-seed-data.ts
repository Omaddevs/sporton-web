/**
 * Frontenddagi (../src/data) statik katalog va yangiliklarni scripts/seed-data.json ga yozadi.
 * Backend shu JSON bilan mustaqil seed qilinadi (Docker ichida frontend fayllari yo‘q).
 *   npm run seed:export
 */
import { writeFileSync } from 'node:fs'
import { complexes } from '../../src/data/complexes.js'
import { companies } from '../../src/data/companies.js'
import { jobs } from '../../src/data/jobs.js'
import { allNews, featuredNews, getNewsById } from '../../src/data/news.js'
import { categories } from '../../src/data/categories.js'
import { sportEvents } from '../../src/data/campaigns.js'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any

const pick = (o: Any, keys: string[]) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]))

const data = {
  categories: categories.map((c: Any) => pick(c, ['id', 'title', 'accent', 'image'])),
  companies: companies.map((c: Any) =>
    pick(c, ['id', 'listed', 'website', 'phone', 'telegram', 'hours', 'priceNote', 'logo', 'bannerImage']),
  ),
  complexes: complexes.map((c: Any) =>
    pick(c, ['id', 'name', 'color', 'verified', 'tagline', 'location', 'city', 'website', 'industry', 'years', 'employees', 'hours', 'bannerSlogan', 'about', 'similarIds', 'images', 'coords', 'views']),
  ),
  jobs: jobs.map((j: Any) =>
    pick(j, ['id', 'companyId', 'title', 'sportId', 'category', 'type', 'location', 'coords', 'salary', 'hours', 'workMode', 'experience', 'level', 'description', 'tasks', 'requirements', 'offers', 'views']),
  ),
  news: allNews.map((n: Any) => {
    const detail: Any = getNewsById(n.id)
    return { ...pick(n, ['id', 'category', 'title', 'excerpt', 'image', 'date']), body: detail.body, tags: detail.tags, featured: n.id === featuredNews.id }
  }),
  events: sportEvents.map(({ dates: _d, year: _y, time: _t, ...e }: Any) => e),
}

writeFileSync(new URL('./seed-data.json', import.meta.url), JSON.stringify(data, null, 1))
console.log(`✓ seed-data.json: ${data.complexes.length} majmua, ${data.jobs.length} xizmat, ${data.news.length} yangilik`)
