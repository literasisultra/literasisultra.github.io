# Literasisultra

**Platform Berita Digital Profesional** — berita, informasi, dan artikel edukatif untuk Sulawesi Tenggara dengan skema warna tegas Merah-Putih-Hitam.

## Fitur

### Situs Publik
- Header modern dengan navigasi kategori & pencarian cepat
- Breaking News ticker (real-time via Supabase)
- Hero section berita utama + artikel populer
- Halaman detail artikel: metadata, bagikan ke media sosial, komentar real-time
- Artikel terkait & rekomendasi
- Dark/Light mode & responsivitas penuh (mobile bottom nav)

### Dashboard Admin
- Login berbasis peran (Super Admin, Editor, Writer)
- Statistik & analitik (total artikel, komentar, artikel terpopuler)
- Editor artikel dengan SEO fields (meta title, description, slug, OpenGraph)
- Manajemen kategori & tag
- Manajemen media (upload gambar ke Supabase Storage)

## Teknologi

| Komponen | Teknologi |
|---|---|
| Frontend | Next.js 15 (Static Export) |
| Database & Auth | Supabase (PostgreSQL + RLS) |
| Storage Media | Supabase Storage |
| Hosting & CI/CD | GitHub Pages + GitHub Actions |
| CDN | GitHub Pages / Cloudflare |

## Struktur

```
├── app/                    # Next.js App Router
│   ├── page.js             # Beranda
│   ├── kategori/[slug]/    # Halaman kategori
│   ├── artikel/[slug]/     # Detail artikel
│   └── admin/              # Dashboard admin
├── components/             # Komponen UI
├── lib/                    # Helper & Supabase client
└── supabase/schema.sql     # Skema database & RLS
```

## Setup Lokal

```bash
npm install
# isi .env.local (lihat .env.example)
npm run dev
```

## Deployment

Push ke branch `main` → GitHub Actions otomatis build & deploy ke GitHub Pages.

Untuk menjalankan build manual:
```bash
npm run build   # hasil di folder ./out
```

## Kredensial Admin (contoh)

- Email: `admin.literasisultra@gmail.com`
- Password: `Admin2026!`
- Role: `super_admin`

> Ubah password segera setelah login pertama.

## Lisensi

© 2026 Literasisultra. Seluruh hak cipta dilindungi.
