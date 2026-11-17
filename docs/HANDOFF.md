# CrideviSPA — Handoff (status per 17 Nov 2026)

Baca file ini dulu di sesi/chat baru. Ringkas, lengkap, tanpa rahasia (kunci ada di `app/.env.local`, tidak di git).

## 1. Proyek
- Website home service massage **CrideviSPA**, Denpasar, Bali. Target: turis domestik & bule yang mencari spa terbaik dengan harga bersaing.
- Repo: github.com/BagusSedana/cridevispa · lokal: `E:\Project Claude\Website`
- Live: **https://www.cridevispa.com** (cridevispa.com → 308 ke www)

## 2. Arsitektur sekarang
- **Next.js 16** (App Router, TypeScript) di folder `app/` → Vercel project **`cridevispa-app`** (domain www terpasang di sini). Middleware Next 16 = `app/src/proxy.ts`.
- **Supabase** project `xvgngrmjfqqazeijmylx` (region Sydney). Tabel: `categories`, `treatments`, `treatment_prices`, `articles`, `bookings`, `admins`, `reviews` + RLS. Migrasi di `app/supabase/migrations/` (001–004 sudah dijalankan via SQL Editor).
- Kunci: `app/.env.local` (URL, publishable key, secret key) — git-ignored. Di Vercel `cridevispa-app`: 3 env yang sama + `REDIRECT_APP_HOST_TO_WWW=1` (Production).
- Admin: `/admin` (login Supabase Auth, akun admin = email developer; lupa password via `/admin/lupa-password`). Menu: Booking, Treatment & Harga, Artikel, Ulasan.
- Booking: form → `POST /api/bookings` (validasi server, harga dihitung ulang dari DB, jam 07:00–22:00 WITA) → lanjut WhatsApp 6285812429650.
- Halaman publik: `/`, `/treatments`, `/booking`, `/lokasi`, `/artikel`, `/artikel/[slug]`; bahasa via `?lang=en` (default Indonesia).
- Tes: `cd app && npm test` (±160 tes, Vitest). Build: `npm run build`. Node.js ada di `C:\Program Files\nodejs` (di Git Bash: `export PATH="/c/Program Files/nodejs:$PATH"`).

## 3. Progres rombak (4 tahap)
1. ✅ Perbaikan cepat keamanan & UI.
2. ✅ Backend Supabase + admin baru (spec/plan/ledger di `docs/superpowers/*2026-11-16*`).
3. ✅ Desain ulang publik + pindah domain (spec/plan/ledger di `docs/superpowers/*2026-11-17*`). **17 Nov: pemilik menolak gaya A "Gelap & Mewah"** → tampilan situs statis lama dipasang kembali di app Next.js (commit a83d002): CSS lama di `app/src/app/(site)/legacy.css`, perilaku JS lama di `components/site/LegacyEffects.tsx`; data tetap dari Supabase. Cabang `design-polish` (perbaikan gaya gelap) tidak dipakai. Lighthouse belum diukur ulang.
4. ⏳ **Berikutnya: poles** — kerjakan daftar "minor (deferred)" di kedua ledger, lalu cek kecepatan/gambar/SEO dan review keamanan akhir.

## 4. Keputusan pemilik (jangan dilanggar)
- **Tampilan = gaya situs lama** (krem terang, header terang, tombol bergaris). Jangan ganti ke desain baru tanpa persetujuan pemilik.
- **Harga tidak boleh diubah** dan tidak ditulis mati di kode (semua dari DB).
- **Tidak ada ulasan/rating palsu**, tidak ada `aggregateRating`. Ulasan hanya yang asli, diisi lewat admin; bagian ulasan tersembunyi jika kosong.
- **Tidak ada janji baru** (waktu balas, garansi, dll.) — hanya fakta yang sudah benar.
- Booking lewat WhatsApp (tercatat di DB); WhatsApp tidak boleh terblokir oleh error API.
- Kerja langsung push ke `main` (Vercel auto-deploy) setelah dicek lokal & live; perubahan besar boleh di cabang + preview dulu.
- Skill/MCP yang di-install disimpan sumbernya di `E:\Project Claude\skill-claude`, bukan di folder Website.

## 5. Tugas terbuka
- Sekitar **24 Nov 2026**: jika lancar, hapus Vercel project lama **`cridevispa`** (cadangan rollback) dan bersihkan file statis lama di root repo (`index.html`, `js/`, `css/`, `assets/`, `vercel.json`, dll.) — tanya pemilik dulu.
- Tahap 4 (lihat poin 3).
- Opsional: Google Business Profile untuk ulasan asli; tambah akun admin klien saat klien punya email (`insert into admins (user_id) values ('<uid>')`).

## 6. Cara melanjutkan di chat baru
Ketik misalnya: *"Baca `E:\Project Claude\Website\docs\HANDOFF.md`, lalu lanjut tahap 4."*
