'use client'

import { useRef, useState } from 'react'
import { getSupabase } from '../lib/supabase/client'

export default function RichTextEditor({ value, onChange }) {
  const areaRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')

  function wrap(before, after = '') {
    const el = areaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const sel = value.slice(start, end) || 'Teks di sini'
    onChange(value.slice(0, start) + before + sel + after + value.slice(end))
    setTimeout(() => {
      el.focus()
      const pos = start + before.length + sel.length + after.length
      el.setSelectionRange(start + before.length, pos)
    }, 0)
  }

  function insertAtCursor(text) {
    const el = areaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    onChange(value.slice(0, start) + text + value.slice(end))
    setTimeout(() => {
      el.focus()
      const pos = start + text.length
      el.setSelectionRange(pos, pos)
    }, 0)
  }

  async function uploadImage(file) {
    if (!file) return
    setUploading(true)
    setUploadMsg('')
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const supabase = getSupabase()
    const key = `editor/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await supabase.storage.from('media').upload(key, file, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600'
    })
    if (error) {
      setUploadMsg('Gagal unggah: ' + error.message)
      setUploading(false)
      return
    }
    const { data } = supabase.storage.from('media').getPublicUrl(key)
    insertAtCursor(`\n<img src="${data.publicUrl}" alt="${file.name.replace(/\.[^.]+$/, '')}" />\n`)
    setUploadMsg('Gambar berhasil disisipkan.')
    setUploading(false)
  }

  const tools = [
    { label: 'H2', title: 'Sub Judul', action: () => wrap('## ') },
    { label: 'B', title: 'Tebal', action: () => wrap('**', '**') },
    { label: 'I', title: 'Miring', action: () => wrap('_', '_') },
    { label: '❞', title: 'Kutipan', action: () => wrap('> ') },
    { label: '•', title: 'Daftar', action: () => wrap('- ') },
    { label: '🔗', title: 'Tautan', action: () => wrap('[', '](https://)') }
  ]

  return (
    <div className="rte">
      <div className="rte-toolbar">
        {tools.map((t) => (
          <button key={t.title} type="button" className="rte-btn" title={t.title} onClick={t.action}>
            {t.label}
          </button>
        ))}
        <label className="rte-btn" title="Unggah gambar (browser → Supabase; untuk R2 gunakan npm run upload)" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
          🖼️
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            disabled={uploading}
            onChange={(e) => uploadImage(e.target.files[0])}
          />
        </label>
      </div>
      <textarea
        ref={areaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'# Sub Judul\n\nParagraf pertama...\n\n## Sub Judul 2\n\nTulis konten artikel di sini. Mendukung HTML dan Markdown.'}
        required
      />
      <div className="hint">
        {uploading ? 'Mengunggah gambar...' : uploadMsg || 'Gunakan tombol di atas untuk memformat. Klik 🖼️ untuk menyisipkan gambar (Supabase Storage). Untuk R2, gunakan npm run upload.'}
      </div>
    </div>
  )
}
