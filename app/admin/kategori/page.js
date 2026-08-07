'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '../../../lib/supabase/client'
import { slugify } from '../../../lib/format'

export default function AdminKategori() {
  const [categories, setCategories] = useState([])
  const [name, setName] = useState('')
  const [color, setColor] = useState('#DC2626')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const supabase = getSupabase()
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
  }

  async function add(e) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setMsg('')
    const supabase = getSupabase()
    const { error } = await supabase.from('categories').insert({
      name: name.trim(),
      slug: slugify(name),
      color_code: color
    })
    setSaving(false)
    if (error) {
      setMsg('Gagal: ' + error.message)
    } else {
      setName('')
      setMsg('Kategori berhasil ditambahkan.')
      load()
    }
  }

  async function remove(id) {
    if (!confirm('Hapus kategori ini? Artikel pada kategori akan menjadi tanpa kategori.')) return
    const supabase = getSupabase()
    await supabase.from('categories').delete().eq('id', id)
    load()
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Manajemen Kategori</h1>
          <p className="sub">{categories.length} kategori</p>
        </div>
      </div>

      {msg && <div className="auth-success" style={{ marginBottom: 16 }}>{msg}</div>}

      <div className="form-card">
        <h3>Tambah Kategori</h3>
        <form onSubmit={add}>
          <div className="field-row">
            <div className="field">
              <label>Nama Kategori *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mis. Olahraga" required />
            </div>
            <div className="field">
              <label>Warna Aksen</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 50, height: 42, border: 'none', background: 'transparent' }} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{color}</span>
              </div>
            </div>
          </div>
          <button className="btn-red" type="submit" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Tambah Kategori'}
          </button>
        </form>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Slug</th>
            <th>Warna</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id}>
              <td style={{ fontWeight: 700 }}>{c.name}</td>
              <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{c.slug}</td>
              <td>
                <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 4, background: c.color_code, marginRight: 8, verticalAlign: 'middle' }} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{c.color_code}</span>
              </td>
              <td>
                <button className="btn-red" style={{ padding: '6px 14px', fontSize: '0.8rem' }} onClick={() => remove(c.id)}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
