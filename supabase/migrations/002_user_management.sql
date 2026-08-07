-- ============================================
-- LITERASISULTRA - Migrasi: Manajemen Pengguna
-- Jalankan di: Supabase Dashboard > SQL Editor
-- ============================================

-- Admin (super_admin) dapat mengubah data pengguna lain (peran, nama, avatar)
drop policy if exists "users: ubah oleh admin" on public.users;
create policy "users: ubah oleh admin" on public.users
  for update using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Hanya super_admin yang boleh mengubah peran pengguna (keamanan: editor tidak menaikkan sendiri)
drop policy if exists "users: super admin ubah role" on public.users;
create policy "users: super admin ubah role" on public.users
  for update using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'super_admin'
    )
  ) with check (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Daftarkan admin baru agar tabel users bisa dibaca admin (sudah ada),
-- tambahkan izin hapus hanya untuk super_admin
drop policy if exists "users: hapus oleh super admin" on public.users;
create policy "users: hapus oleh super admin" on public.users
  for delete using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'super_admin'
    )
  );
