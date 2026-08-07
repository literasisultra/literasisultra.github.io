import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public')

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://literasisultra.github.io'
const SITE_NAME = 'Literasisultra'
const SITE_DESC = 'Portal berita dan literasi digital Sulawesi Tenggara.'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[generate-feed] Missing NEXT_PUBLIC_SUPABASE_URL / ANON_KEY. Skipping.')
  process.exit(0)
}

const supabase = createClient(supabaseUrl, supabaseKey)

function escapeXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function stripHtml(str = '') {
  return String(str)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function main() {
  const now = new Date().toISOString()

  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .order('slug')

  const { data: articles, error } = await supabase
    .from('articles')
    .select(`
      slug, title, excerpt, content, published_at, updated_at,
      categories(name)
    `)
    .eq('is_published', true)
    .lte('published_at', now)
    .order('published_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('[generate-feed] Error fetching articles:', error.message)
    process.exit(1)
  }

  mkdirSync(OUT_DIR, { recursive: true })

  const articleUrls = (articles || []).map((a) => ({
    loc: `${SITE_URL}/artikel/${a.slug}/`,
    lastmod: a.updated_at || a.published_at,
    changeFreq: 'weekly',
    priority: 0.8
  }))

  const categoryUrls = (categories || []).map((c) => ({
    loc: `${SITE_URL}/kategori/${c.slug}/`,
    lastmod: c.updated_at || now,
    changeFreq: 'daily',
    priority: 0.7
  }))

  const staticUrls = [
    { loc: `${SITE_URL}/`, lastmod: now, changeFreq: 'daily', priority: 1.0 },
    { loc: `${SITE_URL}/tentang/`, lastmod: now, changeFreq: 'monthly', priority: 0.5 },
    { loc: `${SITE_URL}/kontak/`, lastmod: now, changeFreq: 'monthly', priority: 0.5 }
  ]

  const urls = [...staticUrls, ...categoryUrls, ...articleUrls]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changeFreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

  writeFileSync(join(OUT_DIR, 'sitemap.xml'), sitemap)

  const rssItems = (articles || [])
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${SITE_URL}/artikel/${a.slug}/</link>
      <guid isPermaLink="true">${SITE_URL}/artikel/${a.slug}/</guid>
      <pubDate>${new Date(a.published_at).toUTCString()}</pubDate>
      <category>${escapeXml(a.categories?.name || 'Berita')}</category>
      <description>${escapeXml(stripHtml(a.excerpt || a.content || '').slice(0, 300))}</description>
    </item>`
    )
    .join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(SITE_DESC)}</description>
    <language>id-id</language>
    <lastBuildDate>${new Date(now).toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${rssItems}
  </channel>
</rss>
`

  writeFileSync(join(OUT_DIR, 'rss.xml'), rss)

  console.log(
    `[generate-feed] OK: ${urls.length} URL di sitemap.xml, ${(articles || []).length} item di rss.xml`
  )
}

main().catch((e) => {
  console.error('[generate-feed] Unexpected error:', e)
  process.exit(1)
})
