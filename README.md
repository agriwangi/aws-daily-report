# AWS Daily Report — Versi Mandiri (REST) v2.1.0

Frontend statis (HTML/CSS/JS) untuk **AWS Daily Report**, PT. Agri Wangi Sentosa.
Versi ini terpisah dari Google Apps Script — backend (`Kode.gs`) berjalan sebagai
REST API (JSON), dan frontend ini bisa dihosting di mana saja (GitHub Pages,
Netlify, Vercel, Blogger, WordPress).

## Struktur folder

```
index.html        ← halaman utama (landing + login + app shell)
css/style.css      ← seluruh styling ("Estate Botanical Enterprise")
js/config.js        ← KONFIGURASI — isi GAS_URL di sini sebelum deploy
js/api.js           ← lapisan komunikasi REST (fetch, cache, retry)
js/app.js           ← router SPA + seluruh logika halaman
PANDUAN-INSTALASI-MANDIRI.md  ← panduan lengkap deploy ke GitHub Pages
```

## Langkah cepat

1. Deploy backend `Kode.gs` (dikirim terpisah, bukan di dalam paket ini) sebagai
   Web App di Google Apps Script. Salin URL `/exec` yang dihasilkan.
2. Buka `js/config.js`, ganti nilai `GAS_URL` dengan URL tersebut.
3. Deploy folder ini ke GitHub Pages (lihat `PANDUAN-INSTALASI-MANDIRI.md`).
4. Jalankan fungsi `setupAppEnvironment()` di Apps Script Editor **sekali saja**
   untuk membuat Spreadsheet database + folder Drive + user Superadmin default
   (`admin` / password **acak**, tampil sekali di log eksekusi — **wajib diganti
   setelah login pertama**, lihat `PANDUAN-INSTALASI-MANDIRI.md` Bagian 1A & 4).
5. Punya data dari versi v1 (GAS Webapp) lama? Lihat Bagian 5 panduan instalasi
   untuk memindahkannya lewat menu **Pengaturan → Migrasi Data (v1)**.

## Catatan penting

- Versi ini (REST, `APP_VERSION 2.1.0-rest`) memiliki **database terpisah**
  dari versi GAS Webapp (`v1.0.0`) yang dibangun sebelumnya — kredensial user
  tidak saling kompatibel antara kedua versi (gunakan modul migrasi untuk
  memindahkan data, bukan menyalin kredensial).
- Autentikasi menggunakan token HMAC stateless (bukan session server-side),
  mengikuti pola `gas-instant-ux-pro` agar aman dari batas 500KB Script Properties.
- Semua rahasia (kunci sesi, hash password) disimpan di Script Properties
  mengikuti pola `gas-rahasia-script-properties` — tidak ada literal rahasia
  di kode atau Sheets. Password tidak pernah disimpan, hanya hash+salt per akun.
- `setupAppEnvironment()` bersifat idempoten (aman dijalankan ulang, lihat `gas-scale-turbo`/`gas-rahasia-script-properties` R10) — tidak akan membuat database/rahasia ganda.
