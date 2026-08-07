'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../lib/supabase/client'

export default function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    const supabase = getSupabase()
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, slug, excerpt, featured_image_url, published_at')
        .eq('is_published', true)
        .ilike('title', `%${query}%`)
        .order('published_at', { ascending: false })
        .limit(8)
      if (!error) setResults(data || [])
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  function go(slug) {
    router.push(`/artikel/${slug}/`)
    onClose()
  }

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="search-input"
          placeholder="Cari berita atau artikel..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading && <div className="loading">Mencari...</div>}
        {!loading && results.length === 0 && query.trim().length >= 2 && (
          <div className="empty">Tidak ada hasil untuk "{query}"</div>
        )}
        {results.map((r) => (
          <div key={r.id} className="search-result" onClick={() => go(r.slug)}>
            {r.featured_image_url && <img src={r.featured_image_url} alt="" />}
            <div>
              <h4>{r.title}</h4>
              <p>{new Date(r.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
