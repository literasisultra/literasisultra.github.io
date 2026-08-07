'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../../../lib/supabase/client'
import { formatDateTime } from '../../../lib/format'

export default function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabase()
    supabase
      .from('articles')
      .select('id, title, is_published, published_at, views_count, categories(name)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setArticles(data || [])
        setLoading(false)
      })
  }, [])

  async function remove(id) {
    if (!confirm('Yakin ingin menghapus artikel ini?')) return
    const supabase = getSupabase()
    await supabase.from('articles').delete().eq('id', id)
    setArticles(articles.filter((a) => a.id !== id))
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Memuat artikel...
      </div>
    )
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Manajemen Artikel</h1>
          <p className="sub">{articles.length} artikel total</p>
        </div>
        <button className="btn-red" onClick={() => router.push('/admin/artikel/baru/')}>
          + Tulis Artikel
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="empty">Belum ada artikel. Klik "Tulis Artikel" untuk membuat.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Judul</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Tanggal</th>
              <th>Dilihat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 700 }}>{a.title}</td>
                <td>{a.categories?.name || '-'}</td>
                <td>
                  <span className={`tag ${a.is_published ? 'tag-published' : 'tag-draft'}`}>
                    {a.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>{formatDateTime(a.published_at || a.created_at)}</td>
                <td>{a.views_count || 0}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => router.push(`/admin/artikel/${a.id}/`)}>
                      Edit
                    </button>
                    <button className="btn-red" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => remove(a.id)}>
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
