# Kasbon

Web app sederhana untuk mencatat utang piutang pribadi: siapa berutang ke kamu, dan kamu berutang ke siapa. Tandai lunas, lihat total dan net.

**Stack:** Next.js 16 (App Router) · Tailwind CSS v4 · Supabase (PostgreSQL + Auth) · lucide-react · Zod

**Demo:** _isi dengan link Vercel setelah deploy_

## Fitur
- Login / daftar dengan email + password (Supabase Auth), tombol keluar
- Semua halaman aplikasi dan API hanya untuk user yang login (`src/proxy.ts` + cek di tiap endpoint)
- Dashboard: Total dihutang ke saya, Total saya hutang, Net (hijau/merah). Hanya yang **belum lunas** dihitung
- Daftar catatan dengan filter status & tipe, tanggal relatif, tombol Tandai Lunas / Edit / Hapus
- Validasi di client **dan** server, pesan error berbahasa Indonesia
- Row Level Security: user hanya bisa akses baris miliknya sendiri

## Setup lokal

### 1. Buat project Supabase
1. Buat project gratis di https://supabase.com
2. **Authentication → Providers → Email**: untuk demo yang mudah, matikan **Confirm email**. Kalau dibiarkan aktif, user harus klik link di email dulu sebelum login.
3. **Project Settings → API**: salin **Project URL** dan **anon public key**.

### 2. Environment
```bash
cp .env.example .env.local
```
Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

- # Supabase → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://kvnafvfpuctytgnbbduw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_hencyJnRA94TSZkx8knGgg_xlsQrJ5q


> Hanya anon key yang dipakai. **Jangan** pernah memakai `service_role` key di app ini — key itu mem-bypass RLS.

### 3. Jalankan migration
Pilih salah satu:

**A. SQL Editor (paling cepat):** buka Supabase Dashboard → SQL Editor → tempel isi `supabase/migrations/20260101000000_create_debts.sql` → Run.

**B. Supabase CLI:**
```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

### 4. Jalankan
```bash
npm install
npm run dev   # http://localhost:3000
```

## Link Demo Vercel
kasbon-web-ap-qdf6.vercel.app

