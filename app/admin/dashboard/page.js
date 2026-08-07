'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '../../../lib/supabase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [topArticles, setTopArticles] = useState([])

  useEffect(() => {
    const supabase = getSupabase()
    async function load() {
      const { count: totalArticles } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
      const { count: published } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
      const { count: totalComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
      const { count: pendingComments } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)
      const { data: top } = await supabase
        .from('articles')
        .select('id, title, views_count, is_published')
        .order('views_count', { ascending: false })
        .limit(6)

      setStats({
        totalArticles: totalArticles || 0,
        published: published || 0,
        totalComments: totalComments || 0,
        pendingComments: pendingComments || 0
      })
      setTopArticles(top || [])
    }
    load()
  }, [])

  if (!stats) {
    return (
      <div className="loading">
        <div className="spinner" />
        Memuat statistik...
      </div>
    )
  }

  const maxViews = Math.max(...topArticles.map((a) => a.views_count || 0), 1)

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">Ringkasan statistik konten Literasisultra</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Artikel</div>
          <div className="value">{stats.totalArticles}</div>
        </div>
        <div className="stat-card">
          <div className="label">Dipublikasikan</div>
          <div className="value" style={{ color: 'var(--red)' }}>{stats.published}</div>
          <div className="delta up">Dari {stats.totalArticles} artikel</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Komentar</div>
          <div className="value">{stats.totalComments}</div>
        </div>
        <div className="stat-card">
          <div className="label">Menunggu Moderasi</div>
          <div className="value" style={{ color: stats.pendingComments > 0 ? '#D97706' : 'var(--dark)' }}>
            {stats.pendingComments}
          </div>
        </div>
      </div>

      <div className="form-card">
        <h3>Artikel Terpopuler</h3>
        {topArticles.length === 0 && <div className="empty">Belum ada artikel.</div>}
        {topArticles.map((a) => (
          <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--gray-100)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{a.title}</span>
              <span className={`tag ${a.is_published ? 'tag-published' : 'tag-draft'}`}>
                {a.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
              <span>{a.views_count || 0} dilihat</span>
              <span>{maxViews > 0 ? Math.round(((a.views_count || 0) / maxViews) * 100) : 0}%</span>
            </div>
            <div className="chart-bar">
              <div className="chart-bar-fill" style={{ width: `${maxViews > 0 ? ((a.views_count || 0) / maxViews) * 100 : 0}%` }} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
