import Link from 'next/link'
import { getPublishedArticles, getPopularArticles, getCategories } from '../lib/data'
import { formatDate, formatViews, readingTime } from '../lib/format'
import ArticleCard from '../components/ArticleCard'
import SidebarWidgets from '../components/SidebarWidgets'

export const metadata = {
  title: 'Beranda',
  description: 'Berita terkini Sulawesi Tenggara - Politik, Sultra, Edukasi, Ekonomi, dan Kesehatan.'
}

export default async function HomePage() {
  const [articles, popular, categories] = await Promise.all([
    getPublishedArticles(30),
    getPopularArticles(6),
    getCategories()
  ])

  const heroMain = articles[0]
  const heroSide = articles.slice(1, 3)
  const rest = articles.slice(3)

  return (
    <>
      <section className="hero container">
        {heroMain && (
          <div className="hero-grid">
            <Link href={`/artikel/${heroMain.slug}/`} className="hero-main">
              {heroMain.featured_image_url ? (
                <img src={heroMain.featured_image_url} alt={heroMain.title} loading="eager" />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1F2937,#111827)', display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontSize: '3rem', fontWeight: 900, color: '#374151' }}>LS</span>
                </div>
              )}
              <div className="hero-main-overlay">
                <div>
                  {heroMain.categories && (
                    <span className="badge">{heroMain.categories.name}</span>
                  )}
                  <h2>{heroMain.title}</h2>
                  <div className="hero-meta">
                    <span>{formatDate(heroMain.published_at)}</span>
                    <span>• {formatViews(heroMain.views_count)} dibaca</span>
                    <span>• {readingTime(heroMain.content)}</span>
                  </div>
                </div>
              </div>
            </Link>
            <div className="hero-side">
              {heroSide.map((a) => (
                <Link key={a.id} href={`/artikel/${a.slug}/`} className="hero-side-card">
                  {a.featured_image_url ? (
                    <img src={a.featured_image_url} alt={a.title} loading="eager" />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#374151,#111827)' }} />
                  )}
                  <div className="hero-side-overlay">
                    <h3>{a.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="section container">
        <div className="content-layout">
          <div>
            <div className="section-head">
              <h2 className="section-title">Berita Terkini</h2>
              <Link href="/kategori/sultra/" className="view-all">Lihat Semua →</Link>
            </div>
            {rest.length === 0 ? (
              <div className="empty">Belum ada artikel yang dipublikasikan.</div>
            ) : (
              <div className="articles-grid">
                {rest.map((a) => <ArticleCard key={a.id} article={a} />)}
              </div>
            )}
          </div>

          <aside>
            <SidebarWidgets />
            <div className="sidebar-card">
              <h3 className="sidebar-title">Populer</h3>
              {popular.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Belum ada data.</p>}
              {popular.map((a, i) => (
                <Link key={a.id} href={`/artikel/${a.slug}/`} className="popular-item">
                  <span className="popular-num">{i + 1}</span>
                  <span className="popular-title">{a.title}</span>
                </Link>
              ))}
            </div>
            <div className="sidebar-card">
              <h3 className="sidebar-title">Kategori</h3>
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/kategori/${c.slug}/`}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 4px', borderBottom: '1px solid var(--gray-100)', fontWeight: 600, fontSize: '0.9rem' }}
                >
                  <span>{c.name}</span>
                  <span style={{ color: 'var(--red)' }}>→</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </>
  )
}
