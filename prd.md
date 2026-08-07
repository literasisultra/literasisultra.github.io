# Product Requirement Document (PRD): Literasisultra

**Nama Proyek:** Literasisultra - Platform Berita Digital Profesional  
**Versi:** 1.0.0  
**Status:** Approved for Development  

---

## 1. Eksekutif Ringkasan (Executive Summary)
Literasisultra adalah platform media berita digital modern, profesional, dan berkinerja tinggi yang dirancang khusus untuk menyajikan informasi, berita, dan artikel edukatif secara responsif dan interaktif. Platform ini mengusung identitas visual yang tegas dengan kombinasi warna utama **Merah, Putih, dan Hitam**, serta didukung oleh infrastruktur teknologi berbasis cloud modern (**GitHub Pages, Supabase, dan Cloudflare**) untuk memastikan efisiensi biaya, keamanan tinggi, serta kecepatan akses maksimal di seluruh perangkat.

---

## 2. Identitas Visual & Branding
Skema warna dipilih secara cermat untuk memberikan kesan tegas, berani, bersih, dan profesional khas media jurnalistik modern.

| Elemen | Kode Warna (Hex) | Penggunaan Utama |
|---|---|---|
| **Merah (Primary Accent)** | `#DC2626` / `#B91C1C` | Tombol CTA, Badge Breaking News, Highlight, Hover State, Header Accent |
| **Putih (Background/Text)** | `#FFFFFF` / `#F9FAFB` | Background Utama (Light Mode), Teks Kontras pada Elemen Gelap, Card Background |
| **Hitam & Neutral Dark** | `#111827` / `#000000` | Typography Utama, Top Navbar, Footer, Background Utama (Dark Mode Accent) |

---

## 3. Arsitektur Teknologi (Tech Stack)
Literasisultra memanfaatkan kombinasi stack modern yang ringan, scalable, dan hemat biaya dengan pemanfaatan hosting gratis GitHub Pages.

| Komponen | Teknologi | Peran & Alasan Pemilihan |
|---|---|---|
| **Frontend Framework** | Next.js / Astro (SSG + Hydration) | Menghasilkan HTML statis untuk di-host di GitHub Pages dengan kecepatan muat sub-detik serta SEO optimal. |
| **Database & Auth** | Supabase (PostgreSQL) | Penyimpanan data relational (artikel, kategori, penulis, komentar) dengan fitur Row Level Security (RLS) dan Auth internal. |
| **Storage & CDN** | Cloudflare R2 & Cloudflare Images / CDN | Penyimpanan media gambar/asset berukuran besar secara terdistribusi dengan proteksi DDoS dan caching global gratis. |
| **Hosting & CI/CD** | GitHub Pages + GitHub Actions | Hosting gratis tanpa batas trafik menggunakan domain custom / `.github.io` dengan otomatisasi deployment saat push ke branch `main`. |

---

## 4. Fitur Utama Platform

### 4.1. Tampilan Pengunjung (Public Frontend)
- **Header & Navigation Bar Modern:** Dilengkapi logo Literasisultra, mega menu kategori berita, tanggal real-time, pencarian cepat, serta toggle Dark/Light mode.
- **Breaking News Ticker:** Banner teks berjalan di bagian atas untuk menyiarkan berita terkini secara kilat dengan aksen warna merah.
- **Hero Section Interactive:** Grid layout berita utama (Trending Stories) dengan gambar resolusi tinggi, tag kategori, dan estimasi waktu baca.
- **Responsivitas Penuh (Mobile, Tablet, Desktop):**
  - **Mobile:** Mobile bottom navigation bar / drawer slide-out menu yang sangat smooth.
  - **Desktop:** Grid multi-kolom dengan sidebar berita populer dan widget cuaca/saham.
- **Desain Tombol & Komponen UI Modern:** Tombol interaktif dengan efek micro-interaction (glassmorphism hover, ripple effect, shadow elevation, dan aksen garis merah-hitam).
- **Halaman Detail Artikel:**
  - Judul besar, metadata penulis, tanggal rilis, dan jumlah pembaca.
  - Penyimpanan gambar cepat via Cloudflare CDN dengan efek lazy-loading.
  - Fitur Bagikan ke Media Sosial (WhatsApp, Facebook, Twitter, Link Copy).
  - Sistem Komentar Terintegrasi via Supabase real-time.
  - Rekomendasi Artikel Terkait (Related Articles).

### 4.2. Dashboard Admin & Management System (CMS)
Dashboard super lengkap yang dapat diakses oleh Admin dan Penulis untuk mengelola konten media secara profesional.

- **Statistik & Analitik Real-time:** Grafik total pembaca, artikel terpopuler, statistik harian, dan jumlah komentar aktif.
- **Rich Text & Markdown Editor:**
  - Fitur unggah gambar langsung terhubung ke Cloudflare R2 secara otomatis.
  - Pengaturan SEO on-page: Meta Title, Meta Description, URL Slug, dan OpenGraph Image.
  - Penjadwalan Publikasi Artikel (Publish Later).
- **Manajemen Kategori & Tag:** Kemudahan membuat, merubah, dan mengelompokkan topik berita.
- **Manajemen Media (Cloudflare Library):** Galeri terpusat untuk mengelola seluruh gambar dan dokumen dengan filter berdasarkan tanggal dan ukuran.
- **Manajemen Pengguna & Peran (Role-Based Auth):** Peran terpisah untuk Super Admin, Editor, dan Writer (Penulis) menggunakan Supabase Auth.

---

## 5. Struktur Data Database (Supabase PostgreSQL Schema)

| Nama Tabel | Kolom Utama | Deskripsi |
|---|---|---|
| **users** | `id`, `email`, `name`, `role`, `avatar_url`, `created_at` | Menyimpan data pengguna dan hak akses admin/penulis. |
| **categories** | `id`, `name`, `slug`, `description`, `color_code` | Menyimpan kategori berita (misal: Politik, Sultra, Edukasi). |
| **articles** | `id`, `title`, `slug`, `content`, `excerpt`, `featured_image_url`, `author_id`, `category_id`, `views_count`, `is_published`, `published_at` | Tabel utama penampung konten berita Literasisultra. |
| **comments** | `id`, `article_id`, `user_name`, `comment_text`, `is_approved`, `created_at` | Menampung komentar dari pembaca berita. |
| **media** | `id`, `file_name`, `file_url`, `storage_provider`, `uploaded_by` | Pencatatan meta file gambar yang diunggah ke Cloudflare R2. |

---

## 6. Persyaratan Non-Fungsional (Non-Functional Requirements)
- **Performa:** Skor Google PageSpeed Insights minimal 90+ untuk mobile dan desktop. Page load time di bawah 1.5 detik.
- **Keamanan:** Implementasi SSL gratis dari Cloudflare & GitHub Pages, pelindungan HTTPS, serta penerapan Row Level Security (RLS) di Supabase.
- **Skalabilitas:** Sanggup menangani ribuan pengakses bersamaan berkat arsitektur Statis (SSG) di CDN Cloudflare/GitHub.
- **Aksesibilitas & SEO:** Memenuhi standar WCAG 2.1 AA, sitemap XML otomatis, serta struktur JSON-LD Schema NewsArticle untuk Google News indexing.

---

## 7. Panduan Pelaksanaan & Deployment Workflow
1. **Tahap 1: Setup Supabase** — Buat project baru di Supabase, jalankan script SQL Schema, dan dapatkan API URL & Anon Key.
2. **Tahap 2: Setup Cloudflare R2** — Buat bucket penyimpanan untuk asset media dan hubungkan kredensial S3 API ke sistem.
3. **Tahap 3: Pengembangan Frontend** — Bangun komponen UI sesuai rancangan skema Merah-Putih-Hitam dengan tombol modern dan tata letak responsif.
4. **Tahap 4: Setup GitHub Repository & Actions** — Push kode ke repository GitHub dan aktifkan GitHub Actions workflow untuk mengotomatisasi deployment ke GitHub Pages.
5. **Tahap 5: Peluncuran** — Hubungkan domain khusus (jika ada) atau gunakan subdomain `.github.io` yang dapat diakses publik.
