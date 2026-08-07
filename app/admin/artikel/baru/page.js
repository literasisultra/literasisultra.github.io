'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../../../../lib/supabase/client'
import { slugify } from '../../../../lib/format'

export default function AdminArtikelBaru() {
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category_id: '',
    featured_image_url: '',
    is_published: true,
    meta_title: '',
    meta_description: '',
    og_image_url: ''
  })

  useEffect(() => {
    const supabase = getSupabase()
    supabase.from('categories').select('id, name').order('name').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function onTitleChange(value) {
    setForm((f) => ({
      ...f,
      title: value,
      slug: slugify(value),
      meta_title: f.meta_title || value.slice(0, 60)
    }))
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const supabase = getSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt,
      content: form.content,
      category_id: form.category_id || null,
      featured_image_url: form.featured_image_url || null,
      og_image_url: form.og_image_url || null,
      is_published: form.is_published,
      author_id: user?.id || null,
      meta_title: form.meta_title || form.title.slice(0, 60),
      meta_description: form.meta_description || form.excerpt,
      published_at: form.is_published ? new Date().toISOString() : null
    }

    const { error } = await supabase.from('articles').insert(payload)
    setSaving(false)
    if (error) {
      if (error.code === '23505') {
        setMsg('Slug sudah dipakai. Ubah judul atau slug secara manual.')
      } else {
        setMsg('Gagal menyimpan: ' + error.message)
      }
    } else {
      setMsg('Berhasil disimpan!')
      setTimeout(() => router.push('/admin/artikel/'), 1200)
    }
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Tulis Artikel</h1>
          <p className="sub">Buat artikel berita baru</p>
        </div>
        <button className="btn-outline" onClick={() => router.push('/admin/artikel/')}>← Kembali</button>
      </div>

      {msg && <div className={`${msg.includes('Gagal') ? 'auth-error' : 'auth-success'}`} style={{ marginBottom: 16 }}>{msg}</div>}

      <form onSubmit={save}>
        <div className="form-card">
          <h3>Konten Utama</h3>
          <div className="field">
            <label>Judul Artikel *</label>
            <input value={form.title} onChange={(e) => onTitleChange(e.target.value)} required />
          </div>
          <div className="field-row">
            <div className="field">
              <label>URL Slug</label>
              <input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} placeholder="judul-artikel" />
              <div className="hint">Otomatis dari judul. Format: huruf kecil dengan strip.</div>
            </div>
            <div className="field">
              <label>Kategori *</label>
              <select value={form.category_id} onChange={(e) => set('category_id', e.target.value)} required>
                <option value="">Pilih kategori...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>Ringkasan (Excerpt)</label>
            <textarea
              style={{ minHeight: 80 }}
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
              placeholder="Ringkasan singkat artikel yang tampil di daftar berita..."
            />
          </div>
          <div className="field">
            <label>Isi Artikel (Markdown / HTML)</label>
            <textarea
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder={'# Sub Judul\n\nParagraf pertama...\n\n## Sub Judul 2\n\nTulis konten artikel di sini. Mendukung HTML dan Markdown.'}
              required
            />
            <div className="hint">Mendukung HTML & Markdown. Gambar pakai &lt;img src="URL"&gt;.</div>
          </div>
        </div>

        <div className="form-card">
          <h3>Gambar</h3>
          <div className="field">
            <label>URL Gambar Utama (Featured Image)</label>
            <input value={form.featured_image_url} onChange={(e) => set('featured_image_url', e.target.value)} placeholder="https://..." />
          </div>
          <div className="field">
            <label>URL OpenGraph Image (untuk sharing)</label>
            <input value={form.og_image_url} onChange={(e) => set('og_image_url', e.target.value)} placeholder="https://..." />
          </div>
          {form.featured_image_url && (
            <img src={form.featured_image_url} alt="Preview" style={{ borderRadius: 8, maxHeight: 220, objectFit: 'cover', width: '100%' }} />
          )}
        </div>

        <div className="form-card">
          <h3>SEO</h3>
          <div className="field">
            <label>Meta Title</label>
            <input value={form.meta_title} onChange={(e) => set('meta_title', e.target.value)} maxLength={60} />
            <div className="hint">{form.meta_title.length}/60 karakter</div>
          </div>
          <div className="field">
            <label>Meta Description</label>
            <textarea
              style={{ minHeight: 70 }}
              value={form.meta_description}
              onChange={(e) => set('meta_description', e.target.value)}
              maxLength={160}
            />
            <div className="hint">{form.meta_description.length}/160 karakter</div>
          </div>
        </div>

        <div className="form-card">
          <h3>Publikasi</h3>
          <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => set('is_published', e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            <label style={{ marginBottom: 0 }}>Publikasikan langsung</label>
          </div>
          <button className="btn-red" type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Artikel'}
          </button>
        </div>
      </form>
    </>
  )
}
