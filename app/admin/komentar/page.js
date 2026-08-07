'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '../../../lib/supabase/client'
import { formatDateTime } from '../../../lib/format'

const FILTERS = [
  { key: 'pending', label: 'Menunggu' },
  { key: 'approved', label: 'Disetujui' },
  { key: 'all', label: 'Semua' }
]

export default function AdminKomentar() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [busy, setBusy] = useState(null)

  useEffect(() => {
    const supabase = getSupabase()
    supabase
      .from('comments')
      .select('id, user_name, comment_text, is_approved, created_at, articles(title)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setComments(data || [])
        setLoading(false)
      })
  }, [])

  async function setApproved(id, approved) {
    setBusy(id)
    const supabase = getSupabase()
    const { error } = await supabase
      .from('comments')
      .update({ is_approved: approved })
      .eq('id', id)
    setBusy(null)
    if (!error) {
      setComments(comments.map((c) => (c.id === id ? { ...c, is_approved: approved } : c)))
    }
  }

  async function remove(id) {
    if (!confirm('Yakin ingin menghapus komentar ini?')) return
    setBusy(id)
    const supabase = getSupabase()
    const { error } = await supabase.from('comments').delete().eq('id', id)
    setBusy(null)
    if (!error) setComments(comments.filter((c) => c.id !== id))
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Memuat komentar...
      </div>
    )
  }

  const filtered = comments.filter((c) => {
    if (filter === 'pending') return !c.is_approved
    if (filter === 'approved') return c.is_approved
    return true
  })

  const pendingCount = comments.filter((c) => !c.is_approved).length

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Moderasi Komentar</h1>
          <p className="sub">
            {pendingCount > 0
              ? `${pendingCount} komentar menunggu persetujuan`
              : 'Tidak ada komentar yang menunggu'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`btn-outline ${filter === f.key ? 'active' : ''}`}
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">Belum ada komentar pada filter ini.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              className="form-card"
              style={{ opacity: c.is_approved ? 1 : 0.85 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <strong>{c.user_name || 'Anonim'}</strong>
                    <span className={`tag ${c.is_approved ? 'tag-published' : 'tag-draft'}`}>
                      {c.is_approved ? 'Disetujui' : 'Menunggu'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                      {formatDateTime(c.created_at)}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginTop: 2 }}>
                    pada artikel: {c.articles?.title || '(artikel dihapus)'}
                  </div>
                  <p style={{ margin: '10px 0 0' }}>{c.comment_text}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {!c.is_approved && (
                    <button
                      className="btn-red"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      disabled={busy === c.id}
                      onClick={() => setApproved(c.id, true)}
                    >
                      Setujui
                    </button>
                  )}
                  {c.is_approved && (
                    <button
                      className="btn-outline"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      disabled={busy === c.id}
                      onClick={() => setApproved(c.id, false)}
                    >
                      Batalkan
                    </button>
                  )}
                  <button
                    className="btn-red"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'transparent' }}
                    disabled={busy === c.id}
                    onClick={() => remove(c.id)}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
