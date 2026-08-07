import { notFound } from 'next/navigation'
import { getCategories, getArticlesByCategory, getPublishedArticles } from '../../../lib/data'
import ArticleCard from '../../../components/ArticleCard'

export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const categories = await getCategories()
  const cat = categories.find((c) => c.slug === slug)
  if (!cat) return { title: 'Kategori tidak ditemukan' }
  return {
    title: cat.name,
    description: cat.description || `Berita kategori ${cat.name} di Literasisultra.`
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params
  const [categories, articles, allArticles] = await Promise.all([
    getCategories(),
    getArticlesByCategory(slug, 60),
    getPublishedArticles(6)
  ])
  const cat = categories.find((c) => c.slug === slug)

  if (!cat) return notFound()

  return (
    <>
      <section className="section container">
        <div className="section-head">
          <div>
            <h1 className="section-title" style={{ fontSize: '1.6rem' }}>{cat.name}</h1>
            {cat.description && <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginTop: 6 }}>{cat.description}</p>}
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="empty">Belum ada artikel pada kategori ini.</div>
        ) : (
          <div className="articles-grid">
            {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </section>

      <section className="section container">
        <div className="section-head">
          <h2 className="section-title">Artikel Lainnya</h2>
        </div>
        <div className="articles-grid">
          {allArticles.slice(0, 3).map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      </section>
    </>
  )
}
