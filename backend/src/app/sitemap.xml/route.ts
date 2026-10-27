import { sitemapXml } from '@/lib/seo'

export const dynamic = 'force-dynamic'

/** /sitemap.xml — production’da nginx shu manzilni backendga yo‘naltiradi */
export async function GET() {
  return new Response(await sitemapXml(), {
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  })
}
