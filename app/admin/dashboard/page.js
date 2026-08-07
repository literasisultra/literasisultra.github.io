'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '../../../lib/supabase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [topArticles, setTopArticles] = useState([])
  const [daily, setDaily] = useState([])

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

      const days = await buildDailySeries(supabase)
      setDaily(days)
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
  const maxDaily = Math.max(...daily.map((d) => d.articles), 1)

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
        <h3>Publikasi 7 Hari Terakhir</h3>
        {daily.length === 0 && <div className="empty">Belum ada data.</div>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${daily.length || 1}, 1fr)`, gap: 10, alignItems: 'end', minHeight: 180 }}>
          {daily.map((d) => (
            <div key={d.date} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: d.articles > 0 ? 'var(--red)' : 'var(--gray-400)' }}>
                {d.articles}
              </div>
              <div
                style={{
                  height: `${Math.max((d.articles / maxDaily) * 110, 4)}px`,
                  background: d.articles > 0 ? 'linear-gradient(180deg, var(--red), #7F1D1D)' : 'var(--gray-100)',
                  borderRadius: '6px 6px 0 0',
                  minHeight: 4
                }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--gray-500)', marginTop: 6 }}>
                {d.label}
              </div>
            </div>
          ))}
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

async function buildDailySeries(supabase) {
  const labels = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    labels.push(d)
  }
  const start = new Date(labels[0])
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const { data } = await supabase
    .from('articles')
    .select('published_at')
    .gte('published_at', start.toISOString())
    .lte('published_at', end.toISOString())

  return labels.map((d) => {
    const key = d.toISOString().slice(0, 10)
    const count = (data || []).filter((a) => a.published_at && a.published_at.slice(0, 10) === key).length
    return {
      date: key,
      label: d.toLocaleDateString('id-ID', { weekday: 'short' }).replace('.', ''),
      articles: count
    }
  })
}
