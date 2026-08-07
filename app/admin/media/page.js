'use client'

import { useEffect, useRef, useState } from 'react'
import { getSupabase } from '../../../lib/supabase/client'
import { formatDateTime } from '../../../lib/format'

export default function AdminMedia() {
  const [media, setMedia] = useState([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const fileRef = useRef(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const supabase = getSupabase()
    const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false }).limit(50)
    if (data) setMedia(data)
  }

  async function saveRecord(fileName, fileUrl, provider) {
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMsg('Anda harus login.')
      return false
    }
    const { error } = await supabase.from('media').insert({
      file_name: fileName,
      file_url: fileUrl,
      storage_provider: provider,
      uploaded_by: user.id
    })
    if (error) {
      setMsg('Metadata gagal disimpan: ' + error.message)
      return false
    }
    return true
  }

  // Alur R2: upload lewat script lokal (npm run upload), lalu tempel URL di sini
  async function addR2Url(e) {
    e.preventDefault()
    if (!urlInput.trim()) return
    const name = nameInput.trim() || urlInput.split('/').pop() || 'media'
    const ok = await saveRecord(name, urlInput.trim(), 'r2')
    if (ok) {
      setMsg('URL R2 berhasil dicatat. Siap dipakai di artikel.')
      setUrlInput('')
      setNameInput('')
      load()
    }
  }

  // Fallback: upload langsung ke Supabase Storage
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

    const ok = await saveRecord(file.name, fileUrl, 'supabase')
    setUploading(false)
    if (ok) {
      setMsg('Upload berhasil! URL: ' + fileUrl)
      load()
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function remove(id) {
    if (!confirm('Hapus catatan media ini?')) return
    const supabase = getSupabase()
    await supabase.from('media').delete().eq('id', id)
    load()
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
          <p className="sub">Kelola gambar & aset (Cloudflare R2)</p>
        </div>
      </div>

      {msg && <div className="auth-success" style={{ marginBottom: 16, wordBreak: 'break-all' }}>{msg}</div>}

      <div className="form-card">
        <h3>Upload ke Cloudflare R2 (5GB gratis)</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginBottom: 14 }}>
          Di komputer: jalankan <code style={{ background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>npm run upload -- nama-foto.jpg</code>,
          lalu tempel URL hasilnya di bawah.
        </p>
        <form onSubmit={addR2Url}>
          <div className="field-row">
            <div className="field">
              <label>URL R2</label>
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://pub-xxxx.r2.dev/1728xxxx-foto.jpg"
              />
            </div>
            <div className="field">
              <label>Nama File (opsional)</label>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="foto-berita.jpg"
              />
            </div>
          </div>
          <button className="btn-red" type="submit" disabled={!urlInput.trim()}>
            Catat Media R2
          </button>
        </form>
      </div>

      <div className="form-card">
        <h3>Upload Langsung (Supabase Storage - fallback)</h3>
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
      </div>

      {media.length === 0 ? (
        <div className="empty">Belum ada media. Upload atau catat URL R2 untuk mulai.</div>
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
                <span className={`tag ${m.storage_provider === 'r2' ? 'tag-badge' : 'tag-published'}`} style={{ marginTop: 6 }}>
                  {m.storage_provider === 'r2' ? 'R2' : 'Supabase'}
                </span>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', flex: 1 }} onClick={() => copyUrl(m.file_url)}>
                    Salin
                  </button>
                  <button className="btn-red" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => remove(m.id)}>
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
