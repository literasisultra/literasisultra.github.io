'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getSupabase } from '../lib/supabase/client'
import SearchOverlay from './SearchOverlay'

export default function Header() {
  const pathname = usePathname()
  const [categories, setCategories] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('ls-theme')
    if (saved === 'dark') setDark(true)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('ls-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    const supabase = getSupabase()
    supabase
      .from('categories')
      .select('name, slug')
      .order('name')
      .then(({ data }) => {
        if (data) setCategories(data)
      })
  }, [])

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <button className="menu-btn" onClick={() => setMenuOpen(true)} aria-label="Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>

          <Link href="/" className="logo">
            <span className="logo-mark">L</span>
            Literasi<span style={{ color: 'var(--red)' }}>Sultra</span>
          </Link>

          <nav className="nav-links">
            <Link href="/" className={pathname === '/' ? 'active' : ''}>Beranda</Link>
            {categories.slice(0, 5).map((c) => (
              <Link
                key={c.slug}
                href={`/kategori/${c.slug}/`}
                className={pathname.includes(c.slug) ? 'active' : ''}
              >
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="nav-actions">
            <button className="theme-btn" onClick={() => setDark(!dark)} aria-label="Tema">
              {dark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
                </svg>
              )}
            </button>
            <button className="search-btn" onClick={() => setSearchOpen(true)} aria-label="Cari">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <Link href="/admin" className="admin-btn">Login</Link>
          </div>
        </div>
        <div className="nav-inner" style={{ paddingTop: 0, paddingBottom: 10 }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--gray-500)', fontWeight: 600 }}>
            {today} &nbsp;•&nbsp; Sulawesi Tenggara
          </span>
        </div>
      </header>

      {menuOpen && (
        <div className="drawer-overlay" onClick={() => setMenuOpen(false)}>
          <div className={`drawer ${menuOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="logo" style={{ fontSize: '1.1rem' }}>
                <span className="logo-mark" style={{ width: 30, height: 30, fontSize: '0.85rem' }}>L</span>
                LiterasiSultra
              </span>
              <button className="theme-btn" onClick={() => setMenuOpen(false)} aria-label="Tutup">
                ✕
              </button>
            </div>
            <Link href="/" onClick={() => setMenuOpen(false)}>Beranda</Link>
            {categories.map((c) => (
              <Link key={c.slug} href={`/kategori/${c.slug}/`} onClick={() => setMenuOpen(false)}>
                {c.name}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setMenuOpen(false)} style={{ color: 'var(--red)', fontWeight: 800 }}>
              Login Admin
            </Link>
          </div>
        </div>
      )}

      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}
