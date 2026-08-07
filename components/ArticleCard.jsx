import Link from 'next/link'
import { formatDate, formatViews, readingTime } from '../lib/format'

export default function ArticleCard({ article }) {
  const cat = article.categories

  return (
    <Link href={`/artikel/${article.slug}/`} className="card">
      <div className="card-img">
        {article.featured_image_url ? (
          <img src={article.featured_image_url} alt={article.title} loading="lazy" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#374151,#111827)' }}>
            <span style={{ fontWeight: 900, color: '#4B5563', fontSize: '1.4rem' }}>LS</span>
          </div>
        )}
      </div>
      <div className="card-body">
        {cat && <span className="badge" style={{ marginBottom: 8, fontSize: '0.65rem' }}>{cat.name}</span>}
        <h3 className="card-title">{article.title}</h3>
        {article.excerpt && <p className="card-excerpt">{article.excerpt}</p>}
        <div className="card-meta">
          <span>{formatDate(article.published_at)}</span>
          <span>• {readingTime(article.content)}</span>
          <span>• {formatViews(article.views_count)} dibaca</span>
        </div>
      </div>
    </Link>
  )
}
