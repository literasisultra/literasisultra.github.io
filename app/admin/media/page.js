'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabase } from '../../../lib/supabase/client'
import { formatDateTime } from '../../../lib/format'

export default function AdminMedia() {
  const [media, setMedia] = useState([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const supabase = getSupabase()
    const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false }).limit(50)
    if (data) setMedia(data)
  }

  async function upload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setMsg('')
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMsg('Anda harus login.')
      setUploading(false)
      return
    }

    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { error: upError } = await supabase.storage
      .from('media')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (upError) {
      setMsg('Upload gagal: ' + upError.message)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
    const fileUrl = urlData.publicUrl

    const { error: dbError } = await supabase.from('media').insert({
      file_name: file.name,
      file_url: fileUrl,
      storage_provider: 'supabase',
      uploaded_by: user.id
    })

    setUploading(false)
    if (dbError) {
      setMsg('Metadata gagal disimpan: ' + dbError.message)
    } else {
      setMsg('Upload berhasil! URL: ' + fileUrl)
      load()
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function copyUrl(url) {
    if (navigator.clipboard) navigator.clipboard.writeText(url)
    alert('URL disalin: ' + url)
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Manajemen Media</h1>
          <p className="sub">Upload dan kelola gambar</p>
        </div>
      </div>

      <div className="form-card">
        <h3>Upload Gambar</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={upload}
            disabled={uploading}
            style={{ fontSize: '0.9rem' }}
          />
          {uploading && <span style={{ color: 'var(--red)', fontWeight: 700 }}>Mengupload...</span>}
        </div>
        {msg && <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--gray-600)', wordBreak: 'break-all' }}>{msg}</div>}
      </div>

      {media.length === 0 ? (
        <div className="empty">Belum ada media. Upload gambar untuk mulai.</div>
      ) : (
        <div className="media-grid">
          {media.map((m) => (
            <div key={m.id} className="media-item">
              <img src={m.file_url} alt={m.file_name} loading="lazy" />
              <div className="meta">
                <div style={{ fontWeight: 700, color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.file_name}
                </div>
                <div style={{ marginTop: 4 }}>{formatDateTime(m.created_at)}</div>
                <button className="btn-outline" style={{ marginTop: 10, padding: '6px 12px', fontSize: '0.8rem', width: '100%' }} onClick={() => copyUrl(m.file_url)}>
                  Salin URL
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
