'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '../../lib/supabase/client'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  async function login(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.user) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()
      if (user && ['super_admin', 'editor', 'writer'].includes(user.role)) {
        router.push('/admin/dashboard/')
        router.refresh()
      } else {
        setError('Akun Anda tidak memiliki izin akses dashboard.')
        setLoading(false)
      }
    }
  }

  async function register(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const supabase = getSupabase()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: email.split('@')[0] } }
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    if (data.session) {
      setSuccess('Akun berhasil dibuat. Anda dapat login. Namun akses dashboard dikontrol oleh admin.')
    } else {
      setSuccess('Akun dibuat! Silakan cek email untuk konfirmasi, lalu login.')
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>
          <span className="logo-mark">L</span>
          LiterasiSultra
        </h1>
        <p>Masuk ke dashboard admin</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={login}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn-red" style={{ width: '100%' }} type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button className="btn-outline" style={{ width: '100%' }} onClick={register} disabled={loading}>
            Buat Akun Baru
          </button>
        </div>
      </div>
    </div>
  )
}
