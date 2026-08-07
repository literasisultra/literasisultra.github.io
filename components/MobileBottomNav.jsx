'use client'

import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Beranda', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
  { href: '/kategori/sultra/', label: 'Sultra', icon: 'M9 20l-5.4-5.4a4 4 0 0 1 0-5.7l6.5-6.5a4 4 0 0 1 5.7 0l6.5 6.5a4 4 0 0 1 0 5.7L15 20M4 20h16' },
  { href: '/kategori/edukasi/', label: 'Edukasi', icon: 'M12 3 2 8l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { href: '/admin', label: 'Login', icon: 'M12 3a6 6 0 0 1 3 11.2V17h-6v-2.8A6 6 0 0 1 12 3zm-4 13h8M12 21v-4' }
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="mobile-bottom-nav">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          className={`mbn-item ${pathname === l.href || (l.href !== '/' && pathname.includes(l.href)) ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={l.icon} />
          </svg>
          {l.label}
        </a>
      ))}
    </nav>
  )
}
