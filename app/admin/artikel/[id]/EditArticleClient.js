'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../../../../lib/supabase/client'
import { slugify } from '../../../../lib/format'

export default function EditArticleClient({ id }) {
  const router = useRouter()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

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
    supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) {
          setForm({
            title: data.title || '',
            slug: data.slug || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            category_id: data.category_id || '',
            featured_image_url: data.featured_image_url || '',
            is_published: data.is_published,
            meta_title: data.meta_title || '',
            meta_description: data.meta_description || '',
            og_image_url: data.og_image_url || ''
          })
        }
        setLoading(false)
      })
  }, [id])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    const supabase = getSupabase()
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt,
      content: form.content,
      category_id: form.category_id || null,
      featured_image_url: form.featured_image_url || null,
      og_image_url: form.og_image_url || null,
      is_published: form.is_published,
      meta_title: form.meta_title || form.title.slice(0, 60),
      meta_description: form.meta_description || form.excerpt,
      updated_at: new Date().toISOString()
    }
    const { error } = await supabase.from('articles').update(payload).eq('id', id)
    setSaving(false)
    if (error) {
      setMsg('Gagal menyimpan: ' + error.message)
    } else {
      setMsg('Perubahan disimpan!')
      setTimeout(() => router.push('/admin/artikel/'), 1200)
    }
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
          <h1>Edit Artikel</h1>
          <p className="sub">Perbarui konten artikel</p>
        </div>
        <button className="btn-outline" onClick={() => router.push('/admin/artikel/')}>← Kembali</button>
      </div>

      {msg && <div className={`${msg.includes('Gagal') ? 'auth-error' : 'auth-success'}`} style={{ marginBottom: 16 }}>{msg}</div>}

      <form onSubmit={save}>
        <div className="form-card">
          <h3>Konten Utama</h3>
          <div className="field">
            <label>Judul Artikel *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="field-row">
            <div className="field">
              <label>URL Slug</label>
              <input value={form.slug} onChange={(e) => set('slug', slugify(e.target.value))} />
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
            <textarea style={{ minHeight: 80 }} value={form.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
          </div>
          <div className="field">
            <label>Isi Artikel</label>
            <textarea value={form.content} onChange={(e) => set('content', e.target.value)} required />
          </div>
        </div>

        <div className="form-card">
          <h3>Gambar</h3>
          <div className="field">
            <label>URL Gambar Utama</label>
            <input value={form.featured_image_url} onChange={(e) => set('featured_image_url', e.target.value)} placeholder="https://..." />
          </div>
          <div className="field">
            <label>URL OpenGraph Image</label>
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
          </div>
          <div className="field">
            <label>Meta Description</label>
            <textarea style={{ minHeight: 70 }} value={form.meta_description} onChange={(e) => set('meta_description', e.target.value)} maxLength={160} />
          </div>
        </div>

        <div className="form-card">
          <h3>Publikasi</h3>
          <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" checked={form.is_published} onChange={(e) => set('is_published', e.target.checked)} style={{ width: 18, height: 18 }} />
            <label style={{ marginBottom: 0 }}>Published</label>
          </div>
          <button className="btn-red" type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </>
  )
}
