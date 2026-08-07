import { notFound } from 'next/navigation'
import { getArticleBySlug, getPublishedArticles } from '../../../lib/data'
import { formatDate, formatViews, readingTime } from '../../../lib/format'
import ShareButtons from '../../../components/ShareButtons'
import CommentSection from '../../../components/CommentSection'
import ArticleCard from '../../../components/ArticleCard'

export async function generateStaticParams() {
  const articles = await getPublishedArticles(100)
  return articles.length ? articles.map((a) => ({ slug: a.slug })) : [{ slug: 'placeholder' }]
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) return { title: 'Artikel tidak ditemukan' }
  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt || '',
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      images: article.og_image_url || article.featured_image_url ? [{ url: article.og_image_url || article.featured_image_url }] : []
    }
  }
}

export default async function ArticlePage({ params }) {
  const { slug } = await params
  const [article, related] = await Promise.all([
    getArticleBySlug(slug),
    getPublishedArticles(50)
  ])

  if (!article) return notFound()

  const sameCat = related.filter(
    (r) => r.id !== article.id && r.categories?.slug === article.categories?.slug
  ).slice(0, 3)
  const others = related
    .filter((r) => r.id !== article.id && r.categories?.slug !== article.categories?.slug)
    .slice(0, 6)
  const relatedList = [...sameCat, ...others].slice(0, 6)

  const baseUrl = 'https://literasisultra.github.io'
  const articleUrl = `${baseUrl}/artikel/${article.slug}/`
  const authorInitial = (article.users?.name || 'A')[0].toUpperCase()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt || article.meta_description || '',
    image: article.og_image_url || article.featured_image_url,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      '@type': 'Person',
      name: article.users?.name || 'Redaksi Literasisultra'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Literasisultra',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/favicon.ico`
      }
    },
    mainEntityOfPage: articleUrl
  }

  return (
    <article className="article-hero container">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div className="article-cat">{article.categories?.name || 'Berita'}</div>
        <h1 className="article-title">{article.title}</h1>

        <div className="article-meta">
          {article.users && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {article.users.avatar_url ? (
                <img src={article.users.avatar_url} className="avatar" style={{ objectFit: 'cover' }} alt="" />
              ) : (
                <span className="avatar">{authorInitial}</span>
              )}
              <span style={{ fontWeight: 700 }}>{article.users.name}</span>
            </div>
          )}
          <span>{formatDate(article.published_at)}</span>
          <span>• {formatViews(article.views_count)} dibaca</span>
          <span>• {readingTime(article.content)}</span>
        </div>

        {article.featured_image_url && (
          <div className="article-featured-img">
            <img src={article.featured_image_url} alt={article.title} style={{ width: '100%', maxHeight: 480, objectFit: 'cover' }} />
          </div>
        )}

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <ShareButtons title={article.title} url={articleUrl} />

        <CommentSection articleId={article.id} />

        <div style={{ marginTop: 40 }}>
          <div className="section-head">
            <h2 className="section-title">Artikel Terkait</h2>
          </div>
          <div className="articles-grid">
            {relatedList.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        </div>
      </div>
    </article>
  )
}
