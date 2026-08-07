'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../lib/supabase/client'

export default function CommentSection({ articleId }) {
  const [comments, setComments] = useState([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabase()
    let active = true

    async function load() {
      const { data, error } = await supabase
        .from('comments')
        .select('id, user_name, comment_text, created_at')
        .eq('article_id', articleId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
      if (!error && active) setComments(data || [])
    }

    load()

    const channel = supabase
      .channel(`comments-${articleId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `article_id=eq.${articleId}`
        },
        () => load()
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [articleId])

  async function submit(e) {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return
    setSending(true)
    const supabase = getSupabase()
    const { error } = await supabase.from('comments').insert({
      article_id: articleId,
      user_name: name.trim(),
      comment_text: text.trim(),
      is_approved: false
    })
    setSending(false)
    if (error) {
      setMsg('Gagal mengirim komentar: ' + error.message)
    } else {
      setMsg('Komentar terkirim dan menunggu moderasi admin.')
      setName('')
      setText('')
      setTimeout(() => router.refresh(), 1500)
    }
  }

  return (
    <div className="comments">
      <h3 className="section-title" style={{ marginBottom: 20 }}>
        Komentar ({comments.length})
      </h3>

      <form className="comment-form" onSubmit={submit}>
        <div className="field-row">
          <input
            placeholder="Nama Anda"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input placeholder="Email (opsional)" type="email" />
        </div>
        <textarea
          placeholder="Tulis komentar..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ minHeight: 120 }}
          required
        />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="btn-red" type="submit" disabled={sending}>
            {sending ? 'Mengirim...' : 'Kirim Komentar'}
          </button>
          {msg && <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{msg}</span>}
        </div>
      </form>

      {comments.length === 0 ? (
        <div className="empty">Belum ada komentar. Jadilah yang pertama berkomentar!</div>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="comment-item">
            <div className="comment-head">
              <span className="comment-avatar">{(c.user_name || 'A')[0].toUpperCase()}</span>
              <div>
                <div className="comment-name">{c.user_name}</div>
                <div className="comment-time">
                  {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            <p className="comment-text">{c.comment_text}</p>
          </div>
        ))
      )}
    </div>
  )
}
