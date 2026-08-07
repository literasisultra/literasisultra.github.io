-- ============================================
-- LITERASISULTRA - Schema Database (PRD v1.0.0)
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================

-- ============================================
-- TABEL PROFIL (menggantikan users, terhubung ke auth.users)
-- ============================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null default '',
  role text not null default 'writer' check (role in ('super_admin', 'editor', 'writer')),
  avatar_url text,
  created_at timestamptz default now()
);

-- ============================================
-- TABEL CATEGORIES
-- ============================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  color_code text default '#DC2626',
  created_at timestamptz default now()
);

-- ============================================
-- TABEL ARTICLES
-- ============================================
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  content text not null default '',
  excerpt text,
  featured_image_url text,
  author_id uuid references public.users(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  views_count integer default 0,
  is_published boolean default false,
  published_at timestamptz,
  meta_title text,
  meta_description text,
  og_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TABEL COMMENTS
-- ============================================
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.articles(id) on delete cascade,
  user_name text,
  user_email text,
  comment_text text not null,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- TABEL MEDIA
-- ============================================
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_url text not null,
  storage_provider text default 'supabase',
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz default now()
);

-- ============================================
-- TRIGGER: auto-buat profil users saat sign up
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.comments enable row level security;
alter table public.media enable row level security;

-- Helper: cek role user
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('super_admin', 'editor')
  );
$$ language sql stable security definer;

-- === USERS ===
create policy "users: baca sendiri" on public.users
  for select using (auth.uid() = id);
create policy "users: baca oleh admin" on public.users
  for select using (public.is_admin());
create policy "users: ubah sendiri" on public.users
  for update using (auth.uid() = id);

-- === CATEGORIES ===
create policy "categories: baca publik" on public.categories
  for select using (true);
create policy "categories: tulis admin" on public.categories
  for all using (public.is_admin());

-- === ARTICLES ===
create policy "articles: baca publik (published)" on public.articles
  for select using (is_published = true);
create policy "articles: baca oleh staff" on public.articles
  for select using (public.is_admin());
create policy "articles: tulis staff" on public.articles
  for insert with check (public.is_admin() and auth.uid() = author_id);
create policy "articles: ubah staff" on public.articles
  for update using (public.is_admin());

-- === COMMENTS ===
create policy "comments: baca publik (approved)" on public.comments
  for select using (is_approved = true);
create policy "comments: baca admin" on public.comments
  for select using (public.is_admin());
create policy "comments: tulis publik" on public.comments
  for insert with check (true);

-- === MEDIA ===
create policy "media: baca publik" on public.media
  for select using (true);
create policy "media: tulis staff" on public.media
  for insert with check (public.is_admin() and auth.uid() = uploaded_by);

-- ============================================
-- DATA AWAL: KATEGORI
-- ============================================
insert into public.categories (name, slug, description, color_code) values
  ('Politik', 'politik', 'Berita seputar politik nasional dan daerah.', '#DC2626'),
  ('Sultra', 'sultra', 'Kabar terbaru dari Sulawesi Tenggara.', '#B91C1C'),
  ('Edukasi', 'edukasi', 'Artikel edukatif dan dunia pendidikan.', '#111827'),
  ('Ekonomi', 'ekonomi', 'Perkembangan ekonomi dan bisnis.', '#DC2626'),
  ('Kesehatan', 'kesehatan', 'Tips dan berita kesehatan.', '#111827')
on conflict (slug) do nothing;
