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

## API
Semua endpoint wajib login (cookie sesi). Tanpa login → `401`.

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/debts?status=all\|unsettled\|settled&type=all\|owed_to_me\|i_owe` | List catatan milik user |
| POST | `/api/debts` | Buat catatan → `201` |
| PATCH | `/api/debts/[id]` | Update sebagian field; `{"settled": true}` untuk tandai lunas, `false` untuk batalkan |
| DELETE | `/api/debts/[id]` | Hapus → `204` |

Body POST: `type` (`owed_to_me` \| `i_owe`), `counterpart_name`, `amount` (integer rupiah > 0), `note?` (maks 200), `debt_date?` (`YYYY-MM-DD`, default hari ini), `due_date?`.

Format error: `{ "error": { "message": "...", "fields": { "amount": "..." } } }`

Status code: `400` parameter/JSON/ID salah · `401` belum login · `404` data tidak ada (atau bukan milikmu) · `422` validasi gagal · `500` error server.

## Keamanan data (RLS)
Tabel `debts` memakai `ENABLE` + `FORCE ROW LEVEL SECURITY`. Role `anon` dicabut semua aksesnya; role `authenticated` hanya lolos policy `auth.uid() = user_id` untuk SELECT/INSERT/UPDATE/DELETE. `user_id` di-default ke `auth.uid()` dan `WITH CHECK` mencegah insert/update atas nama orang lain.

**Tes kebocoran** (langsung ke Supabase REST API, tanpa lewat Next.js):
```bash
SUPABASE_URL=https://xxx.supabase.co ANON_KEY=eyJ... bash scripts/rls-leak-test.sh
```
Skrip membuat dua user uji, lalu memastikan user B tidak bisa membaca, mengubah, menghapus, atau insert atas nama user A, dan `anon` tidak bisa membaca sama sekali. Hapus user uji dari dashboard setelahnya.

## Deploy ke Vercel
1. Push repo ke GitHub, lalu **Import** di https://vercel.com/new
2. Tambahkan Environment Variables `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy
4. Di Supabase **Authentication → URL Configuration**, set **Site URL** ke domain Vercel kamu (dan tambahkan ke Redirect URLs)

## Catatan desain
- Form punya field **Tanggal** (default hari ini) → kolom `debt_date`. `due_date` (jatuh tempo) tetap ada sesuai skema dan opsional di form.
- `amount` bertipe `bigint` (rupiah utuh), dibatasi < Rp 1 triliun supaya aman sebagai angka JavaScript.
- Next.js 16: `middleware.ts` berganti nama menjadi `proxy.ts`, dan `params` di route handler berupa Promise.
