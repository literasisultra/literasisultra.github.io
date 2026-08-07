'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '../../../lib/supabase/client'
import { formatDateTime } from '../../../lib/format'

const ROLES = [
  { key: 'super_admin', label: 'Super Admin' },
  { key: 'editor', label: 'Editor' },
  { key: 'writer', label: 'Writer' }
]

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const supabase = getSupabase()
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role, avatar_url, created_at')
        .order('created_at', { ascending: false })
      if (!error) setUsers(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function updateRole(id, role) {
    if (!confirm('Ubah peran pengguna ini?')) return
    setBusy(id)
    const supabase = getSupabase()
    const { error } = await supabase.from('users').update({ role }).eq('id', id)
    setBusy(null)
    if (error) {
      setMsg('Gagal mengubah peran: ' + error.message)
    } else {
      setUsers(users.map((u) => (u.id === id ? { ...u, role } : u)))
      setMsg('Peran diperbarui.')
    }
  }

  async function remove(id, email) {
    if (!confirm(`Hapus pengguna ${email}? Aksi ini permanen.`)) return
    setBusy(id)
    const supabase = getSupabase()
    const { error } = await supabase.from('users').delete().eq('id', id)
    setBusy(null)
    if (error) {
      setMsg('Gagal menghapus: ' + error.message)
    } else {
      setUsers(users.filter((u) => u.id !== id))
      setMsg('Pengguna dihapus.')
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Memuat pengguna...
      </div>
    )
  }

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Manajemen Pengguna</h1>
          <p className="sub">{users.length} pengguna terdaftar</p>
        </div>
      </div>

      {msg && <div className="auth-success" style={{ marginBottom: 16 }}>{msg}</div>}

      <table className="table">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Peran</th>
            <th>Terdaftar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isSelf = u.id === currentUser?.id
            const isSuper = users.find((x) => x.id === currentUser?.id)?.role === 'super_admin'
            return (
              <tr key={u.id}>
                <td style={{ fontWeight: 700 }}>
                  {u.name || '-'}
                  {isSelf && <span className="tag tag-badge" style={{ marginLeft: 8 }}>Anda</span>}
                </td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    disabled={isSelf || busy === u.id}
                    onChange={(e) => updateRole(u.id, e.target.value)}
                    style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--gray-300)' }}
                  >
                    {ROLES.map((r) => (
                      <option key={r.key} value={r.key}>{r.label}</option>
                    ))}
                  </select>
                </td>
                <td>{formatDateTime(u.created_at)}</td>
                <td>
                  {!isSelf && isSuper && (
                    <button
                      className="btn-red"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'transparent' }}
                      disabled={busy === u.id}
                      onClick={() => remove(u.id, u.email)}
                    >
                      Hapus
                    </button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
