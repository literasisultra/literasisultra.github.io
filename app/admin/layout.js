'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { getSupabase } from '../../lib/supabase/client'

export default function AdminLayout({ children }) {
  const [session, setSession] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabase()
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        const { data: user } = await supabase
          .from('users')
          .select('role, name')
          .eq('id', data.session.user.id)
          .maybeSingle()
        setSession(data.session)
        setRole(user?.role || null)
      }
      setLoading(false)
    })
  }, [])

  async function logout() {
    const supabase = getSupabase()
    await supabase.auth.signOut()
    router.push('/admin/')
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        Memuat dashboard...
      </div>
    )
  }

  if (!session || !role) {
    return (
      <div className="auth-wrap">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <h1>
            <span className="logo-mark">L</span> Akses Ditolak
          </h1>
          <p>Anda harus login terlebih dahulu.</p>
          <button className="btn-red" onClick={() => router.push('/admin/')}>Ke Halaman Login</button>
        </div>
      </div>
    )
  }

  const links = [
    { href: '/admin/dashboard/', label: 'Dashboard', icon: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z' },
    { href: '/admin/artikel/', label: 'Artikel', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 2v6h6M8 13h8M8 17h5' },
    { href: '/admin/kategori/', label: 'Kategori', icon: 'M4 6h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm10 0h6m-6 4h6M4 16h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1zm10 0h6m-6 4h6' },
    { href: '/admin/media/', label: 'Media', icon: 'M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm3 4h.01M4 15l4-4 3 3 4-4 5 5' }
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="logo">
          <span className="logo-mark">L</span> LiterasiSultra
        </div>
        {links.map((l) => (
          <button
            key={l.href}
            className={`admin-link ${pathname === l.href ? 'active' : ''}`}
            onClick={() => router.push(l.href)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d={l.icon} />
            </svg>
            {l.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="admin-link" onClick={logout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Keluar
        </button>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}
